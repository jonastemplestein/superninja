> SUPERSEDED (R3, 27 Sep): the Baron is fought ONLY in the final battle at Muddle Castle (Jonas: "the final, final battle with really hard words always"). Any "Baron Muddle, first round" below is historical; see docs/MIDGAME_ENDGAME.md §R.3.

# Judge's report: would a six-year-old love it for months?

**27 September 2026. One judge, one lens.** Would a 6–7-year-old (Year 1–2) find the middle and end game exciting, and a good challenge for months? Do the bosses make sense and feel epic? Would a child who has done the pre-school worlds feel that the game grows up with them?

**What I judged:** [MIDGAME_ENDGAME.md](../MIDGAME_ENDGAME.md) (called "the spec" below) and the three inputs in this folder: [audit.md](audit.md), [prior-art.md](prior-art.md) and [sw-y1y2.md](sw-y1y2.md). The spec names a BUILD_PLAN, a MARKETING_PLAN and a PLAYTEST_PLAN, but none was in `docs/midgame/` when I judged, so they aren't scored. I did not play production again. The audit's production evidence (`playtest/runs/midgame/`) is thorough, and I looked at two of its shots (`boss-w6-baron/00-battle-pie.png` and `longword-sim/5-multiplication.png`). Sensei's and the Baron's current lines come from `src/content/lines.ts`, and the boss scales from `src/content/worlds.ts`.

---

## 1. Verdict

**7 out of 10 for a six-year-old, and it could be a 9.** As a teaching design the spec is excellent. It answers Jonas honestly: the panda is the right first boss, *station* comes in Year 2, and *magician* is a stretch. It gives the child real work for two years (spelling choice, syllables, sentences, proofreading), and its best ideas are the ones children of this age love most: collecting things that evolve, belts they can show at school, a villain whose muddles they get to fix, and a fast lane where they beat old bosses.

It is thinner on the thing my lens asks about. The spec says a lot about what each land teaches and little about why a child would want to go there. It never says how many weeks the game lasts for a child who plays every day. Three moments could make a struggling child feel beaten at the very moment they win: the imp's "You missed this one!", the missing stripe and a finishing blow that isn't the last thing that happens. Most of the fixes are small, and §3 lists them.

**Does it grow up with the child?** Mostly, yes. Stickers give way to word cards and plain belts to striped ones, the map moves from an island to the sky and then to the villain's own islands, the bosses get bigger ideas, and the Baron changes from a pantomime villain into someone with a reason. The one thing that doesn't grow yet is Sensei's voice, and a seven-year-old notices that first (must-fix 7).

---

## 2. Scores

Each score reflects only my lens: exciting, a good challenge for months, bosses that make sense and feel epic, growing up with the child. A section written mainly for grown-ups is scored on how well it turns into moments the child will actually have.

### MIDGAME_ENDGAME.md

