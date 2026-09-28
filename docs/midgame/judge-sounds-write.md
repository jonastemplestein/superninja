> SUPERSEDED (R3, 27 Sep): the Baron is fought ONLY in the final battle at Muddle Castle (Jonas: "the final, final battle with really hard words always"). Any "Baron Muddle, first round" below is historical; see docs/MIDGAME_ENDGAME.md §R.3.

# Judge: is it faithful to Sounds~Write, the National Curriculum and the Phonics Screening Check?

**27 September 2026. One lens only:** is the midgame and endgame design faithful to Sounds~Write (the polysyllabic routine, the /sh/ spellings, schwa, spelling choice, the official unit order) and to the Year 1–2 National Curriculum and the Phonics Screening Check (PSC)? Is anything taught wrongly?

**Read:** [../MIDGAME_ENDGAME.md](../MIDGAME_ENDGAME.md) (the spec, "§" below), [sw-y1y2.md](sw-y1y2.md), [audit.md](audit.md), [prior-art.md](prior-art.md).

**Checked against the sources, not only the research summary:** the official 2026 Extended Code progress checks (which unit each check follows, and what each one reads and dictates), the official PSC guidance for England (09.2024), the dossier's Lesson 6 and 7 pages, `docs/MULTI_SOUND.md` (the try-safe rule) and `src/content/sw.ts`. All of them are in the git-ignored `assets-src/sw-sources/`. This file quotes only a few words from them, and example words are a few single words per point.

---

## Verdict

The skeleton is right, and in places it is excellent. The unit order, the lands' units and the progress check that closes each land all match the official 2026 tables: I checked every one of the 18 lands. The Syllable Train follows Lessons 11–14 almost line for line. The /sh/ endings are coded as Sounds~Write codes them (three sounds, one sound per tile). Schwa and the spelling voice are handled the Sounds~Write way. The answer on *magician* matches the National Curriculum.

Four things keep it from being faithful:

1. **The PSC.** The Sky Isles follow the official order but ignore Sounds~Write's own PSC guidance. So a Year 1 child who plays on pace meets < ar >, < oi > and < oy > after the check, and the practice check falls in the check's own week.
2. **The bosses' signature moves.** Eight of the twelve Year 1–2 bosses make the child spell the land's newest code. The official check only dictates code at least two units back, and the spec's own rules say the same.
3. **The long-word strand in Year 1.** It runs one or two checks behind the official check words from Cloud Town to Autumn Orchard, although the spec says it matches them.
4. **The end-of-year claims.** §1.3 claims National Curriculum targets that no land teaches (-ed, -er/-est, un-, the days of the week, and Year 2's -ment/-ness/-less), and §0.1 gives three-syllable words as examples of "four- and five-syllable" ones.

Eight smaller things would teach a child something false (must-fixes 6–10).

**Overall: 7 / 10.** It rises to about 9 with the ten must-fixes below. None of them changes the structure.

---

## Scores

| Section | Score | Why, in one line |
|---|---|---|
| **§0 The short version** | 7 | The panda answer is right, and so are the honest *magician* timings (-tion in Year 2; -cian and -sion in Years 3–4). But "Year 2 adds four- and five-syllable words" is illustrated with four three-syllable words, *multiplication* (-ation, Years 3–4) is sold as Year 2, and "blind dictation with rivals comes four units later" mixes up two different lags |
| **§1 The progression map** | 6 | |
| · §1.1–1.2 Maps and lands | 7 | Units, order, spelling units and check numbers are all correct (verified land by land). No PSC adjustments; the Year 1 long-word column lags the official checks; < sc > comes before the PSC |
| · §1.3 Targets | 5 | Claims -s/-es/-ing/-ed/-er/-est spelling at the end of Year 1 with no land that teaches them. "Alien words at PSC level", but < ar oi oy air > aren't taught by June. Year 2's -ment/-ness/-ful/-less/-ly and the days of the week are missing |
| · §1.4 Game types by map | 8 | Sound Swap kept to Initial Code and nonsense words in review, sorting from the Bridging Unit, special endings from Year 2: all faithful. PSC practice is placed too late |
| · §1.5–1.8 School entry, catch-up, placement | 8 | Half a term behind, at the first stone of the land that holds the start unit (right for every year and term). "Assumed code counts as taught, with a prior, not evidence" is sound |
| · §1.9 The weekly list | 8 | Special words are practised the Sounds~Write way (Sounds~Write's improved look, cover, write, check; one or two a week; the teacher takes responsibility for the untaught part). Wording and dictation details below |
| **§2 Bosses** | 6 | The structure is excellent: every land-end check number is right, and scoring counts independent first tries only, with a spelling counting only if the whole word is right. But the signature moves spell code ahead of the check's lag, the lag rules contradict each other, and several moves teach something false (the troll's position rule, *greet*, *booook*, *strap → sap*, < x >) |
| **§3 New mechanics** | 8 | The Syllable Train, special endings, Gem Choice (Lesson 7), Word Detective (Lesson 15), Seek the Sound (Lesson 9), the Dictation Scroll (Lesson 4a) and Ninja Vanish are all faithful. Issues: the fan in the dojo's word puzzle isn't Lesson 6; there is no "write it again" step; the root clue misleads for *addition*; Alien Words' two readings can mark a valid reading wrong |
| **§4 Content** | 7 | The "shun" table's codings, sound counts and splits are right, and so are the split rules and the fix list. Some special words graduate while part of them is still untaught; the Year 1 long-word lists lag; Year 2's suffix words are missing; < pe > is filed under EC1 |
| **§5 Keeping 6–7-year-olds coming back** | 8 | Little risk from this lens. No reward for help, only first tries count. "75% … Sounds~Write's move-on rule" is misattributed (see S1) |
| **§6 Changes, planner, build order, marketing** | 7 | `bossCheck`'s rules (read ≥1 back, spell ≥2) are right but forbid what §2.4 authors. The planner has no tangential-teaching mechanism, and it needs one for the PSC, -ed and special words. "A claim ships with the slice that makes it true" is exactly right |
| **§7 Decisions and open questions** | 7 | M12 (the four-unit rival rule for every spelling) needs splitting into two lags. There is no decision on the PSC adjustments |
| **§8 Sources** | 9 | Clear, with local and not-for-publication sources marked |
| *Research:* **sw-y1y2.md** | 9 | Thorough and accurate. The check table, the lags, the shun family and the error scripts are right. Its NC–Sounds~Write mismatch list (§7.1, §7.5) misses -ed (EC28/47 against NC Year 1) and < ph > (EC40 against NC Year 1). It records the PSC guidance in its tables but doesn't carry the re-sequencing into §9, and the spec inherited that gap |
| *Research:* **audit.md** | 8 | Its Sounds~Write claims are accurate, including the tileBank filter, the missing lags and the Yeti's "no < l > < ll > choice yet". Its land table (§11.2 B) and single gold tile (§11.2 D) are superseded by the spec, correctly |
| *Research:* **prior-art.md** | 7 | Good map of who teaches the "shun" words when. "The panda is the boss of the first ten sounds" should be eight (a i m s t n o p). Idea 4's single "tion" tile breaks one sound per tile (the spec fixed it). Idea 1's "spelling thief" shows misspellings in Year 1 autumn (the spec added guards) |

---

## Must-fixes

In order of harm. Each has **where**, **what's wrong** and **the fix**.

### 1. Apply Sounds~Write's own PSC guidance to the Sky Isles, and move the practice check before June

**Where:** §1.2 (Sky Temple to Star Dunes), §1.4 (Alien Words), §3.4 (< ch > in Star Dunes), §3.8 (the practice check), §6.3.

**What's wrong:** Sounds~Write's PSC guidance (09.2024) says all the code for the check should be taught by the end of the spring term. It adjusts Year 1 to get there. The spec follows the plain official order and applies none of it. So, on pace:
- /oy/ (EC23) and /ar/ (EC24) come in Star Dunes, Year 1 summer 2. The PSC's Section 1 uses "consistent vowel digraphs", with < ar > and < oi > named. /air/ (EC20) is only just in time.
- The practice check "in Star Dunes" falls in or after the check week (the week of 8 June 2026).
- < ch > as /sh/ and /k/ is planned for Star Dunes, which is too late.
- < ph > isn't met until Dolphin Bay (Year 2 spring). It is in the PSC and in NC Year 1.
- < sc > (EC16) is taught in Circus Island, before the check. The guidance says to leave it until after, because < s > < c > is a common adjacent-consonant pair in the check.

**Fix:** keep the official unit order (Jonas's decision). Apply the guidance as it is written, as tangential teaching and additions inside units, and log it in DECISIONS as official guidance, not a reorder:
- **Sky Temple:** add < ie > (*chief*) to EC2 /ee/, and < ou > (*mould*) and < ph > (*phone*, *photo*) to EC4 /oe/.
- **Moon Marsh:** add < ou > (*you*) to EC10.
- **By Circus Island (before Easter):** teach, tangentially, < ch > as /sh/ with a Lesson 10 Sound Detective for < ch > (*lunch, chef, school*), < g > as /j/ (*gem*), < s > as /z/ (*hens*) and < c > as /s/ (*cell*). Move the < ch > Sound Detective stone from Star Dunes to here.
- **Before the practice check:** meet < ar >, < oi > < oy > and < air > tangentially. Use one "met early" stone each in Circus Island and Autumn Orchard (the guidance's "consider moving Unit 20 /air/ and Unit 24 /ar/ earlier" and "Unit 23 /oy/ … along with Unit 8"). The full units stay where they are.
- **< sc >:** leave it until after Autumn Orchard's practice check.
- **< er > as schwa:** add it to the Year 1 long words (*farmer, faster, after*), as the guidance says. The official check 22 dictates *farmer*.
- **The practice check** (10 real and 10 alien words) moves to **Autumn Orchard** (Year 1 summer 1). Star Dunes keeps the Baron's alien pets as a Year 2 re-check warm-up.

### 2. No boss spells its own land's newest code

**Where:** §2.3 (phase 2's rule), §2.4 (the signature moves), §2.5.2 (the Magpie), §6.3 item 5, M12.

**What's wrong:** the official checks read at least one unit back and dictate at least two. The spec states this rule (§2.3, §6.3) and then authors signatures that break it. It also sets a stricter rule for phase 2 (rivals only four or more units back), which would forbid moves that the official check itself makes. For example, check 6 dictates the /er/ words *bird, her, turn*, which is exactly the Thunderbird's Rumble. Sounds~Write's founder is blunt that new spellings are not expected in writing straight away.

**Fix:**

(a) **Three lags, named apart** (split M12):
- **Reading:** at least one unit back.
- **Dictation, checks and bosses:** at least two sound units back, with the full bank (R4). Writing is a free choice.
- **Single-word quizzing in ordinary battles:** rival tiles only four or more units back.

(b) **The newest code appears in a boss only as reading:** Sound Detective, or "who read it right".

(c) **Re-point the moves, using each land's check as the guide.** The words in brackets are a few that the official check dictates.

| Boss (check) | Keep | Change |
|---|---|---|
| Magpie (3) | Gem Grab on **EC1** words (*rain*, *play*) | *b _ t* (boat, EC4) and *s _* (EC2) are ahead of the check, which dictates only EC1 and Initial Code words. Use EC1 words only |
| Thunderbird (6) | Rumble /er/ (*bird, her, turn*): it matches the check | – |
| Hoot Owl (9) | Who-who as reading (with accent-safe words, fix 8) | Night Flight spells /ie/ (EC11), which the check only reads. Spell /oo/ (EC10: *June, blue*) or /ow/ (*brown, ground*) instead; /ie/ becomes reading |
| Circus Lion (12) | – | Juggle spells /s/ (EC16), which the check only reads: make it a reading juggle, and spell /u/ (*come, touch*) or /oo/ as in book (*should, full*). Tightrope moves to the Scarecrow |
| Scarecrow (15) | Crow swarm /or/, with the check's kind of words (*born, warm, small*) | Add the /l/ tightrope (*pencil, travel*): check 15 dictates EC18 |
| Baron, round 1 (18) | – | Spell only EC19–23 |
| Captain Parrot (22) | Spelling EC27–28 | The swap uses secure words only (S5) |
| Gnome King (25) | *ho·li·day* | Hide and seek (< kn gn >, EC33) becomes reading. Weak endings (< ar our re >, EC34) are read here and spelt from the Ghost Captain on. Spell /oe/ (*though, mould*) instead |
| Giant (29) | Giant steps; "gem or gum?" as reading | /j/ choice (EC37) moves to the Ghost Captain. Spell /oo/ (*fruit, soup*) instead |
| Ghost Captain (31) | The < gh > reading | /f/ (EC40) and /m/ (EC42) choices move to the Roaring Boar. Spell /j/ and /g/ (*fridge, guess*) instead |
| Roaring Boar (34) | Roar /or/ (*board, taught*) | Add /f/ and /m/ (*phone, thumb*). /k/ as < ch > (EC45) is reading only |
| Baron, final (38) | Phase 2 (*eight, chief, though, earth*) | – |

### 3. Realign the Year 1 long-word strand to the official check words

**Where:** §1.2's long-words column, §4.2's Year 1 table, the big attacks in §2.4.

**What's wrong:** the spec says the strand runs "4–7 units behind … as the official checks do". It does in Year 2, but not in Year 1:
- Cloud Town and Moon Marsh use Initial Code words only.
- Extended Code spellings first appear in Circus Island (*daybreak, painting, rainbow*).
- Autumn Orchard still has *window, yellow* (EC4 spellings).
- It then jumps to *level, report, nightmare* (EC18–20) in Star Dunes.

The official checks start Extended Code long words at check 6. The Handbook's steps 1–6 (Initial Code words) run from EC4 to about EC8 (sw-y1y2 §3.1).

**Fix** (a few official check words per land):

| Land (check) | Long words |
|---|---|
| Sky Temple (3) | steps 1–2 (*sunset, dentist*) |
| Cloud Town (6) | steps 3–6 (*chopstick, splendid, fantastic, lemon*), then EC1–2 words (*daybreak, painting, Sunday*) |
| Moon Marsh (9) | EC1–7 (*window, slowly, ready*) |
| Circus Island (12) | EC8–11 (*about, flower, myself*) |
| Autumn Orchard (15) | EC12–16 (*sometimes, mother, sentence*), and **spelling** the EC18 /l/ words |
| Star Dunes (18) | as now (*level, report, nightmare*) |

The big attacks follow the same table. The Muddle Isles are already aligned.

### 4. Back every National Curriculum claim in §1.3, or drop it

**Where:** §1.3, §1.2, §4.2.

**What's wrong:**
- §1.3 claims that a child spells -s, -es, -ing, -ed, -er and -est at the end of Year 1. No Sky Isles land teaches them.
- **-ed** is a real timing gap between the curriculum and Sounds~Write: < ed > is EC28 (/d/) and EC47 (/t/), both in Year 2, but NC Year 1 has -ed. sw-y1y2's mismatch table misses this.
- NC Year 1's prefix **un-** and "spell the **days of the week**" are absent. The spec puts *Monday* in the post-Year-2 Library, yet *Sunday* is an official check-6 word.
- NC Year 2's statutory **-ment, -ness, -ful, -less, -ly** appear only as *useful*.
- NC Year 2's **/zh/ spelt < s >** (*treasure*, *usual*) is read but not clearly spelt.

**Fix:**
- **Year 1:** make -ing, -er, -est, -s/-es and un- ordinary syllables in the Syllable Train from Cloud Town on. Sounds~Write treats suffixes as common syllables, and its checks use *reading*, *warmer* and *unhook*.
- **-ed in Year 1:** meet it tangentially in dictation sentences, with the teacher taking responsibility ("This is /t/ here"), until EC28 and EC47 teach it.
- **The days of the week:** add them to the Year 1 long-word lists as their code arrives (*Sunday* at Cloud Town; *Monday* after EC14; *Tuesday* after EC21, when check 21 reads it).
- **Year 2:** add the check's suffix words (*payment*, *illness*, *grateful*, *slowly*, *happily*) to the Muddle Isles' lists, and spell *treasure* and *usual* in Muddle Castle.

### 5. Correct the headline claims to Jonas and to parents

**Where:** §0.1, §0.2, §1.3, §2.1 item 4.

**What's wrong:**
- "Year 2 adds four- and five-syllable words (*holiday*, *multiply*, *mechanic*, *character*)": all four are three syllables. The end-of-Year-2 check words (*mechanic, character, chemistry*) are three syllables too.
- The official Year 2 checks reach four syllables only occasionally (*absolutely*, *automatic*), and five never.
- *multiplication* is -ation, which is NC Years 3–4, as the spec's own §4.3 table says.
- "four-syllable words (Giant)", but the Giant's word is *mul·ti·ply*.

**Fix:** "Year 2 reads and spells three-syllable words with Extended Code spellings (*holiday, multiply, mechanic*) and meets its first four-syllable words (*absolutely*). *multiplication* is a five-syllable Year 2 stretch." Keep it as the final battle's optional encore, which the spec already does.

### 6. The Bridge Troll must not teach a position rule

**Where:** §1.2 (the Rainbow Bridge row), §2.4 (Toll).

**What's wrong:** "chooses < c k ck > and < ch tch > by where the sound is (*cat, kit, duck; chip, catch*)" is false for its own examples. *cat* and *kit* both start with /k/. < w > and < wh > don't differ by position at all, and < ch > ends *much* and *rich*. It is also rules talk, which Sounds~Write asks schools to drop. The Bridging Unit teaches with Lessons 6, 7 and 8: build the word from its own tiles, notice the spelling, read, then write.

**Fix:** the toll is "pay the gem **this word** uses". Each word is read first (Lesson 7), and the choice is word knowledge. Sensei may notice a pattern afterwards ("Look, all these words end with… < ck >") but never states it as a rule.

### 7. The root clue must not point the wrong way

**Where:** §4.3 ("the root clue"), §3.3 (the Root Dojo, the Shun Sort), §2.4 (the Shun Wyrm).

**What's wrong:** *add → addition* and *multiply → multiplication* are listed as root clues. The curriculum's own guidance (-sion after d or se) would make *add* predict *addision*. And *optic* is not a word a seven-year-old knows.

**Fix:**
- **-tion** is the usual ending, "the ending most words use". It gets no root clue.
- **The root clue** is only for -cian after a word ending in < c > (*magic, music, electric*) and -ssion after < ss > (*discuss*).
- *optician* is linked by Lesson 15 to *magician* ("the same spelling of /sh/"), not by a root.
- The Shun Wyrm's "choose the ending from the root's clue" applies only to the -cian and -ssion wings.

### 8. Wrong readings must be try-safe and accent-safe

**Where:** §2.4 and §2.5.2 (the Magpie's *great* read as "greet"), the Hoot Owl (*book* as "booook"), the Scarecrow ("blew or new?").

**What's wrong:**
- **The Magpie's "greet" is a real word.** MULTI_SOUND puts *great* in the listening-only set for exactly this reason ("try-safe", the manual's *most* rule). Its "That's not a real word" line would be false.
- **The Hoot Owl's "booook" is how many Northern children say *book*.** Sounds~Write's own note is that *book* can rhyme with *Luke*, and it says to vet Lesson 10 words for accent.
- **The Scarecrow's *new* read as "noo"** is regional or American, not a non-word.

**Fix:**
- **The Magpie:** use *steak* or *break* (MULTI_SOUND's demo words), or put the word in a sentence and ask "Does that make sense?".
- **The Hoot Owl and the Scarecrow:** run every wrong reading through MULTI_SOUND §4.1's try-safety and accent check (for example *food* read with the sound in *book*, and *blew* read with the sound in *few*).

### 9. Alien Words must never mark a valid reading wrong, and a "PSC-style score" must be read aloud

**Where:** §3.8 (Alien Words), §1.4, §1.3 ("alien words at PSC level").

**What's wrong:**
- **Valid readings.** The PSC accepts every valid reading of a pseudo-word. Sounds~Write's guidance gives *meast* read with /ee/ or /ae/, and *strow* with /ow/ or /oe/. A "Kai or Suki" pair that pits /ee/ against /ae/ marks a correct reading wrong.
- **The score.** A two-way choice is recognition at a 50% guess rate, so "scored … the way the Phonics Screening Check is" isn't true.

**Fix:**
- **Wrong readings:** the wrong reading is always a real error of the kinds Sounds~Write's tracker records (a letter name, a two-letter spelling said as two sounds, a sound added or dropped), never another valid sound of the spelling.
- **The word generator:** keep to PSC structures (three-consonant clusters only *scr spl spr str*, plus *shr thr*).
- **The practice check:** run it like Speed Read, read aloud to a grown-up who taps ✓ or ✗ per word, or stop calling it PSC-scored.

### 10. Lesson 6 is built from the word's own tiles, and the choice starts at Lesson 7

**Where:** §3.2 ("The dojo (a new unit's stone): the word puzzle, fan mode, rungs R1–R2"), §6.2 (Dojo.tsx fan mode).

**What's wrong:** Lesson 6 gives the pupil "the sounds we need to build the word". They build it, then the teacher points out the target spelling and sums up that the spellings are different but the sound is the same. There is no choice. The choice comes with Lesson 7: read the word, then write it. The fan of every gem in a new unit's first dojo puts a spelling choice on day one.

**Fix:**
- **The dojo's word puzzle** (Lesson 6) uses the word's own tiles. After each word, its gem flies into its column on the petal, and Sensei sums up ("different spellings, the same sound").
- **The fan** appears from the Lesson 7 step, at R2 with the peek. That is Gem Choice's own full form, which is already right.

---

## Should-fixes

| # | Where | Fix |
|---|---|---|
| S1 | §2.3, §5.1 | "Passed at 75% … Sounds~Write's move-on rule". Sounds~Write's 75–80% is a class-level rule of thumb ("75-80% of your class … 75-80% proficiency"), and it gives no per-child pass mark. Say "adapted from" |
| S2 | §3.1 | Add Lesson 11's writing step as retrieval: at R2 and above, after the gap closes, the word vanishes and the child rebuilds it by syllables (Lesson 15's "rub it out and write it again"). The gap closing on its own is copying |
| S3 | §1.9.4, §2.3, §3.5 | Dictate every word the Sounds~Write way, as word, sentence, word ("The word is… Write the word…, say the sounds as you do"), not only homophones |
| S4 | §1.9.1, §1.9.5 | Sensei says "This word has a spelling we haven't learned yet. I'll tell you that bit" rather than "a surprise spelling". "Special words" stays on the grown-ups' screens, as the school's term. Use Sounds~Write's full line "This is /e/. Say /e/ here", and add "read it back" before the check |
| S5 | §2.4 (Captain Parrot) | The parrot's swapped gem breaks the Muddled Notes guard. Swap only in R4–R5 words, never in the child's current word |
| S6 | §4.2 (special words) | A word graduates only when its last untaught part is taught. *money* (< ey >, EC29), *school* (< ch > as /k/, EC45, unless it is taught tangentially for the PSC), *who* (< wh > as /h/, EC44; listed twice) and *your* (< our >, EC43) graduate too early |
| S7 | §2.4 | Serpent: *strap → sap* removes two sounds, but Sound Swap changes one (use *strap → trap*). Yeti: < x > is one letter for two sounds, not "two letters, one sound" |
| S8 | §1.2 | Gnome Hollow: < ear > (*earth, heard*) is taught in one-syllable words; only < ar our re > are long-word-only. Echo Island: *played* and *called* aren't long words. < pe > is EC4 in `sw.ts`, not EC1 |
| S9 | §1.2 (Cloud Town), §3.8 | Two lines put a pure sound mid-sentence, against TEACHER_SCRIPT §2: "Can you hear /ow/ twice?" and "Find every /ae/ on this page". End each sentence on the sound |
| S10 | §1.2 | Dose: three stones per sound unit is thin for 7-spelling units (/or/ has 7, and a Sounds~Write unit is two weeks). Scale teaching stones with the number of spellings, as the content quota already does |

---

## The best ideas (keep them)

1. **Every boss is its land's official progress check.** It reads, dictates and ends with a sentence, and it scores independent first tries only, with a spelling counting only if the whole word is right. Every land-end check number is right (Sky Temple 3, Cloud Town 6, Moon Marsh 9, Circus Island 12, Autumn Orchard 15, Star Dunes 18, Echo Island 22, Gnome Hollow 25, Giant's Gorge 29, Dolphin Bay 31, Roaring Peaks 34, Muddle Castle 38). The bosses therefore climb because the programme does, which is the true answer to "the boss of lame sounds".
2. **The class moves on, and the gaps get keep-up.** The next land always opens, and gems that needed help go to the imp's lair for a short rematch. This is Sounds~Write's pacing with its keep-up support, turned into a story.
3. **The Syllable Train.** It uses Lessons 11–14's own lines ("When I say… I can hear two syllables", "say the sounds and read the syllable", "write it without the gap"). The teacher splits at sound level and the child splits at syllable level, with a fall back after misses. The schwa correction is word for word.
4. **The tortoise speaks in the spelling voice and the rabbit in the talking voice.** It is Sounds~Write's own pair, made into the game's existing gesture.
5. **Special endings are three tiles under a gold bracket at sound level, and one chunk at syllable level.** It keeps one sound per tile and still teaches "the whole suffix".
6. **Schwa is shown, not tested:** the lens on *le·mon*, spelling voice against talking voice. Schwa is a spelling problem, not a reading problem.
7. **Honest timings for the "shun" words.** -tion in Year 2 (Roaring Peaks). *magician*, *division* and *television* are read syllable by syllable in Year 2 and spelt in the Library, labelled "Year 2 stretch; Year 3 at school".
8. **Ninja Vanish is Sounds~Write's improved look, cover, write, check.** The untaught part is given, never memorised as a shape. A word graduates, with one line, when its unit arrives.
9. **Lesson 9 as Seek the Sound, Lesson 15 as Word Detective, Lesson 4a as the Dictation Scroll** (with words on the board, and the sentence read back).
10. **The weekly list shows the 2024 coding (*cake* = c·a·ke)** and offers the split-spelling display to schools like Freshford. It practises the school's list as sent, the Sounds~Write way.

---

## Checked and found right, so the fixers needn't re-check

- **Land units and order:** the spec's land units against the official 2026 scope, including the Bridging Unit's four sounds (/k/, /ch/, /w/, /v/) and the eleven spelling units in their lands.
- **Checks:** land-end check numbers against the official unit-to-check table (the dossier's summary of the 2026 progress checks).
- **Start points:** where a school child starts in each year and term (half a term behind the official Year 1 and Year 2 plans).
- **The "shun" table (§4.3):** its codings, sound counts, schwa syllables and splits (*sta·tion, ma·gi·cian, di·vi·sion, mul·ti·pli·ca·tion, trea·sure, pic·ture*), with < ti ci ssi si > as /sh/ and < si > in *division* as /zh/.
- **Year 2 long words:** the long-word lists against checks 20–38 (*holiday, radio, multiply, routine, photograph, mechanic*).
- **Voice rules:** no "tricky", "sight words", "silent letters" or "magic e" anywhere in the child's lines. Split spellings are gone.