| § | Section | Score | Why |
|---|---|---|---|
| 0 | The short version | **8** | Clear, honest answers to Jonas. The "each boss fights with its land's hardest code" climb is exactly the right answer to "the boss of lame sounds". But nothing in it describes what a child *does* in a Year 1 week |
| 1.1 | Four maps and a Library | **8** | The story has somewhere to go: up the Rainbow Bridge, across the sea, into the villain's own islands. A six-year-old can see how far they've come |
| 1.2 | Map by map, land by land | **6** | The lands are listed by their units, with no hooks. We learn what Moon Marsh teaches but not what happens there, who lives there or what the big moment is. Names that hold their sound (Cloud Town) are clever |
| 1.3 | Year 1 and Year 2 targets | **7** | For grown-ups. What matters for the child is that each target is a boss the child can actually beat |
| 1.4 | Game types belong to maps | **7** | Games retiring and arriving is a real "you're older now" signal. The Sky Isles get about eight new games; the Muddle Isles get three or four, and most of those are tile-building again, so Year 2 may drag in the middle |
| 1.5 | School entry, "we assume you know" | **8** | "You knew that sound already!" with a petal flying home is a big confidence boost. But "You go to big school" is a Reception phrase, and a seven-year-old in Year 2 will wince at it |
| 1.6 | Catch-up | **8** | The child never has to look for a gap: it's a magic door. The guardian's challenge (six Reception bosses in about twelve minutes) is the fun lane, a power fantasy that is also a placement check |
| 1.7 | Placement, Jump ahead, keeping in step | **4** | Going at their own pace (the default) with the frontier moving on "pass or not" means a keen child clears Year 1 in weeks (§3, must-fix 1). "Stay close to school" means weeks of a gate marked "Soon". Neither lasts for months |
| 1.8 | Navigation and journeys | **8** | Journeys of 10 s or less, one glowing thing, the Petal Ship chasing the balloon. The overworld is right for this age |
| 1.9 | The weekly word list | **7** | Their own school words are the most useful thing in the game for a Year 1 child, and "Ninja Vanish" is a name that sells itself. But the scroll comes before the adventure every day with no reward in the game world, so it will feel like homework |
| 2.1 | The panda | **9** | Squash, then pull the sounds apart: a proper first boss. Right answer, and well argued |
| 2.2 | The story | **7** | The Baron's reveal ("I never could read the long words") is the emotional high point of the whole design. But the Baron is missing for five lands in each map, the stories don't carry the plot, and saves that have already seen him say sorry aren't handled |
| 2.3 | What every boss is | **5** | The phases and the segmented bar read well. But the knockout happens before the last phase, the imp takes gems at the moment the chest opens, and the signature moves break the spec's own lag rule, which turns them into guessing (must-fixes 2 and 3) |
| 2.4 | The boss roster | **7** | Eight strong ideas, and five that are "pick the right gem from a pile" in different costumes. Seven bosses also use the same "reads it wrong" gag. The first Year 1 boss (a magpie) is smaller than the last Reception boss (a troll). Graded boss by boss in §4 |
| 2.5 | Three bosses in detail | **7** | The Magpie's script is good. The final battle is a quiz of greatest hits rather than a showdown, and at about 8 minutes (my count) it runs longer than the 6 stated |
| 2.6 | After the boss | **6** | The journey is good. The lair is a good second chance, but its timing and wording make the victory feel smaller (must-fix 2) |
| 3.0 | Shared parts (carriages, slider, rungs) | **8** | The rung ladder is the right engine for "a good challenge for months": each word gets harder on its own schedule. The slow tortoise and fast rabbit as the spelling voice and the talking voice are elegant |
| 3.1 | The Syllable Train | **7** | Slicing the carriage is the best moment in the spec, but the child only watches it until Autumn Orchard. A train is young for seven, and odd in the middle of a boss fight. It is also a different creature from the wyrms and cards that long words become later (idea N1) |
| 3.2 | Gem Choice | **7** | This is where Year 1's real challenge lives. The petal opening into a fan of gems is lovely. Choosing from 7–12 rivals needs the lag rule or it becomes guessing |
| 3.3 | Special endings, *magician* | **8** | "Magician has another word inside it… magic" is a real discovery for a seven-year-old. The gold bracket is clear. It comes only after the game's main story ends, which is honest |
| 3.4 | Sound Detective on the maps | **6** | Right in the stones. Overused as a boss move |
| 3.5 | Dictation Scroll | **6** | Necessary, and it's the least game-like thing in the spec. The ninja star as a full stop is a nice touch. Year 2 sentences of 6–9 words, built tile by tile, are long for a six-year-old's patience |
| 3.6 | The Baron's Muddled Notes | **9** | The best fit of story and mechanic in the spec. The villain is called Muddle, and children love catching a grown-up's mistakes. The guard against misspellings sticking is right |
| 3.7 | Sound Twins | **7** | The picture comes alive (the ship sails on the sea). Small, and good |
| 3.8 | Four smaller games | **7** | Alien Words is great, and the aliens should be kept as pets (idea N6). Seek the Sound is good, and the grown-up's Speed Read is sensible |
| 4 | Content | **6** | Two stories per land is thin for months of play, and they aren't plot chapters. The content bill is big enough that lands could ship thin, which is how today's "same 45 words" boredom happened (audit §8) |
| 5.1 | Belts | **9** | Real karate belts, earned by checks, stitched in silver for starters, with a certificate to take to school. A six-year-old understands this at once |
| 5.2 | The Word Scroll | **9** | Cards that evolve by spelling from memory, rarer the longer the word, and *multiplication* legendary: exactly right for this age. The creature needs a name the child can read (must-fix 6) |
| 5.3 | The World Flower | **7** | "This year's flower" gives a goal of the right size. The flower is a quiet goal for a seven-year-old, so belts and cards carry more of the excitement |
| 5.4 | Coming back each day | **7** | Stamps and no broken streaks. Sound, but standard |
| 5.5 | Reasons to replay | **8** | Crowns from rematches, guardian challenges, and new ninja moves for each idea (carriage kick, gem flip, lens throw). The moves are the clearest sign that the game grows up |
| 5.6 | What we won't do | **9** | Right, and parents will trust it |
| 6 | Changes and planner | **6** | Old saves are handled for stars but not for the story (must-fix 5). The build order is sensible |
| 6.5 | What the marketing can show | **8** | "A claim ships with the slice that makes it true" is the right rule |
| 7 | Decisions and open questions | **7** | M11 (going at their own pace by default) is the one I'd challenge. Nothing decides how Sensei's voice changes for older children |
| – | **The spec overall** | **7** | |

### The three inputs

| Doc | Score | Why |
|---|---|---|
| [audit.md](audit.md) | **9** | The best child's-eye evidence of the lot: 23 "two letters, one sound"s in 32 minutes, the 45 words, the Baron loop (10 fights in 70 minutes), and a final boss easier than the Serpent. It's the reason the spec exists |
| [prior-art.md](prior-art.md) | **8** | Strong on what keeps 6–7-year-olds coming back (§6) and what fails (§7), and most of its ideas were adopted. One slip: it answers "Is the panda the boss of lame sounds?" with "Yes" and says "first ten sounds"; the panda has eight |
| [sw-y1y2.md](sw-y1y2.md) | **8** | Authoritative. From my lens, its most useful line is the five axes of escalation (§9.1): more spellings, spellings with several sounds, longer words, schwa, endings. That list is what "grows up with them" means in code |

---

## 3. Must-fixes, ranked

### 1. Say how long the game lasts, and make the weeks between bosses an adventure (§1.2, §1.7, M11)

**What's wrong.** The spec never estimates play time for a child who plays every day. By its own numbers (Year 1 is six lands of 10–16 stones at 3–4 minutes each), the Sky Isles are about 4½ hours of stones. With the planner's review in between, call it 7–9 hours. At the planner's 15–20-minute sessions, a daily player finishes Year 1's map in **about 5–7 weeks**, by the first half-term of Year 1. The frontier then moves on at each boss "pass or not" (§6.3 item 7), and with no mastery gate the child reaches Year 2 code while school is still on EC5, with spellings Sounds~Write expects to take 5–7 units to settle. That is the prior art's "no mastery gate" failure (prior-art §7.2), and it ends in too-hard items and tapping through. With "Stay close to school", the same child spends about five weeks of every six and a half looking at a gate marked "Soon".

**Why a six-year-old cares.** Either they hit a wall of words they can't spell, or they're bored. Both lose them before Christmas.

**Fix.**
- Add a table to §1.2 with each land's play time: stones, practice days and weeks at 15 minutes a day. Aim to keep a daily player inside each land for about 2–4 weeks.
- **Gate a new land on practice days, and show the gate as something the child builds.** The bridge to the next island gets a plank on each day the child practises the land's words (a word only moves up a rung once a day, §3.0.3, so days are the honest unit). The Petal Ship's sails fill one panel a day. A land opens after its boss *and* when its key words have reached R3 across enough days. This is Brain Age's "unlock by days" (prior-art §2.11) in the story's own terms, and it gives "Soon" something to look at.
- **Fill the days between stones with land-flavoured practice, not with "review"**: the guardian's minions as short battles over the child's due words, a lair, cards to hatch, a guardian that turns up at the halfway stone (a 90-second skirmish that uses only its signature move). A six-year-old needs a boss-shaped moment about once a week, and one every 6–7 weeks is too far apart.

### 2. Make every boss victory a pure win (§2.3, §2.5.2, §2.6, §5.1)

**What's wrong, three times over.**
- **The knockout isn't the end.** In the Magpie's fight the big attack "knocks the Magpie off its perch" in phase 4, and then phase 5 is a dictated sentence (§2.5.2). The Baron's final battle does it the other way round: the full stop is the final kick (§2.5.3).
- **The imp takes gems when the chest opens,** saying "Ha! You missed this one!" (§2.3). The child's first sight of their prize is a thief who calls out their mistakes.
- **The belt stripe is held back** below 75% (§5.1). The child who most needs the win walks away without it.

**Fix.**
- **One rule for every Sky and Muddle boss:** the long word staggers the boss (it drops to one knee and the chest's lock cracks), and the dictated sentence is the finishing move. Each word built flies at the boss as a hit, and the full stop, the ninja star, is the knockout. That makes the dullest item the most exciting one, as the Baron's final battle already does.
- **The imp grabs a gem the moment Sensei helps with a word,** during the fight, where the cause is clear. The chest opening is then all celebration. The imp taunts about itself, never the child: "Ooh, shiny! Mine!", and Sensei says "The imp's got one. We'll get it back."
- **The stripe is always sewn on at the boss:** in colour at 75% or more, and in silver thread below it, turning to colour in the lair. That reuses M18's "stitched in silver" language, so the child learns one idea: silver means "not shown yet", never "failed".

### 3. Signature moves must not turn into guessing (§2.3 against §2.4)

**What's wrong.** §2.3 says rivals come "only for spellings taught four or more units back", but most signature moves quiz the land's newest code with many rivals:

| Boss | Signature | Code quizzed | Units back at the check |
|---|---|---|---|
| Thunderbird | chooses < er ir ur or > | /er/, EC6 | about 2 |
| Hoot Owl | < igh y ie i > in the dark | /ie/, EC11 | 1–2 |
| Circus Lion | catches < c ce s ss st se > | /s/, EC16 | 1–2 |
| Scarecrow | 7 /or/ gems | /or/, EC19 | 2–3 |
| Gnome King | < n kn gn > | /n/, EC33 | 1 |
| Roaring Boar | 5 more /or/ gems (12 in all by then) | /or/, EC43 | 2 |

A six-year-old choosing one of seven spellings for a word they met last week is guessing. Guessing is the first thing children learn to do in games like this (prior-art §7.1).

**Fix.** A signature on the land's newest code is a **reading or recognition move**: who read it right, Sound Detective, or picking a gem with the word peeked (R2), with no more than three rivals. Choosing from many spellings belongs to code four or more units back, as §2.3 already says. Add a column to the §2.4 table giving each signature's code and its lag, so the rule can be checked.

### 4. Give each boss its own verb; retire the pile of gems and the reused gag (§2.4)

**What's wrong.** Five signatures are "pick the right gem from a pile" in different costumes: the Thunderbird's Rumble, the Hoot Owl's Night flight, the Circus Lion's Juggle, the Scarecrow's Crow swarm and the Roaring Boar's Roar. Seven bosses use "it reads the word wrong, then Sound Detective": the Magpie, Thunderbird, Hoot Owl, Scarecrow, Captain Parrot, Giant and Ghost Captain. By the fourth boss a child knows the joke. An epic boss is one whose move you remember.

**Fix.** Give each boss one physical verb that the child performs, and use Sound Detective as a boss move at most twice per map. §4 has a suggestion for each weak boss. The Roaring Boar matters most: its land introduces *-tion*, the first special ending, so the ending should be the Boar's signature rather than yet another /or/ pile.

### 5. Settle the Baron's story for saves that have already seen him reformed, and keep him on screen (§2.2, §6.1)

**What's wrong.**
- Today's finale has the Baron say "Sorry for all the muddle" (`baron_final`). Jonas's own children have very likely seen it. From slice 1 on, the Sky Temple's boss "ends with the Baron's escape" (§6.4), and the Baron fights again at Star Dunes and Muddle Castle. §6.1 handles old saves' stars and new stones, but not the story.
- In the new design the Baron himself appears at Star Dunes and Muddle Castle and hardly anywhere else. The lieutenants' taunts replace his cut-ins, and the audit lists those cut-ins among the few things that work for this age (audit §8).

**Fix.**
- **A once-per-save "It was a trick!" scene** for saves with the finale seen, shipped with slice 1: the balloon rises and the Baron laughs, "Sorry? Mwa-ha-ha! I only said that to get away with the rarest gems!" Six-year-olds love "he was only pretending", and the real apology at the end of Year 2 then means more.
- **Keep the Baron in every land.** He introduces each guardian, as `baron_w1`–`baron_w5` do today, his balloon floats one land ahead on the overworld map, and the petal imp is openly his.

### 6. "Wyrm" is a word the target reader can't decode (§2.4, §2.5.4, §5.2)

**What's wrong.** "Wyrm" uses < y > for /er/, which the game never teaches. It will appear on every card in the Word Scroll and on every Library boss. In a phonics game whose land names are built to hold their sounds (§1.2), the long-word creature is the one name a child can't read.

**Fix.** Rename it. **Word Dragons** fits best: dragons hatch from eggs, which is the card ladder's first step (egg, hatchling, young, master, §5.2). **Wordworm** also works and carries a taught spelling: < or > as /er/, twice, from EC6. Either name should be used everywhere a long word is a creature (idea N1).

### 7. Give Sensei a voice that grows up (not in the spec; audit §8)

**What's wrong.** The audit counted "It's two letters, but it's one sound" 23 times in 32 minutes, and "A dojo is where ninjas practise!" said to seven-year-olds. The spec designs full, recap and short forms for each game, but no rule for how Sensei talks to a 6–7-year-old. `tv_school_know`, "You go to big school, so you know lots of sounds already", is shown to Year 2 children too (§1.5).

**Fix.** Add a short rule set to §3 (or to TEACHER_SCRIPT):
- On the Sky Isles and the Muddle Isles, a school starter counts as having heard the Initial Code's concept lines ("two letters, one sound", "A dojo is…"). A concept line plays once per land at most, and on the Muddle Isles only when a mistake calls for it.
- On a replay, no more than about 5 s of talk before the child's first action.
- A Year 2 version of the lines that assume Reception: for example `tv_school_know_y2`, "You've been learning sounds at school for a whole year, so you know loads already."
- A playtest check: the seconds of Sensei per minute of play, for each land, which should fall from map to map.

### 8. Give every land a hook, not just a list of units (§1.2)

**What's wrong.** Each land is described by its units, lags and boss. None says what the place is like, what the Baron did there, what new thing the child does there, or what its big moment is. Setting and story are what children of this age remember (prior-art §6.3).

**Fix.** Give each land a five-line card: **the place, the trouble (what the Baron did), the new verb, the set piece, the boss.** Three examples:
- **Circus Island.** The big top's sign has lost its letters, and the Circus Lion juggles the /s/ gems. The set piece is a tightrope of syllables (*ca·mel, pen·cil, ta·ble*), walked one syllable at a time. The new verb is walking the rope.
- **Giant's Gorge.** Every UK six-year-old knows Jack and the Beanstalk. The child climbs the beanstalk syllable by syllable to reach the Giant, whose footsteps are syllables ("Giant steps", §2.4). *mul·ti·ply* is the top leaf.
- **Muddle Castle.** The Baron's letters are everywhere, muddled on the walls, and the child unmuddles them on the way to the throne room (Muddled Notes as the land's own verb).

The Muddle Isles in particular need a new verb in each land (§1.4), because five of their six lands are otherwise Gem Choice with more rivals. §5 lists some ideas.

### 9. Make the stories the plot chapters (§3.8, §4.1)

**What's wrong.** Each land has two decodable stories of 150–400 words with questions, but nothing ties them to the adventure. Reading to find out what happens next is the most honest reward for reading that a game can give.

**Fix.** A land's two stories are its chapters. The first, near the start, says what the guardian did. The second, before the Dictation Scroll, says where the chest is hidden. The boss drops the next land's first chapter (audit §11.5: "a boss drops a story, not a sticker"). The final battle's muddled letter (§2.5.3) can then quote the chapters the child has read.

### 10. Make the final battle a finale, not a quiz of greatest hits (§2.5.3)

**What's wrong.** Its five phases (a letter, every petal, two ways, long words, a sentence) are a review across the year. They're good for the check, but after two years of play a showdown needs callbacks, a transformation and a sense of scale. My timing is about 8 minutes, not 6: 90 s for the letter, 80 s of Gem Choice, 60 s of Sound Detective, about 2 minutes for two long words at syllable level, a *multiplication* encore of 60–90 s, and about 2 minutes for a seven-word sentence.

**Fix.**
- **The reformed guardians come back.** In each phase, one of the beaten lieutenants helps the child against the Baron: Captain Parrot squawks the muddled word aloud, the Giant holds the door, and the Magpie drops a stolen gem back into the child's bank. Six-year-olds adore "everyone you've met comes to help".
- **The throne of muddled letters stands up** and becomes the Baron's last form in phase 4.
- **Make the last sentence five words at most.**
- **Keep the multiplication encore**, as the literal last blow for a child on a streak.

---

## 4. The bosses, one by one

"Strong" means a move a child will remember and understand at once. "Weak" means a re-skin of Gem Choice or the reused gag.

| Boss | Signature | Verdict | Fix, or why it works |
|---|---|---|---|
| Sumo Panda | Squash | strong | the blob wobbles, and each tile pops it back into shape |
| Oni | Mirror trick (b d p) | fine | "listen past them" is passive: let the flipped tiles jiggle so they're visibly tricks |
| Yeti | Freeze | strong | breaking the ice with the double tile is "two letters, one sound" as a physical act |
| River Serpent | Gobble | strong | putting the swallowed sound back is Sound Swap with a monster |
| Shadow Knight | Shield split | strong | < s > + < h > on the bank, and the child chooses < sh > |
| Bridge Troll | Toll | **best on the Island** | every UK child knows Three Billy Goats Gruff; a toll paid "in the right gem" is the right frame for choosing by position. Give him "Who's that spelling over my bridge?" |
| Magpie | Gem Grab | **best in Year 1**, too small | a thief of shiny things steals the vowel gem: perfect. But it follows the Troll, so make it huge: **the Sky Magpie**, with a nest the size of the temple roof. Grow boss scale by map (every boss is `scale: 1.5` in `MONSTER_INFO` today): about 1.5× on the Island, 1.8× in the sky, 2× on the Muddle Isles, and the final Baron fills the screen |
| Thunderbird | Rumble (a pile of /er/ gems) | weak | make it a reading move on /ow/: storm clouds carry words, and the child pops each by reading it right (*cow* or *snow*?). The /er/ choice goes to the spell phase, lagged |
| Hoot Owl | Who-who; Night flight | fine | keep Night flight (gems glowing in the dark), but only three of them, with the word peeked |
| Circus Lion | Juggle; Tightrope | Tightrope strong, Juggle weak | make the Tightrope the signature: walking /l/ words syllable by syllable |
| Scarecrow | Crow swarm (7 /or/ gems) | weak | each crow carries one gem and lands on a word; the child shoos away the crows whose gem doesn't belong ("Does *saw* have this gem?"). Recognition, three crows at most |
| Baron, first round | the first muddled note; alien pets | strong | the first muddled note is the perfect villain move. Let the child keep the alien pets (idea N6) |
| Captain Parrot | Parrot talk | strong | a parrot repeating your word with a swapped gem is proofreading that makes sense to a child |
| Gnome King | Hide and seek (_ nee) | strong, with a peek | the gnome shows the word, then hides its start: < kn > and < gn > are one unit back |
| Giant | Giant steps | **best in Year 2** | footsteps as syllables, and the beanstalk to climb (must-fix 8). Make the Giant the Year 2 midpoint spectacle |
| Ghost Captain | Now you see it | fine | the fading must wait for the child, never time them |
| Roaring Boar | Roar (a pile of /or/ gems) | weak | make **-tion** the signature: the roar blows the ending off *station*, *motion* and *potion*, and the child sets the gold bracket back on. The first special ending becomes a boss's power, not a footnote |
| Baron, final battle | five review phases | needs a finale | must-fix 10 |
| The wyrms | one segment per syllable; the head is the ending | **best in the endgame** | a long word as a long creature is the clearest picture in the spec. Rename them (must-fix 6), and make the Great Bookwyrm enormous and different, not a recolour |

---

## 5. The best ideas: keep and protect

1. **The Baron's Muddled Notes** (§3.6). The villain's name becomes the mechanic, and the child fixes a grown-up's mistakes. Film it.
2. **The Magpie's Gem Grab** (§2.5.2). The clearest boss move in the spec: *r _ n*, and the child puts the gem back.
3. **The guardian's challenge as the fun lane** (§1.6.2). A Year 1 child beats six Reception bosses in about twelve minutes and watches the flower fill. It is placement without a test.
4. **Belts from checks, silver stitching for starters, printable certificates** (§5.1). Children will take these to school.
5. **Word Scroll cards that evolve by spelling from memory**, with rarity set by length and *multiplication* legendary (§5.2).
6. **The Baron's reveal and the Library** (§2.2). "I never could read the long words. They muddled me." The child becomes the helper, and the endgame has a reason.
7. **Long word = long creature; "the longer the word, the bigger the kick"** (§2.4, §2.5.4). The Giant's steps and the wyrm's segments.
8. **"You knew that sound already!"** (§1.6). Ghost petals flying home in the first sessions of a school starter.
9. **The root card**: "A magician does magic. So magician keeps the spelling of magic." (§3.3). A real aha for a seven-year-old, and good marketing.
10. **A new ninja move for each idea** (§5.5): the carriage kick, the gem flip and the lens throw. The ninja visibly grows with what the child knows.
11. **The Bridge Troll's toll** (§2.4).
12. **Ninja Vanish**, both the name and the smoke ball (§1.9.5).
13. **Land names that hold their sound** (§1.2): "Listen… Cloud Town. Can you hear /ow/ twice?"
14. **One glowing thing at every zoom level** (§1.8). The child never needs a menu.

### New ideas from this lens

- **N1. One creature for long words.** The Syllable Train, a boss's big attack, the Word Scroll cards and the Library bosses become the same thing: a Word Dragon that grows a segment for each syllable you build and flies off when the gap closes. The coupling carriages already work this way, and a train is young for seven and odd in a boss fight. A two-syllable dragon is a hatchling and a five-syllable one is a monster.
- **N2. Let the child do the slice from the start.** At sound level, Sensei still says how many syllables there are and a sparkle shows where each cut goes. The child makes the sword swipe, which is still Lesson 11 (Sensei splits, the child cuts) with the child's own hands. Only choosing where to cut waits for syllable level.
- **N3. A "flawless" finisher.** A boss beaten with no help gets its own finishing animation and a gold portrait straight away, not only after a rematch. It is a positive stake that seven-year-olds chase.
- **N4. The weekly scroll powers the adventure.** Each day's scroll charges the ninja's special move for that day's battles (a glowing headband), and a practice test with every word right earns a charm for the next boss. The school words then feel like training, not a chore before play.
- **N5. The practice-day bridge** (must-fix 1): planks, sails or stepping stones that appear once for each day of practice.
- **N6. Keep the aliens.** Each alien the child reads right joins a small crew, as Teach Your Monster's trickies do. Their names are the child's own pseudo-words, and it's good practice for the Phonics Screening Check.
- **N7. A new verb for each Muddle land:** Echo Island (fix what the echo says back wrong), Gnome Hollow (dig up the hidden start of a word), Giant's Gorge (climb the beanstalk), Dolphin Bay (a Ninja Run underwater for /f/ spellings: < ph gh ff >), Roaring Peaks (special endings), Muddle Castle (unmuddle the walls).

---

## 6. For the marketing and playtest plans (when they are written)

**Marketing.** The clips that will make a six-year-old say "I want that" are also the ones that prove Year 1 and Year 2 to a parent:
- the Magpie snatching the gem from *r _ n*;
- a Word Dragon (or wyrm) losing a segment per syllable of *mul·ti·pli·ca·tion*;
- the Baron's note "I wated for the trayn", fixed;
- *magic* → *magician* with the root card;
- a green-belt certificate with real words on it.

The first three need slice 1 or later (§6.5's rule). Don't film a boss until must-fix 2 is in, or the clip ends with an imp saying "You missed this one!"

**Playtesting.** Measure these for every land, with the bots and a real Year 1 child where possible:
- the proportion right first try, aiming for 70–85% (below that is guessing, above it is boredom);
- the seconds of Sensei before the first action on a replay (aim for 5 or fewer);
- fast repeated taps on the gem fan, a sign of guessing;
- the number of days a daily player spends in each land (must-fix 1);
- the time between boss-shaped moments, which should be about a week at 15 minutes a day;
- whether the boss's knockout is the last thing on screen before the chest.
