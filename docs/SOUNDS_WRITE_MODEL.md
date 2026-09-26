# The Sounds~Write model for Super Ninja

Sounds~Write is a registered trade mark of Sounds-Write Ltd. This document describes the published structure of their programme so the game can teach the way Freshford (Jonas's children's school) teaches. It quotes short passages with citations and reproduces no teaching materials.

**What this is.** The authoritative description of Sounds~Write (S~W) for the game, and the plan for moving the game onto it. The data lives in `src/content/sw.ts` (pure and typed). This doc explains it, maps it to our ids, compares it with the current game, and says what to build.

**How sure we are.** Reconciled on 26 September 2026 with the research dossier (`assets-src/sw-sources/research/DOSSIER.md`, "DOSSIER §x" below) and the official free downloads in `assets-src/sw-sources/downloads/` (the lexicon, First Steps readers, Bridging Unit stories, Early Years samples and more). Every fact carries a source (see [References](#references)); `SOURCES[].ref` in `sw.ts` gives the dossier's bibliography id. Official S~W material is marked plainly. School practice, secondary sources and our own inferences are named as such. What the public sources cannot settle is marked **⚠ open** with the matching question in DOSSIER §16; in code the same places carry `// TODO(verify): DOSSIER §16.x`. The practitioner manual and portal are not available to us. The change list for content is in `playtest/content/sw-reconcile-changes.md`.

Local copies of every source are in `assets-src/sw-sources/` (the `research/` subfolder belongs to the research workflow).

---

## Decisions (Jonas, 25 September 2026)

These override the options discussed below:
1. **Split spellings: follow the official September 2024 Sounds~Write guidance.** There are no split spellings: *gate* is g·a·te, with < a > for /ae/ and < te > for /t/. Freshford still teaches a-e, but the game follows the official programme. This affects `SPLIT_SPELLING` in sw.ts, the /ae/ /ee/ /ie/ /oe/ /ue/ petals in flower.ts, `GRAPHEMES`, and every word with a split spelling. `DEFAULT_SPLIT = "consonant-e"`.
2. **Unit order: official Sounds~Write order and pacing**: Initial Code 1–11 → Bridging → EC1–49 → Polysyllabic, with the jump-ahead milestones end of Reception = IC11/Bridging, end of Year 1 = EC26, end of Year 2 = EC49. Freshford's timing differences may appear only as notes for grown-ups.
3. **Pre-letter listening games stay** as a short, clearly labelled warm-up before Initial Code Unit 1 (oral blending, first-sound and middle-sound picture games for 3–4 year olds). They are game-only activities, not Sounds~Write lessons, and children who already know sounds can skip them. (Sounds-Write's own nursery course has seven "elements" of phonological and phonemic awareness; see 3.)

## 0. Key facts

1. **Three levels:** Initial Code (Reception, Units 1–11 plus the Bridging Unit), Extended Code (Years 1–2, Units 1–49: 38 sound units and 11 spelling units), Polysyllabic Words (a separate strand from week 2 of EC4 in Year 1 to Year 6 and beyond) [S&S; Handbook 2026].
2. **Four concepts** (Handbook 2026, official): letters are symbols (spellings) that represent sounds; a sound may be spelled by 1, 2, 3 or 4 letters; the same sound can be spelled in more than one way; many spellings can represent more than one sound. "We spell sounds one at a time from left to right across the page" is a separate Initial Code outcome [Handbook 2026; Poster 2024; DOSSIER §1].
3. **Three skills** (Handbook 2026): segmenting, "the ability to pull apart the individual sounds in words"; blending, "the ability to push sounds together to build words"; phoneme manipulation, "the ability to insert sounds into and delete sounds out of words", used to test alternatives for spellings with more than one sound.
4. **Fifteen numbered lessons plus 4a**, five per level: 1 Word Building, 2 Symbol Search, 3 Sound Swap, 4 Reading and Spelling Words, 4a Dictation, 5 Word Building (two- or three-letter spellings), 6 One Sound, Different Spellings – Word Puzzles, 7 One Sound, Different Spellings – Reading and Writing, 8 Sound Review, 9 Seek the Sound, 10 One Spelling, Different Sounds, 11 Building Polysyllabic Words, Sound Level, 12 Reading Polysyllabic Words, Sound Level, 13 Building Polysyllabic Words, Syllable Level, 14 Reading Polysyllabic Words, 15 Analysing Polysyllabic Words [Plans 2023; TTE-PSW; L15 Top Tips; DOSSIER §2.1.1].
5. **Every session** is daily, 30 minutes, in three parts (review, current unit, reading or writing in connected text), using "3 or 4 Sounds-Write lessons" [Handbook 2026; Plan R 2023].
6. **Pace:** about two weeks per unit; EC units 7, 8, 23, 25 (Year 1) and 29, 30, 35, 44, 46 (Year 2) may take one. Reception: Unit 6 or 7 by the end of autumn; Unit 11 by the end of spring or the start of summer; Bridging Unit and consolidation in summer. Year 1: EC1–9, 10–18, 19–26. Year 2: EC27–34, 35–42, 43–49. Year 3 reviews the Extended Code a sound a week [Handbook 2026].
7. **Lags:** reading in connected text at least one unit behind; dictation at least two; home readers two; quizzing at least two (Initial Code) or four (Extended Code); spelling accuracy in the Extended Code begins after about 5–7 units; polysyllabic review of Extended Code spellings runs about 4–7 units behind [Handbook 2026; Plans 2023; Quizzing; Checks 2026].
8. **Move-on rule:** "when 75-80% of your class has achieved 75-80% proficiency in the current unit" (blog 2024); "around 80% of the class" (Handbook). There is no official per-child pass mark [DOSSIER §13.3].
9. **Split spellings were dropped in September 2024.** EC1 is now < ay >, < ai >, < a >, < ea >; the final e joins the consonant (cave = c·a·ve, gate = g·a·te). Schools may keep split spellings, and **Freshford still teaches them** ("split spelling e.g. gate, also written as a-e") [Split 2024; Freshford Y1/Y2]. `sw.ts` supports both (`SplitPolicy`); the default is the official one.
10. **Word building uses only the word's own spellings, jumbled.** No distractor cards [L1 Top Tips; the official app and toolkit screens show only the target word's tiles; DOSSIER §2.2.1, §15.3]. The game currently adds at least two distractors.
11. **The Bridging Unit is /k/, /ch/, /w/, /v/** (07.2024 timeline linked from the 2026 Handbook; 10.2024 Year 1 guidance; the 2024 Bridging Unit Christmas stories). The older 06.2023 plan had /l/ instead of /v/.
12. **Unit 50 (schwa) is not current.** The Extended Code ends at Unit 49; schwa is taught in the polysyllabic strand [DOSSIER §9.1, §10.5].

---

## 1. The programme

### 1.1 Concepts, skills, levels

`CONCEPTS`, `SKILLS`, `LEVELS` in `sw.ts` hold the official wording (Handbook 2026; the scope and sequence's per-level wording). The Manual's own sentences are not public, but the Handbook is the current official statement (DOSSIER §16.3 q1).

- Concept 1 is taught from IC1 ("Sounds can be represented by spellings with one letter").
- Concept 2 starts with double consonants in IC7 ("Some spellings are written with a double consonant.") and grows in IC11 ("Some spellings are written with two or three different letters"); four-letter spellings come in the Extended Code.
- Concept 3 is met informally in IC11 and taught formally in the Bridging Unit ("The same sound can be spelled in more than one way").
- Concept 4 is formal from the first spelling unit, EC3 < ea >, with Lesson 10. The Handbook says pupils "begin to have an understanding" of concepts 3 and 4 in the Initial Code.

### 1.2 Initial Code (Reception)

| Unit | New code (ours: spelling→sound) | Word structures (S&S wording) | Concept (S&S wording) | High-frequency words introduced (manual) | Example words |
|---|---|---|---|---|---|
| 1 | a→a, i→i, m→m, s→s, t→t | Segment, blend and manipulate sounds in CVC words | Sounds can be represented by spellings with one letter | – | it, at, sat, sit, mat, am |
| 2 | n→n, o→o, p→p | CVC |  | is, a | in, on, not, an, tin, mat, pot, mop |
| 3 | b→b, c→k, g→g, h→h | CVC |  | the, I | can, big, him, got, bag, tag, sag, cat |
| 4 | d→d, e→e, f→f, v→v | CVC |  | for, of | had, dad, get, if, met, set, net, vet |
| 5 | k→k, l→l, r→r, u→u | Segment, blend and manipulate sounds in CVC words | Sounds can be represented by spellings with one letter | are | but, up, mum, rat, kid, log, red, kit |
| 6 | j→j, w→w, z→z | CVC |  | was | jug, wig, zip |
| 7 | x→ks, y→y, ff→f, ll→l, ss→s, zz→z | CVC | Some spellings are written with a double consonant. | all | will, off, box, yes, huff, hill, miss, buzz |
| 8 | none | VCC and CVCC / 2 consonants in final position / 3- & 4-sound words |  | come (+ some) | and, went, it's, just, help, lift, limp, left |
| 9 | none | CCVC / 2 consonants in initial position |  | to | from, frog, slip, smell, clap, drop, stop, spot |
| 10 | none | CCVCC, CVCCC, and CCCVC / 3 adjacent consonants / 5-7 sound words |  | – | swift, scrap, slump, swept, stink, plank, grand, twist |
| 11 | sh→sh, ch→ch, th→th, th→dh, ck→k, ng→ng, n→ng, wh→w, q→k, u→w, ve→v, tch→ch | VC, CVC, CVCC, CCVC, CCVCC, CVCCC and CCCVC | Some spellings are written with two or three different letters / < q > and < u > represent the sounds /k/ and /w/ | there, their, these, what, where, who (+ she) | that, with, this, then, them, when, back, fish |

Notes (official unless marked):

- **High-frequency words** come from the manual's Part 3 table and revised p.100 [IC vocab; Manual pp. 99–100]. The 2026 *Egyptian Adventures* stories (one per unit) confirm them unit by unit: 'the' is a help word at Unit 2 and taught from Unit 3; 'to' is a help word up to Unit 8 and taught from Unit 9. 'some' is not in the manual's table, but the official HFW documents and the founder introduce it early; 'she' is listed as previously taught in the 2024 Bridging Unit stories. The teacher "takes responsibility" for the untaught part: "This is 'the', just say 'the' here"; later "This is /e/, say /e/ here, /s/ /e/ /d/, 'said'" [Handbook 2026; DOSSIER §11]. Freshford's own lists are in `FRESHFORD_SPECIAL_WORDS`; Sounds~Write avoids the terms "tricky words" and "sight words".
- In IC7, < x > is one spelling for two sounds, /k/ /s/ ("box") [Parents' guide]. The S&S still calls IC7 words CVC, so `structureOf` counts x as one C. How an x word is laid out in Lesson 1 is **⚠ open** (DOSSIER §16.9 q6).
- Units 8–10 add no code: "The key aspect to focus on for Units 8 to 11 is mastery of the skills of segmenting and blending of adjacent consonants." The target at around Easter: lift (CVCC), frog (CCVC), swift (CCVCC), scrap (CCCVC), "until their skills are perfect or near perfect" [Impl 2020; PSC 2024].
- Nonsense-word Sound Swap starts in the review part of IC9, week 2 [Plan R 2023].
- In IC9, week 1 uses adjacent continuants (frog, slip, smell) and week 2 non-continuants (clap, drop, stop). < sh > starts in week 2 of IC9, in CVC words, with Lesson 5 [Plan R 2023].
- IC10: "5-sound words" (Initial Code S&S) or "5-7 sound words" (UK S&S); the 2024 timeline shows only ccvcc and cvccc. We keep CCVCC, CVCCC and CCCVC. **⚠ open** (DOSSIER §16.9 q5).
- IC11 has no single official order: 2023 Reception plan sh, ch, th, ng, ck, wh, tch, q & u; 10.2024 Year 1 plan sh, ch, tch, th, ck, wh, ng, ve, q u. < ve > has been taught here since September 2024 through have, live, give, twelve. "Care will need to be taken to ensure that students have a clear understanding that these [< q > and < u >] are new spellings of /k/ and /w/ and that they represent separate sounds" [Plan R 2023; Split 2024; Y1 new 2024].
- < n > for /ng/ (think, bank) is official: the 2020 plan lists "< ng > & < n >" and the 2025 PSC analysis says the < n > in 'clang' and 'bunk' "represents the sound /ng/". "/ng/ should only be taught as one sound if it accurately represents the accents of the children" [Impl 2020; PSC 2025 blog; IC words 2019]. The < n > before /k/ words (ink, bank) already sit in the official Unit 8 lists, before < ng > is taught; how they are handled there is **⚠ open** (DOSSIER §16.9 q7).
- Progress checks start after Unit 3 ("we don't provide a progress check before Unit 3") [Checks IC 2026].

### 1.3 Bridging Unit

Taught in the summer term of Reception, after Unit 11, "alongside review, practice and consolidation of the Initial Code units". "It should be introduced using Lesson 6, and Lessons 7 and 8 can also be used along with Lesson 4"; "the new content … is the format of Lesson 6" [Plan R 2023; Handbook 2026]. About a week per sound [Impl 2020]; the 10.2024 Year 1 catch-up plan fits all four sounds into two weeks.

| Sound (teaching order) | Spellings | Official example words |
|---|---|---|
| /k/ | c, k, ck | can, cap, camp … / kit, kilt, king … / pack, neck, lick … |
| /ch/ | ch, tch | champ, chant, chat … / patch, fetch, ditch … |
| /w/ | w, wh | wax, web, well … / wham, whack, whiff … |
| /v/ | v, ve | van, vest, vet / live, give, have, twelve, solve |

Versions: the S&S files and the 06.2023 timeline list /k/, /ch/, /w/; the 06.2023 Reception plan adds /l/ < l > < ll > (order /k/, /w/, /ch/, /l/) and an older Bridging Lesson sheet adds < le >; the 07.2024 IC timeline linked from the 2026 Handbook, the 10.2024 Year 1 guidance and the 2024 *Bridging Unit Christmas Stories* ("The cup of milk", /k/; "Chum's tricks", /ch/; "Mum's Choc Whip", /w/; "A trip to the shops with Viv", /v/) give /k/, /ch/, /w/, /v/. We follow the newest; /l/ and the 2020 optional < u > for /w/ are kept in `BRIDGING_UNIT.earlier`. No source says why /l/ was dropped. The bridging-level Lesson 6 script and its summing-up questions are **⚠ open** (DOSSIER §16.10). Progress check 10 is used halfway through the unit, check 11 after it.

### 1.4 Extended Code (Years 1–2)

Each unit's spellings come from the manual's record sheet and word-list headings (official, pre-2024), with the split spellings replaced as the 2024 guidance says ("and so on for all of the units that previously had a split spelling"), plus a few additions from the 2026 progress checks, their FAQ and the 06.2025 HFW chart (noted below). The progress checks give an official post-2024 word set for every sound unit to 48 (DOSSIER §9.2, §9.5). "New here" is `newGpcsIn()` under the default policy; pairs whose sound is not the unit's are consonant + e spellings (see 1.5).

| Unit | Target (S&S wording) | Ours | Spellings in scope (2024 coding) | New here (incl. consonant + e) | Weeks | Term |
|---|---|---|---|---|---|---|
| 1 | Sound /ae/ first spellings | ae | ai ay a ea | ai ay a ea te>t me>m ke>k le>l pe>p | 2 | Y1 autumn |
| 2 | Sound /ee/ first spellings | ee | ee ea e y | ee ea e y the>dh | 2 | Y1 autumn |
| 3 | Spelling < ea > | < ea > | /ee/ ('team'), /ae/ ('great') | — | with the sound unit | Y1 autumn |
| 4 | Sound /oe/ first spellings | oe | o oa ow oe | o oa ow oe de>d ne>n ze>z se>s be>b | 2 | Y1 autumn |
| 5 | Spelling < o > | < o > | /oe/ ('no'), /o/ ('hot') | — | with the sound unit | Y1 autumn |
| 6 | Sound /er/ first spellings | er | er ir ur or | er ir ur or fe>f | 2 | Y1 autumn |
| 7 | Sound /e/ | e | e ea ai | ea ai | 1 | Y1 autumn |
| 8 | Sound /ow/ | ou | ou ow | ou ow | 1 | Y1 autumn |
| 9 | Spelling < ow > | < ow > | /ou/ ('cow'), /oe/ ('snow') | — | with the sound unit | Y1 autumn |
| 10 | Sound /oo/ (as in 'moon') first spellings | oo | oo ew ue u o | oo ew ue u o | 2 | Y1 spring |
| 11 | Sound /ie/ | ie | i igh y ie | i igh y ie | 2 | Y1 spring |
| 12 | Sound /oo/ (as in 'book') | uu | oo u oul | oo u oul | 2 | Y1 spring |
| 13 | Spelling < oo > | < oo > | /oo/ ('moon'), /uu/ ('book') | — | with the sound unit | Y1 spring |
| 14 | Sound /u/ | u | u o ou | o ou | 2 | Y1 spring |
| 15 | Spelling < ou > | < ou > | /ou/ ('loud'), /u/ ('double'), /oo/ ('soup') | ou | with the sound unit | Y1 spring |
| 16 | Sound /s/ | s | s ss st c ce se sc | st c ce sc | 2 | Y1 spring |
| 17 | Spelling < s > | < s > | /s/ ('bricks'), /z/ ('his') | s se | with the sound unit | Y1 spring |
| 18 | Sound /l/ | l | l ll le al el il ol | al el il ol | 2 | Y1 spring |
| 19 | Sound /or/ first spellings | or | or aw au a ar al oor | or aw au a ar al oor | 2 | Y1 summer |
| 20 | Sound /air/ | air | air are ear ere eir | air are ear ere eir | 2 | Y1 summer |
| 21 | Sound /ue/ | ue | ue ew u eu | ue ew u eu | 2 | Y1 summer |
| 22 | Spelling < ew > | < ew > | /oo/ ('blew'), /ue/ ('new') | — | with the sound unit | Y1 summer |
| 23 | Sound /oy/ | oy | oi oy | oi oy | 1 | Y1 summer |
| 24 | Sound /ar/ | ar | ar a al au | ar a al au | 2 | Y1 summer |
| 25 | Sound /o/ | o | o a | a | 1 | Y1 summer |
| 26 | Spelling < a > | < a > | /o/ ('was'), /a/ ('cat'), /ae/ ('apron'), /ar/ ('father') | — | with the sound unit | Y1 summer |
| 27 | Sound /ae/ more spellings | ae | ai ay a ea ei ey eigh | ei ey eigh | 2 | Y2 autumn |
| 28 | Sound /d/ | d | d dd ed | dd ed | 2 | Y2 autumn |
| 29 | Sound /ee/ more spellings | ee | ee ea e y ey ie i | ey ie i | 1 | Y2 autumn |
| 30 | Sound /i/ | i | i ui e y | ui e y | 1 | Y2 autumn |
| 31 | Spelling < y > | < y > | /y/ ('yellow'), /i/ ('hymn'), /ie/ ('cry'), /ee/ ('happy') | — | with the sound unit | Y2 autumn |
| 32 | Sound /oe/ more spellings | oe | oa ow o oe ou ough | ou ough | 2 | Y2 autumn |
| 33 | Sound /n/ | n | n nn ne gn kn | nn gn kn | 2 | Y2 autumn |
| 34 | Sound /er/ more spellings | er | er ir ur or ar ear our re | ar ear our re | 2 | Y2 autumn |
| 35 | Sound /v/ | v | v vv ve | vv | 1 | Y2 spring |
| 36 | Sound /oo/ (as in 'moon') more spellings | oo | oo ew ue u ui ou ough | ui ough | 2 | Y2 spring |
| 37 | Sound /j/ | j | j g ge gg dge | g ge gg dge | 2 | Y2 spring |
| 38 | Sound /g/ | g | g gg gh gu | gg gh gu | 2 | Y2 spring |
| 39 | Spelling < g > | < g > | /g/ ('gum'), /j/ ('gem'), /g/ ('egg'), /j/ ('suggest') | — | with the sound unit | Y2 spring |
| 40 | Sound /f/ | f | f ff ph gh | ph gh | 2 | Y2 spring |
| 41 | Spelling < gh > | < gh > | /f/ ('cough'), /g/ ('ghost') | — | with the sound unit | Y2 spring |
| 42 | Sound /m/ | m | m mm mb mn | mm mb mn | 2 | Y2 spring |
| 43 | Sound /or/ more spellings | or | or aw au a ar al oor oar ore our augh ough | oar ore our augh ough | 2 | Y2 summer |
| 44 | Sound /h/ | h | h wh | wh | 1 | Y2 summer |
| 45 | Sound /k/ | k | c k ck ch cc | ch cc | 2 | Y2 summer |
| 46 | Sound /r/ | r | r rr rh wr | rr rh wr | 1 | Y2 summer |
| 47 | Sound /t/ | t | t tt te bt ed | tt bt ed | 2 | Y2 summer |
| 48 | Sound /z/ | z | z zz ze s se ss | ss | 2 | Y2 summer |
| 49 | Sound /eer/ | eer | eer ere ear | eer ere ear | 2 | Y2 summer |

Details worth knowing:

- **Sound units vs spelling units.** 38 sound units teach several spellings of one sound (current unit: Lessons 6, 7, 9). 11 spelling units (3, 5, 9, 13, 15, 17, 22, 26, 31, 39, 41; the "grey" units) teach the sounds of one spelling with Lesson 10, from week 2 of the sound unit before them, and share its progress check [Plans 2023; Checks 2026].
- **First and more spellings.** /ae/ (1, 27), /ee/ (2, 29), /oe/ (4, 32), /er/ (6, 34), /oo/ moon (10, 36) and /or/ (19, 43) are visited twice. More-spelling rows list every spelling in scope, as the word lists do. Year 2 guidance counts "the eight spellings of /ae/" because it counted < a-e > and < a > separately; after 2024 they merge (Our Pedagogy: first < a ay ai ea >, more < ei eigh ey >).
- **Additions to the record sheet** (all official, newer): EC19 < oor > (door, poor, floor are Unit 19 check words; 06.2025 HFW chart); EC21 < eu > (feud; on the record sheet, missing from the word-list heading); EC34 < re > (checks FAQ: "in Unit 34 polysyllabic words are taught with < re >, < ar > and < our >"); EC37 < gg > (record sheet; the 12.2025 analysis maps 'suggest' here); EC39 covers < g > and < gg > (record sheet); EC47 < ed > for /t/ (2026 checks read 'stopped' here; the 12.2025 analysis agrees). EC36 has no < o > (the official Unit 36 lists omit it; < o > for m/oo/n stays in EC10).
- **Still open:** the checks read 'learn' (< ear >) as a Unit 6 word and dictate 'shoe' (< oe >) as a Unit 10 word, but the record sheet has neither and a 2026 official Unit 6 board shows only < er ir ur or >. We keep them as `otherSpellings`, not as unit spellings. **⚠ open** (DOSSIER §16.11 q1, q4).
- **Polysyllabic-only units.** New spellings are always introduced in one-syllable words "with the exception of Units 18 and 34" (Handbook); the checks FAQ adds Unit 35 (< vv > in savvy, skivvy).
- **Tangential teaching** (official sheet, 09.2024): spellings to point out alongside a unit without formal teaching, e.g. < ey > (they) with Unit 1; < ph >, < kn >, < wr > with Unit 4; < ou > (you), < ch > (school), < tw > (two) with Unit 10; < our > (your, four) with Unit 19 (`TANGENTIAL_TEACHING`).
- **PSC adjustments (official, England):** in EC2 add < ie > (chief); in EC4 add < ou > (mould) and teach < ph > (phone); in EC10 add < ou > (you). Tangentially teach < ch > as /sh/ (chef), < g > as /j/ (gem), < s > as /z/ (hens), < c > as /s/ (cell). Consider moving EC20 /air/ and EC24 /ar/ earlier and EC23 /oy/ alongside EC8. Leave < sc > until after the PSC [PSC 2024]. `PSC_ADJUSTMENTS`, and `pscAdditions` on each unit.
- **Schwa (Unit 50) is not current.** Older official documents list "Unit 50 … schwa" (HFW 2023; PSC 2024: "/schwa/ farmer EC 50"), but the 11.2023 EC scope and sequence, the 2026 Handbook, the 06.2025 HFW chart and the 2026 checks end at Unit 49 (`EC50_SCHWA.current = false`).
- **Accent.** Unit 24 /ar/ and Unit 49 /eer/ are accent dependent ("In some regions these words are pronounced with the /a/ sound … and are therefore not taught with /ar/"); in some regions book has the moon vowel. The lexicon treats /eer/ as /ee/ + schwa.
- **Unit 49** is not tested by any progress check (check 38 reads Units 46–48) **⚠ open** (DOSSIER §16.11 q5).
- **Known errors in school lists:** St Bede's repeats /l/ as Unit 19; several schools print "< g > /j/ (angel) & /g/ (gym)", which swaps the examples.

### 1.5 Split spellings and consonant + e

| | Freshford (2026 decks, petal chart) | Sounds~Write since September 2024 (the game's default) |
|---|---|---|
| cake | c · a-e · k | c · a · ke |
| EC1 /ae/ spellings | ai, ay, a-e, ea | ay, ai, a, ea |
| final e | part of the split vowel | joins the consonant: te, me, ke, le (Unit 1) and ve (IC11), then others "gradually, not all at once!" |
| Lesson 6 | has "Part 2" (split spelling) | "When you teach Lesson 6 now, simply take out Part 2" |

Jonas has decided the game follows the official guidance (Decisions, 1). The guidance names < te > < me > < ke > < le > with /ae/, and < ce > < ge > < the > < ze > as "correlated", but gives no per-unit order [Split 2024]. `SPLIT_SPELLING.consonantE` places each at the first unit where official post-2024 material uses it without help, or at its formal unit on the record sheet:

| Spelling | Unit | Evidence |
|---|---|---|
| te, me, ke, le | EC1 | the guidance's /ae/ examples (gate, game, take, tale) |
| pe | EC1 | 'cape' on the 2025 /ae/ poster; 'hope' coded h·o·pe in the 2024 Unit 4 activities |
| ve | IC11 | the guidance (have, live, give, twelve) |
| the | EC2 | no unit or use found; placed where the guidance's 'breathe' becomes decodable |
| de, ne, ze, se (/s/), be | EC4 | a < de > tile on the members' Unit 4 Lesson 6 board; 'fades', 'close', 'lane', 'bone' in *The Glow in the Snow* (EC4, 2025); 'froze' and 'snowglobe' in the 2024 EC1–4 activities; 'bone', 'zone' are Unit 4 check words |
| fe | EC6 | 'safe' in *Bert's Plan* (EC6, 2024) |
| ce | EC16 | formal unit (/s/); 'ice', 'face', 'nice' are Unit 16 check words |
| se (/z/) | EC17 | with < s > = /z/ (spelling Unit 17); formal unit 48 |
| ge | EC37 | formal unit (/j/); 'huge', 'large', 'strange' are Unit 37 check words |

Which of these each unit formally teaches is **⚠ open** (DOSSIER §16.11 q2). The 2011 lexicon already treats < ce > < ge > < se > < ze > < the > < ve > < me > < ne > < le > < te > as consonant spellings; < de > < pe > < be > < fe > < ke > exist only in the post-2024 coding (`LEXICON_AUDIT`). Store GPC keys in split form and use `applySplitPolicy()`; `{ split: "split" }` gives Freshford's version for grown-up notes.

### 1.6 Polysyllabic Words

A separate strand with no numbered units. Objectives: "segment: to spell polysyllabic words by segmenting them first into syllables, and then each syllable, in turn, into sounds; blend: to read words by first blending sounds into syllables, and then syllables, in turn, into words"; knowledge: "some words are made up of more than one syllable; the spelling of some common syllables, such as prefixes and suffixes; some polysyllabic words contain schwas" [PSW S&S]. It starts "at around the second week of Unit 4 /oe/" in Year 1 ("Don't be tempted to start earlier even though the students are older"), always with Lessons 11–15, never Lesson 6 [Handbook 2026; Y2 start 2024]. Extended Code spellings enter polysyllabic work from about Unit 8 and are never taught in polysyllabic words when a unit is first introduced (except Units 18, 34, 35); in the 2026 checks the polysyllabic words run about 4–7 units behind [Checks FAQ; Checks 2026; DOSSIER §10.2]. Stage numbers are ours; the record sheet's stages are two-, three-, four-, five-syllable words and common suffixes.

| Stage | Content | Structures / examples | Lessons | When | Tier |
|---|---|---|---|---|---|
| PW1 | Two-syllable Initial Code words, CVC\|CVC and VC\|CVC, many compounds (Sets 1–2) | sun\|set, up\|set, co\|mic, zig\|zag, Bat\|man | 11, 12 | Y1, EC4 wk 2 | official |
| PW2 | More complex IC structures and two-letter spellings (Sets 3–5) | in\|sect, den\|tist, desk\|top, pro\|ject, egg\|shell, chop\|stick | 11, 12 | Y1, EC4–6 | official |
| PW3 | Adjacent consonants, three syllables, weak/strong syllables and schwa priming, still IC (Set 6; "IC words with schwas") | in\|spect, splen\|did, fan\|tas\|tic, sun\|lit, a\|ddress, ca\|rrot, co\|llect, e\|quip\|ment | 11, 12 | Y1, before ~EC8 | official |
| PW4 | Extended Code spellings in PSWs, reviewed well behind the current unit | day\|break, pain\|ting, land\|scape, win\|dow, Au\|gust | 11–14 | Y1 from ~EC8, Y2 | official |
| PW5 | Syllable level (Lessons 13–14), when "achieving a reasonable level of proficiency"; not one-way | fan\|tas\|tic, Sep\|tem\|ber | 13, 14 | Y1–2 on | official |
| PW6 | Common suffixes ("special endings" -tion, -ture …) and schwas ("spelling voice") | far\|mer, mul\|ti\|ply, pic\|ture | 11–15 | Y1 on | official |
| PW7 | Year 3: the Extended Code reviewed one sound a week (33 "sound" units), with polysyllabic words | first + more spellings together | 11–15 | Y3 | official |
| PW8 | Year 4: Year 3 review only "if necessary"; otherwise 2–3 × 15-minute spelling sessions | | 11–15 | Y4 | official |
| PW9 | Years 5–6: domain vocabulary, statutory spellings, tangential teaching (Lessons 15 and 10) | au\|to\|bi\|o\|gra\|phi\|cal | 15 (10, 12) | Y5–6 | official |

The Handbook's structure sequence (steps 1–7) is in `POLYSYLLABIC[].notes`. Year 3's "33 sound units" does not match a count of the sequence (32 after merging six pairs) **⚠ open** (DOSSIER §16.11 q6). Scripts for Lessons 12–14 are not public beyond the error corrections and demonstrations **⚠ open** (DOSSIER §16.12 q1).

Syllable splitting (official guidance, "there isn't a hard and fast rule"): listen, don't look; "wherever possible … try to start the syllable with a consonant sound", so a double-consonant spelling stays whole at the start of the next syllable (ru\|bbish, di\|ffe\|rent) and a single consonant starts the next syllable (co\|mic, e\|ve\|ry); CVCV splits help (ba\|by\|si\|tter, se\|pa\|rate); compounds split at the join. Splits follow speech, not morphology, and can depend on accent [Podcast Ep 20; doc 25; doc 45; `SYLLABLE_EXAMPLES`].

### 1.7 Lessons

| No. | Official name | Level | Where in the session | Skills |
|---|---|---|---|---|
| 1 | Word Building | initial | Current unit, Units 1–10 (with Lesson 4); new code always comes in with Lesson 1, 5 or 6. | segmenting, blending |
| 2 | Symbol Search | initial | Review, one unit behind, "for as long as is necessary"; supports letter formation. | code knowledge |
| 3 | Sound Swap | initial, extended | Review, one unit behind; nonsense words from IC9 week 2; in the Extended Code "with Initial Code words only" and nonsense words. | phoneme manipulation, segmenting, blending |
| 4 | Reading and Spelling Words | initial, extended | Current unit (with Lesson 1 or 5) and review at any level; the script for word-reading progress checks. | blending, segmenting |
| 4a | Dictation | all | Connected text, at least two units behind. Single-word quizzing is an additional review activity. | segmenting |
| 5 | Word Building (two or three letters) | initial | "Lesson 5 (rather than Lesson 1) would be used when teaching sounds spelled with two letters"; Units 7, 9–11 and < tch >. | segmenting, blending |
| 6 | One Sound, Different Spellings – Word Puzzles | initial, extended | Introduces the Bridging Unit and every EC sound unit. Never for polysyllabic words. | segmenting, blending |
| 7 | One Sound, Different Spellings – Reading and Writing | initial, extended | Current unit; Bridging Unit; final days of an EC unit. | blending, segmenting |
| 8 | Sound Review | initial, extended | Review of earlier sounds; Bridging Unit. | blending, segmenting |
| 9 | Seek the Sound | extended | Current unit and review, with a decodable passage. | blending |
| 10 | One Spelling, Different Sounds | extended | Spelling units, from week 2 of the sound unit before; "a couple of times a unit". | phoneme manipulation, blending |
| 11 | Building Polysyllabic Words, Sound Level | PW | From week 2 of EC4 in the current-unit part; later review. | segmenting |
| 12 | Reading Polysyllabic Words, Sound Level | PW | From week 2 of EC4; the fallback when syllable-level work breaks down. | blending |
| 13 | Building Polysyllabic Words, Syllable Level | PW | When pupils are proficient; not one-way. | segmenting |
| 14 | Reading Polysyllabic Words (syllable level) | PW | With Lesson 13; good PSC practice. | blending |
| 15 | Analysing Polysyllabic Words | PW | Words pupils can already read; central from Year 3; tangential teaching and subject vocabulary. | segmenting |

Session composition [Handbook 2026; Plans 2023], `SESSION` in `sw.ts`:

- **Initial Code.** Review: "usually Lessons 2, 3 or 4" (and 5, quizzing). Current unit: "Lessons 1, 4 or 5" (Lesson 6, then 7 and 8, for the Bridging Unit). Connected text: decodable reading one unit behind, Lesson 4a two units behind.
- **Extended Code.** Review: Lessons 3, 4, 8, 9, 10, 11–15, quizzing. Current unit: Lessons 6, 7, 9 (Lesson 10 when a spelling unit starts; 11 and 12 when polysyllabic words start). Connected text as above.
- **Additional activities:** SpeedRead ("20 words read correctly in 30 seconds = achieved") and quizzing.
- **Lessons per session:** "3 or 4" (Handbook); the public planning page says two or three and every official example week uses three **⚠ open** (DOSSIER §16.7 q1).
- **Unit 1, week 1:** Monday build *mat*, Tuesday *sat*, Wednesday *sit*, Friday *at*, with Lesson 4 reading in between. Sessions start at about 10 minutes and build to 30 by the end of Unit 1.

What we can state about each lesson (`LESSONS[id].steps`, with `stepsConf`): Lesson 1 steps 1–3 and Lessons 4a and 10 are official manual pages; Lessons 3, 5, 6 and 15 are known from official Top Tips; Lesson 11 from an official 2020 demonstration; Lessons 4, 8 and 12 from official descriptions; Lessons 2, 7 and 9 only from a school's reproduced scripts. The post-2024 Lesson 6 script (Parts 1, 3, 4) and the scripts of Lessons 8, 13 and 14 are not public **⚠ open** (DOSSIER §16.4 q4–q5, §16.12 q1).

### 1.8 Teaching Through Errors

TTE is a set of short scripted "mini scripts", the same at every level ("whether you're teaching 'mat' to a four-year-old or 'chlorophyll' to a ten-year-old"). Every published script: correct at once, at the exact place of the error; give only the missing piece (a sound or a spelling); hand the task straight back ("Say the sounds and read the word"); precise, non-negative language [Pedagogy; Handbook 2026; DOSSIER §4.1]. The training numbers them: "Error Correction 4.1" for letter names, 4.2 ("follow my finger") and 4.3 ("cover and blend") for blending. `TEACHING_THROUGH_ERRORS` has 28 scripts; `trackerTag` links each to the 2026 Progress Tracker's error tags.

| Error | Reading/spelling | Script (short) | Tier |
|---|---|---|---|
| misread-sound | reading | [Point to the misread spelling.] "If this was 'big', this would be /g/. Is it?" … "This is /n/. Say /n/ here." | school, **⚠ open** (§16.6 q9) |
| added-sound | reading | "If this were 'flight', there would be an < l > here. Is there?" | school, **⚠ open** (§16.6 q9) |
| omitted-sound | reading | "If this word was 'fog', this [< r >] wouldn't be here. You left it out. Let's say the sounds and read the word." | official |
| alternative-sound | reading | "This can be /a/, but in this word, it's /ae/. Say /ae/ here. Say the sounds and read the word." (Freshford: "Does that make sense? Try it a different way.") | official |
| untaught-spelling | reading | "This is one sound. It's /k/. Say /k/ here." / "We haven't covered this before. This is /air/. Say /air/ here." | official |
| said-separately | reading | "Do you remember that sometimes we spell a sound with two letters like this one. It's two letters but it's one sound. It's /sh/. Say /sh/ here." | official |
| cannot-blend | reading | ladder: word choice (continuants) → EC 4.2 "follow my finger" / 4.3 "cover and blend" → choice of words → provide the sounds → provide the word | official; 4.2/4.3 wording **⚠ open** (§16.6 q3) |
| impure-sound | both | [Point to your mouth.] "Say it like me." | official |
| letter-name | both | "'Em' is a letter name. We want you to say the sound /m/ as you write it." (EC 4.1) | official |
| guess | reading | treat as a misread at the first differing spelling; "We don't encourage guessing" | inferred, **⚠ open** (§16.6 q8) |
| special-word | reading | "This is 'the', just say 'the' here." / "This is /e/, say /e/ here, /s/ /e/ /d/, 'said'." | official |
| wrong-sound-heard | spelling | "What is the first sound you hear in 'sat'? Listen to what you hear when my finger is under this line." | official |
| spelling-not-known | spelling | "It's this one." / "You spell /m/ like this." | official |
| wrong-spelling | spelling | "This is /k/, but in this word you need this spelling of /k/." / "We often spell the sound /f/ like this < ff > at the end of some short words." | official |
| valid-alternative-spelling | spelling | "This can be a spelling of /er/ but in this word we need this spelling of /er/: < er >." | official |
| wrong-order | spelling | "If this were 'bat', this would be a … /b/. Is this /b/?" | official |
| missing-sound-in-spelling | spelling | stretch the word and point to where the sound belongs | inferred, **⚠ open** (§16.6 q15) |
| untaught-spelling-in-writing | spelling | model it: "This is the way we spell /e/ in this word." When free writing gets corrected is **⚠ open** (§16.6 q11). | official |
| swap-wrong-position | both | gesture and stretch the changing sound; "you do not segment the word for the student at all" | official |
| letter-formation | spelling | "Does yours look like mine? What do you need to change?" | official |
| schwa-spelling | spelling | "in our talking voice we say 'multiply', but in our spelling voice we say mul-ti-ply" | official |
| syllable-division, sounding-when-building, imprecise-pronunciation, syllable-break, syllable-wrong-sound, reads-through, capital-letter | polysyllabic | the official Lessons 11–14 sheet | official |

What the teacher never does: supply the whole word for a single untaught spelling; encourage "guessing, looking at pictures, or using context"; say letters "make" sounds or talk about "silent letters" or "magic e"; segment the word for a pupil who is spelling or swapping [DOSSIER §4.10].

### 1.9 Assessment

`ASSESSMENTS` and `PROGRESS_CHECKS` in `sw.ts` (DOSSIER §13):

- **Formative, every lesson** ("responsive teaching"), the main form of assessment. Handbook questions: how secure are code knowledge, conceptual knowledge and the skills ("with special emphasis in the Initial Code on segmenting and blending adjacent consonants"), and how much scaffolding (lines, gestures, script) is needed.
- **End of unit.** Final days: Lesson 4 (Initial Code) or Lesson 7 (Extended Code). By the end of an EC unit all children can name the sound and about 90% can do Lessons 6 and 7; by the end of the next unit over 80% read its spellings in connected text; spelling transfer after a 5–7 unit lag [Plans 2023].
- **Move-on:** 75–80% of the class at 75–80% proficiency; "around 80% of the class" (Handbook). No official per-child pass mark; the only per-child figure is the 2020 tracking form's "fairly secure (75% to 80%)". What proficiency is measured on is **⚠ open** (DOSSIER §16.15 q2).
- **Mastery timeline, Initial Code** [Impl 2020]: recognise the code (Lessons 1 and 2) by the end of the unit; fluent reading (Lesson 4) and manipulation (Lesson 3) by the end of the next unit or mid the one after; writing in connected text (Lesson 4a) by the end of the unit three later.
- **Progress checks (2026)** every 6–8 weeks, chosen by the last unit completed: 11 Initial Code checks (none before Unit 3; checks 10–11 for the Bridging Unit) and 38 Extended Code checks (one per sound unit). One-to-one word reading with the Lesson 4 script (6–10 words in the Initial Code, 20 in the Extended Code), then whole-class word dictation, plus one dictated sentence in the Extended Code. A word read only after a TTE script still counts as an error. The Progress Tracker (members, September 2026) records reading errors as "No attempt", "Unable to blend", "Guess", and per spelling "Not said", "Wrong sound", "Letter name", "Said separately", "+ Sound added".
- **Quizzing:** words at least two units behind (Initial Code) or four (Extended Code). **SpeedRead:** "20 words read correctly in 30 seconds = achieved".
- **Diagnostic test** (official handout): blending (/14), segmenting (/69), phoneme deletion (/10), Alphabet Code Knowledge (/50); not for Reception or whole classes; given without prompts. "Skills take precedence over code knowledge" when placing a pupil.
- **Adapted PSCs** in Year 1 (Initial Code only in the first month; two with code to Unit 8 in December or January), then the DfE Phonics Screening Check in June (40 words, threshold 32).
- **Freshford** checks Reception word lists fortnightly (1:1, then small groups) and gives weekly spelling tests in Years 1–2, moving on every 2–3 weeks regardless [Freshford decks].

### 1.10 Freshford's own timeline

Freshford follows S~W with local changes (`FRESHFORD_TIMELINE`):

- Reception autumn covers Units 1–5 only; spring adds Units 6–11; summer adds < ph > and starts /ae/ /ee/ /oo/ /igh/. No Bridging Unit, < tch > or < ve > is named.
- Year 1 spring reorders units: /oy/ first, then /oo/ (moon), /ue/, /oo/ (book), /ie/, /or/, /u/, /ar/.
- The spelling units EC5, 9, 13, 15, 17, 22, 26, 39 and EC25 /o/ are not named.
- Year 2 matches the official terms.
- It still teaches split spellings and memorised "special words".

The game follows the official order and uses Freshford's timeline only for the grown-ups report ("at school this term"). What the school actually does week by week is a question for its teachers (DOSSIER §16.18).

---

## 2. Mapping Sounds~Write to our ids

### 2.1 Sounds

Our 46 `PhonemeId`s map to S~W sounds (`SW_SOUND_MAP`). Only the differences:

| Our id | Sounds~Write | Units | Note |
|---|---|---|---|
| p | /p/ | IC2 | no Extended Code unit; < pp > only meets children in polysyllabic words |
| b | /b/ | IC3 | no Extended Code unit; < bb > only in polysyllabic words |
| ks | — | IC7 | not a sound: < x > "encodes two sounds, pronounced as either ks or gz" (lexicon); IC7 teaches /k/ /s/ |
| sh | /sh/ | IC11 | no Extended Code unit; < ch > for /sh/ via Lesson 10; -tion etc. are "special endings" in polysyllabic work |
| th | /th/ | IC11 | Sounds~Write writes voiced and unvoiced both as /th/ |
| dh | /th/ | IC11 | voiced th; same label as th in Sounds~Write; < the > (breathe) is a consonant + e spelling |
| ng | /ng/ | IC11 | < ng > and < n > (think); one sound only where it matches the children's accent |
| kw | — | IC11 | not a sound: < q > spells /k/ and < u > spells /w/. Retire this id. |
| ou | /ow/ | EC8, EC9, EC15 | we call it 'ou'; Sounds~Write writes /ow/ |
| uu | /oo/ (as in 'book') | EC12, EC13 | we call it 'uu' (label 'oo') |
| eer | /eer/ | EC49 | a scope-and-sequence unit; the lexicon treats it as /ee/ + schwa |
| zh | /zh/ | none | in the lexicon (azure, treasure) and the manual's appendix, but no unit; when it is taught is **⚠ open** (DOSSIER §16.11 q8) |
| schwa | schwa /Ə/ | PW3, PW6 | taught in the polysyllabic strand; the older "EC50" is not current |

S~W's lexicon lists 44 sounds: 19 vowels (a ae ar air e ee er i ie o oe or oy ow u ue oo-book oo-moon schwa) and 25 consonants including x and zh (`SW_LEXICON_SOUNDS`) [Lexicon]. It also codes 'gz' (< x > in exam) and 'wu' (< o > in one, once), which have no unit.

**Checked against the lexicon.** Every spelling in `gpcsOfUnit`, `TANGENTIAL_TEACHING` and `otherSpellings` was checked against the lexicon's Part 2 (words listed by sound and spelling). All are there except (`LEXICON_AUDIT`): the post-2024 consonant + e spellings < ke > < pe > < de > < be > < fe > (the 2011 lexicon used split vowels); < ar > and < re > for /er/, which it files as schwa; /eer/, which it doesn't have; 'oh' and 'two'. It calls these "unusual/unique": < ai > and < ie > for /e/ (said, friend), < eir > < ayer > < ayor > (their, prayer, mayor), < our > and < ere > for /er/ (journey, were), < e > for /i/ (English), < ol > (symbol), < ough > for /oo/ (through), and the tangential < eigh > (height), < ou > (cough), < aigh > (straight), < eo > (people), < oa > (broad).

### 2.2 Spellings

`gpcsOfUnit()` over the whole sequence gives **174 S~W spelling→sound pairs** (default consonant + e policy, with PSC additions). Against our content:

- **The words in `phonics.ts` use 48 of the 174.** `GRAPHEMES` has 47 defaults and none of the split spellings. `parseWord`'s notation cannot express a split spelling; `SwSeg.gap` and `renderSegs()` do. (The generated unit files in `src/content/units/` use many more.)
- **S~W pairs with no word in `phonics.ts`**, by the unit that first teaches them:

  - IC11: n>ng
  - EC1: a>ae, ea>ae, te>t, me>m, ke>k, le>l, pe>p
  - EC2: e>ee, y>ee, ie>ee, the>dh
  - EC4: o>oe, oe>oe, ou>oe, ph>f, de>d, ne>n, ze>z, se>s, be>b
  - EC6: er>er, ir>er, ur>er, or>er, fe>f
  - EC7: ea>e, ai>e
  - EC8: ou>ou, ow>ou
  - EC10: oo>oo, ew>oo, ue>oo, u>oo, o>oo, ou>oo
  - EC11: i>ie, y>ie
  - EC12: oo>uu, u>uu, oul>uu
  - EC14: o>u, ou>u
  - EC16: st>s, c>s, ce>s, sc>s
  - EC17: s>z, se>z
  - EC18: al>l, el>l, il>l, ol>l
  - EC19: or>or, aw>or, au>or, a>or, ar>or, al>or, oor>or
  - EC20: air>air, are>air, ear>air, ere>air, eir>air
  - EC21: ue>ue, ew>ue, u>ue, eu>ue
  - EC23: oi>oy, oy>oy
  - EC24: ar>ar, a>ar, al>ar, au>ar
  - EC25: a>o
  - EC27: ei>ae, ey>ae, eigh>ae
  - EC28: dd>d, ed>d
  - EC29: ey>ee, i>ee
  - EC30: ui>i, e>i, y>i
  - EC32: ough>oe
  - EC33: nn>n, gn>n, kn>n
  - EC34: ar>er, ear>er, our>er, re>er
  - EC35: vv>v
  - EC36: ui>oo, ough>oo
  - EC37: g>j, ge>j, gg>j, dge>j
  - EC38: gg>g, gh>g, gu>g
  - EC40: gh>f
  - EC42: mm>m, mb>m, mn>m
  - EC43: oar>or, ore>or, our>or, augh>or, ough>or
  - EC44: wh>h
  - EC45: ch>k, cc>k
  - EC46: rr>r, rh>r, wr>r
  - EC47: tt>t, bt>t, ed>t
  - EC48: ss>z
  - EC49: eer>eer, ere>eer, ear>eer

- **S~W pairs missing from `flower.ts`:** e-e>ee, a>ae. That is a-e's replacement under the 2024 policy (EC26 and EC27 < a > as /ae/, as in apron and baby) and the 2023 PSC addition < e-e >. Also missing from the petals: < oor > for /or/ (door), now an EC19 spelling (06.2025 HFW chart; 2026 checks).
- **`flower.ts` gems outside the S~W unit sequence:** x>s, x>k, pp>p, bb>b, ch>sh, ti>sh, ci>sh, ssi>sh, s>sh, s>zh, si>zh, ge>zh, a>schwa, e>schwa, o>schwa, u>schwa, er>schwa, our>schwa. These are fine as future gems. S~W meets them in polysyllabic work (schwa, "special endings" such as -tion, -ture), through Lesson 10 (< ch > as /sh/), or tangentially; tag them "PW" rather than giving them EC units. < x > appears as x>k and x>s on the flower but as "x>ks" in words; that is consistent with S~W's "one spelling, two sounds".
- **Our unit 12 mixes four S~W units:** EC1 (ai, ay), EC2 (ee, ea), EC4 (oa, ow as /oe/) and EC11 (igh, ie). It teaches < ow > only as /oe/ (S~W teaches /ow/ in EC8 and the < ow > spelling unit in EC9) and < ea > only as /ee/ (EC3 teaches /ee/ and /ae/). It has none of: a-e, e, y, o, o-e, oe, i, y (/ie/), i-e.
- **Special words.** `SPECIAL_WORDS` lacks these Freshford Reception words: for, come, some, have, your, yours, like, when, what, where, there, these, who. It includes his, has, into (decodable at EC17 and EC10) and game names (Baron, Muddle, ninja, Sensei). "when" is decodable at IC11, but Freshford treats it as special until summer.

---

## 3. The game-side model (types in `sw.ts`)

- **`SwActivityId`** (28 ids, `SW_ACTIVITIES`). Each maps to S~W lessons, the skill it gives evidence for, and whether it is game-only.
  - Game-only pre-code oral work: `oral-listening`, `oral-blending`, `oral-segmenting`, `oral-first-sound`, `oral-middle-sound` (Decision 3). They are not numbered lessons. Sounds-Write's nursery course (*Getting Ready for Reading*, 2025) has seven "elements" (1 sound discrimination, 2 word awareness, 3 rhyme detection, 4 rhyme production, 5 sound detection, 6 segmenting and blending, 7 phoneme manipulation); only Element 1–2 samples are public, and `SwActivity.nurseryElement` records the nearest one. One of its writers found "limited value in doing phonemic awareness without letters", and the Reception guidance says environmental-sound listening "should not be part of your phonics lesson". Keep them short and don't count them towards S~W units.
  - Adaptations: `who-read-it-right` (the game can't hear the child, so two characters read and the child picks); `timed-review` (Speed Read, an official additional activity, not a numbered lesson).
- **`Evidence`.** One record per attempt: activity, skill, direction (read/spell/manipulate/oral), `gpc` ("g>p"), optional `gpcs`, word, structure, the unit it is evidence for, correct, firstTry, helped, the errors corrected (`ErrorType[]`), the teaching phase (i-do/we-do/you-do) and latency. Spelling items record one per slot. Reading items record one per word, with `gpc` = the spelling at the contrast or error position.
- **`MasteryModel`**, from `rollUp(evidence)`:
  - per GPC: read vs spell proficiency;
  - per skill: by word structure (Units 8–10 are about skill with adjacent consonants);
  - per unit: facets code, reading, spelling, manipulation, dictation, plus overall.
  - **Scoring:** only you-do items count; 1 for an independent first try, 0 otherwise (`helpedCredit` 0); the last 10 attempts; at least 5 attempts.
  - **Thresholds:** 0.75 is "move-on" and 0.8 "secure", S~W's 75–80%.
  - **`canMoveOn(model, unit)` follows the official lags.** Initial Code: the current unit's code, reading and spelling, and the previous unit's reading and manipulation, must be ≥ 0.75; dictation three units back only goes on a watch list. Extended Code: the current unit's code and reading, and the previous unit's reading; spelling (5 units back) is watched, never blocking.
- **`ItemSpec`** is a discriminated union for generators:
  - `word-building` (word, segs, bank, distractors, stretch, write);
  - `symbol-search` (sound, choices, context word);
  - `sound-swap` (chain of `SwapStep`: from, to, op substitute/insert/delete, position, nonsense flag; `swapBetween()` classifies a step);
  - `word-reading` (with "who read it right" foils or pictures);
  - `reading-in-text` (with yes/no or picture check);
  - `dictation` (word or sentence, `maxUnit` at least two units behind, board words);
  - `sound-sort` (sound → spellings baskets);
  - `spelling-sort` (spelling → sounds baskets);
  - `spelling-choice` (which /ae/ spelling in r_n);
  - `poly-reading` and `poly-spelling` (syllables with segs, schwa flags, sound or syllable level);
  - `oral-*` (target and foils, whole/stretched/segmented, optional spelling reveal).
- **Helpers:** `SW_SEQUENCE`, `gpcsOfUnit`, `knownGpcsAt`, `newGpcsIn`, `firstTaught`, `isDecodableAt` (code and IC structure), `structureOf`, `renderSegs` (split spellings), `applySplitPolicy`, `contentQuota`.
- **Reference data:** `PROGRESS_CHECKS` (which check after which unit), `TANGENTIAL_TEACHING`, `PSC_ADJUSTMENTS`, `LEXICON_AUDIT`, `PACING` (milestones, one-week units, Year 3 terms, lags).

---

## 4. Current level kinds against Sounds~Write

| Kind | What it does now | S~W equivalent | Deviations | Change |
|---|---|---|---|---|
| listen | Tap the picture for a whole, stretched or segmented word | none (game-only oral blending); S~W's blending scaffold uses two written choices | Pre-code, oral only | Keep short (one stop). Tag `oral-*`; exclude from unit mastery. |
| firstsound | "Which starts with /s/?" then reveal the spelling on a line | none (phoneme identity); the reveal resembles Lesson 1's "What's the first sound you hear?" | Letters meet the child via isolated sounds | Keep in world 1 only, as the bridge into Lesson 1. |
| soundhunt | Middle-sound listening, then build and read | Lesson 1 + Lesson 4 inside a game-only frame | Mixed | Split into items with proper activity ids. |
| dojo | Learn (isolated sound–spelling pairs), Find (4 choices), Build (≥2 distractors, help segments), read | Lessons 1/5 (build) + 4 (read); Find = Lesson 2 | Isolated pairs; Lesson 2 at once instead of one unit later; distractors; the help level segments the word (S~W: never segment while the child spells); `correction()` gives the answer first | Rebuild as Lesson 1/5 + Lesson 4 on the current unit's words: only the word's spellings, lines, stretched word, Teaching Through Errors scripts. Symbol Search only in review. |
| battle | Hear a word, spell it with tiles against a monster, optional timer | Quizzing (dictation of single words) / Lesson 4a | Uses current-unit words straight after teaching; S~W reviews recall with a lag | Draw words from units at least one behind (two for "recall"); record as `dictation-word`. |
| boss | Long battle over the world's units | Progress Check | No reading part; not tied to 6–8 weeks | Make it the land's Progress Check: word reading (Teaching Through Errors on errors) + word dictation, plus sentence dictation in the Extended Code. |
| run | Blend mode: hear sounds, catch the word; read mode: read the banner, catch the picture | Speed Read (fluency), Lesson 4 | Timed; says "That says…" (letters don't talk) | Keep as Speed Read with one-unit lag. Fix the "that_says" line. |
| swap | Change one sound (substitute only), random chains | Lesson 3 | No insert/delete, no nonsense words, current-unit words | Use `swapBetween` (insert/delete), `OFFICIAL_SWAP_CHAINS`, nonsense from IC8, one-unit lag. |
| story | Sensei reads rich pages; child reads decodable pages, makes choices, answers | Lesson 4 reading in connected text | Story code = the world's last unit (no lag) | Keep; make each story's `maxUnit` one unit behind where it is played. Add dictation. |
| sort | Timed basket sort, same sound, different spellings | Lessons 6/8 (concept 3); Lesson 10 when sorting by sound | Used in world 3 after IC5 and IC7, before concept 3 is taught; interleaved inside IC11 in world 5; timed | Move to the Bridging land. In the Extended Code use Lesson 6 (one word per spelling), 7 (read and write the list), 9 (seek the sound in a passage), 8 (review), and Lesson 10 "which sound?" for spelling units. |

**Missing kinds**, in order of importance: dictation of sentences (Lesson 4a, part of every S~W session); Lesson 10 spelling units with "try it a different way"; Seek the Sound (Lesson 9); polysyllabic Lessons 11–14; Lesson 6 word puzzles.

**Language to fix** (also in PEDAGOGY.md): "that says", "which one says", "makes this sound" become "is", "is a spelling of", "represents". Say "sound tiles" or "spellings", not "letter tiles".

---

## 5. Worlds against units

| World | Current content | S~W units | Deviation |
|---|---|---|---|
| 1 Bamboo Village | listen, firstsound m s / a t, dojo am at, mat sat, battle, soundhunt i, swap, run, firstsound n p, soundhunt o, swap, battle, story, boss | IC1–IC2 | Pre-code oral stops (game-only). S~W builds mat on day 1. |
| 2 Blossom Hills | dojo IC3, battle, run, dojo IC4, swap, battle, story, boss | IC3–IC4 | Dojo issues as above |
| 3 Misty Mountains | dojo IC5, sort c/k, battle, dojo IC6, run, dojo IC7, sort l/ll, swap, battle, sort s/ss, story, boss | IC5–IC7 | Three concept-3 sorts before IC11 and the Bridging Unit. IC7's concept is "a double consonant", not alternatives. |
| 4 Dragon River | dojo IC8, run, dojo IC9, battle, swap, dojo IC10, battle, story, boss | IC8–IC10 | No nonsense swaps; IC10 has 23 words and 3 pictures |
| 5 Shadow Castle | dojo sh ch th, battle, dojo ck ng wh, sort c/k/ck, run, dojo q u ve tch, sort ch/tch, swap, battle, story, boss | IC11 + half the Bridging Unit | Bridging sorts interleaved in IC11; Bridging /w/ and /v/ missing; no < n > for /ng/ |
| 6 Sky Temple | dojo ai ay, sort ai/ay, dojo ee ea, sort, battle, dojo igh ie oa ow, sorts, run, story, boss | parts of EC1, EC2, EC11, EC4 | Out of order; two spellings per sound; no spelling units; < ow > and < ea > single-sound |

`MILESTONES` in `worlds.ts` says "End of Year 1: unit 12" and "End of Year 2: unit 12". S~W's end of Year 1 is **EC26** and end of Year 2 is **EC49**.

**Missing to reach "end of Year 2 = EC49":**

- the Bridging Unit's /w/ and /v/, and IC11 < n > for /ng/;
- the rest of EC1, EC2, EC4 and EC11;
- EC3, EC5–EC10 and EC12–EC49 in full (38 of 49 units untouched, 11 of them spelling units);
- all polysyllabic work (PW1–PW4 are Year 1–2 content);
- sentence dictation;
- the quotas over the whole sequence (IC1 to PW9) add up to about **2,450 words**, **900 pictures**, 530 dictation sentences, 58 decodable stories and 730 polysyllabic words (`contentQuota`).

---

## 6. Content build-out plan

### 6.1 The arc: the lands of the World Flower

The island's World Flower has 44 petals (sounds) and gems inside each petal (spellings). The arc follows S~W's levels: first every petal comes back (Initial Code), then each petal's gems are found (Extended Code), and the "more spellings" year returns to finish them. Names after land 6 are placeholders.

| Land | S~W units | School time | Petals and gems restored | New mechanics |
|---|---|---|---|---|
| 1 Bamboo Village | IC1–2 | R autumn | a i m s t n o p | oral stops, Lesson 1/4, swap |
| 2 Blossom Hills | IC3–4 | R autumn | b c g h d e f v | Symbol Search review, dictation of sentences from IC2 |
| 3 Misty Mountains | IC5–7 | R autumn/spring | k l r u j w z x y; ff ll ss zz as gems | Lesson 5 (two letters, one sound); no sorts |
| 4 Dragon River | IC8–10 | R spring | (skills: adjacent consonants) | nonsense Sound Swap, insert/delete |
| 5 Shadow Castle | IC11 | R spring/summer | sh ch th ng ck wh q·u ve tch | Lesson 5 for digraphs and tch |
| 6 Rainbow Bridge *(new)* | Bridging Unit | R summer | /k/ c k ck · /ch/ ch tch · /w/ w wh · /v/ v ve | Lesson 6/7/8: one sound, different spellings |
| 7 Sky Temple | EC1–5 | Y1 autumn 1 | /ae/ /ee/ /oe/ gems; < ea >, < o >; first consonant + e tiles (te me ke le pe, then de ne ze se be) | Lesson 6/7/9, Lesson 10 spelling units, PW1 from EC4 |
| 8 *Coral Coast* | EC6–9 | Y1 autumn 2 | /er/ /e/ /ow/; < ow > | Seek the Sound, PW2 |
| 9 *Moon Marsh* | EC10–15 | Y1 spring 1 | /oo/ /ie/ /oo/ /u/; < oo >, < ou > | PW3, PW4 review |
| 10 *Autumn Orchard* | EC16–22 | Y1 spring 2–summer 1 | /s/ /l/ /or/ /air/ /ue/; < s >, < ew > | |
| 11 *Star Dunes* | EC23–26 | Y1 summer 2 | /oy/ /ar/ /o/; < a > | end of Year 1: every vowel petal back |
| 12 *Island of Echoes* | EC27–34 | Y2 autumn | more spellings /ae/ /ee/ /oe/ /er/; /d/ /i/ /n/; < y > | returning to earlier lands for hidden gems |
| 13 *Crystal Caves* | EC35–42 | Y2 spring | /v/ /oo/ /j/ /g/ /f/ /m/; < g >, < gh > | |
| 14 *Summit Temple* | EC43–49 | Y2 summer | /or/ more, /h/ /k/ /r/ /t/ /z/ /eer/ | end of Year 2: the flower is complete |
| 15+ *The Library of Long Words* | PW5–PW9 (schwa and suffixes in polysyllabic words) | Y3–6 | syllable bridges; schwa, suffixes | Lessons 13–15 |

Each land ends with a boss that is a Progress Check (`PROGRESS_CHECKS` says which official check matches the land's last unit), which fits S~W's 6–8-week rhythm (about three to four units).

### 6.2 Words per unit

`contentQuota(unit)` in `sw.ts`. If a unit's code can't produce the quota (IC1 has only a handful of words), use every valid word.

| Unit type | Words | Pictureable | Per spelling / sound | Swap chains | Dictation sentences | Polysyllabic | Story |
|---|---|---|---|---|---|---|---|
| IC1 | all (6+) | 2 | – | 1 × 5 | 3 | – | 1 |
| IC2–IC7 | 30 (IC2: 20) | 12 | – | 2 × 6 | 8 | – | 1 |
| IC8–IC10 | 40 per structure mix | 12 | – | 3 × 8 incl. insert/delete | 8 | – | 1 |
| IC11 | 60 | 20 | 8 per new spelling | 2 × 6 | 8 | – | 1 |
| Bridging | 30 | 9 | 10 per spelling (the official /v/ lists have only 3 and 5 words) | – | 6 | – | – |
| EC sound unit | max(30, 8 × spellings) | max(12, 3 × spellings) | 8 one-syllable words per spelling, target sound once | 1 × 5 | 8 | 10 from EC4 | 1 |
| EC spelling unit | 8 × sounds | 3 × sounds | 8 per sound, target spelling once | – | 6 | 10 | – |
| PW stage | 30 | 10 | – | – | 8 | 30 | 1 |

Coverage against the quota is tracked in Codex's reports in `playtest/content/`. The official progress checks use 6–10 Initial Code words and 20 Extended Code words per check, and their word lists (DOSSIER §9.5) are good seeds for each unit.

Kinds of words each unit needs:

- **Decodable words** using only code up to the unit (`isDecodableAt`), each containing at least one of the unit's new pairs. Units 8–10 instead need the new structure.
- **Pictureable nouns and clear actions** for picture games (Run read mode, "who read it right" picture choice, Sort, first sounds).
- **Sort words:** one syllable, the target sound exactly once, spelled with the basket's spelling exactly once.
- **Contrast sets** for "who read it right" and Lesson 10: pairs differing at one position (bead/bread/break).
- **Dictation sentences** built from code at least two units behind, with special words flagged.
- **Polysyllabic words** from EC4, split into syllables, with schwa syllables flagged.
- **Oral-only picture words** (any unit) for the pre-code games.

### 6.3 Assets per unit

- **Word audio:** one British English recording per word (as now). Plus "spelling voice" syllables for polysyllabic words (mul-ti-ply) and each dictation sentence read naturally.
- **Stretched audio:** continuant-first words used in Lesson 1 builds (IC1–IC9 heavily; the first builds of each EC unit), for example "sssaaat".
- **Pure sounds:** already cover the 46 ids. Add nothing for spellings (S~W teaches spellings through words, not letter sounds).
- **Pictures:** per quota, one unambiguous thing per picture, no text.
- **Stories:** one decodable story per land, or per unit when possible. Its code must be one unit behind where it is played.
- **Sensei lines:** each land's new teacher language, e.g. "two letters, one sound", "three letters, one sound", "That's a spelling of the sound…", "Try it a different way", "This can be /a/, but in this word it's /ae/", "Say it precisely in its syllables". Plus every Teaching Through Errors script, templated by sound and spelling.

### 6.4 Generation pipeline (for Codex)

1. **Inputs per unit:**
   - `knownGpcsAt(unit, { split, psc })`, `newGpcsIn(unit)`, and the unit's structures (IC) or single-syllable limit (EC);
   - `contentQuota(unit)`;
   - the target sound or spelling (EC);
   - for spelling units, the sounds and their example words.
2. **Candidates:** from a British children's word list (e.g. a UK children's frequency list) with Southern British pronunciations (a British pronunciation lexicon such as Unisyn in an RP accent; not CMUdict, which is American).
3. **Alignment:** align letters to our spellings with dynamic programming over the GPC table, producing `segs`. Under the default policy a final consonant + e is one spelling (g.a.te); split spellings (`gap`) only for the Freshford variant. Reject any word whose alignment needs a pair that is not known at the unit (consonant + e spellings enter at the units in 1.5).
4. **Validation:** filter with the validator (6.5). Emit one file per unit.
5. **File format:** `src/content/units/EC1.ts` exporting:
   - `words`: `{ text, segs: "r.ai.n", unit: "EC1", pic?: "prompt", tags: ["sort:ai", "picture", "dictation-safe"] }`
   - `sentences`: `{ text, maxUnit }`
   - `chains`: `string[][]`
   - `poly`: `{ text, syllables: "rain|bow", schwa?: [1] }`

   Segment notation: `.` separates spellings; `=` overrides the sound (`th=dh.i.s`, `q.u=w.i.ck`); `:n` gives a split spelling's gap (`p.a-e:2.s.t`).
6. **Human review:** Jonas or a teacher checks a 10% sample per unit, especially pictures and accent-sensitive words.

### 6.5 Validator rules (exact)

`VALIDATOR_RULES` in `sw.ts`. A word list passes when every word passes every applicable rule:

1. **segmentation:** `renderSegs(segs)` equals the lower-cased text. Every seg is a single spelling from the S~W GPC table; split spellings use `a-e` style with `gap`.
2. **gpc-known:** every `g>p` occurs in `gpcsOfUnit()` somewhere in `SW_SEQUENCE`. PSC additions are allowed only when the file is flagged for them.
3. **decodable:** every `g>p` is in `knownGpcsAt(word.unit)`. Special words are exempt only if listed in the current special-words set and flagged `special`, with the untaught spelling marked.
4. **structure:** in Initial Code units, `structureOf(sounds)` is one of the unit's structures (IC1–7 VC/CVC; IC8 adds VCC/CVCC; IC9 CCVC; IC10 CCVCC/CVCCC/CCCVC). In the Extended Code, one-syllable words have at most three adjacent consonants on either side of the vowel.
5. **british-spelling:** the word is in a British English word list; no US forms (color, gray, mom, candy, diaper, pajamas).
6. **british-pronunciation:** segs follow Southern British, non-rhotic pronunciation. Exclude accent-dependent words (bath, grass, path, fast, last, castle, after; book/look vowel) unless the file tags them. /ue/ words must have /y/+/oo/ in speech (few, cube).
7. **age-appropriate:** the word is in a children's vocabulary list for ages 3–8. Words for IC1–IC11 must be concrete and familiar to a Reception child.
8. **no-slang:** no slang, brand names, rude, scary, violent or body-function words, and no proper nouns except taught names (Sam, Tim, Pip) and flagged capitals.
9. **homophone:** a word sharing its sound sequence with another word in the pool (which/witch, sea/see) needs a picture or a sentence before it can be dictated (`dictationSafe`).
10. **sort-single-occurrence:** sort words contain the target sound exactly once and the target spelling exactly once.
11. **swap-one-change:** every chain step passes `swapBetween()` (one substitute, insert or delete) and every word is decodable at the unit. Nonsense words appear only from IC8 and are flagged, and must be pronounceable English syllables.
12. **special-words:** special words come from the official unit lists (`INITIAL_CODE_UNITS[].specialWords`) and the school list for that point (`FRESHFORD_SPECIAL_WORDS`).
13. **picture:** a pictureable word has a picture prompt describing one unambiguous thing with no text.
14. **polysyllabic-syllables:** syllables follow the `SYLLABLE_EXAMPLES` convention; each syllable is decodable at the unit; schwa syllables are flagged with the spelling the "spelling voice" uses.
15. **unit-tag:** `word.unit` is the first unit at which the word is decodable, unless the file marks it as review.

---

## 7. Refactor plan, in priority order

1. **Adopt the ids.**
   - Give every `Level` an `sw: SwUnitId` (IC1…EC49, BR, PW1…) and a list of `SwActivityId`s.
   - Map `units: number[]`: game units 1–11 are IC1–11; retire unit 12 into EC1, EC2, EC4 and EC11.
   - Replace `MILESTONES` with `PACING.milestones` (EC26 end of Year 1, EC49 end of Year 2).
   - Retire the `kw` PhonemeId. Relabel `ou` as /ow/ and `uu` as /oo/ (book) in grown-up text.
2. **Evidence and mastery.**
   - Replace the `read`/`spell` skill counters in `store.ts` with an append-only `Evidence` log (capped per key) and `rollUp()`.
   - Stars count only independent first tries in you-do.
   - Gate the next unit with `canMoveOn()`, which already encodes the official lags.
   - Derive gem energy from GPC proficiency instead of separate counters.
3. **Teaching Through Errors engine.**
   - One `correct(errorType, ctx)` that renders `TEACHING_THROUGH_ERRORS` scripts as Sensei lines with the child's word, sound and spelling.
   - Replace `correction()` in Dojo, which says the answer on the second miss and "That's /i/. We need /a/", and Run's "that_says".
   - Classify errors per item type: misread, added, omitted, alternative, untaught.
4. **Dojo becomes Lesson 1/5 + Lesson 4.**
   - Only the word's own spellings, jumbled (`tileBank(..., 0)`; remove the floor of 2 distractors).
   - Lines and stretched audio; never segment while the child spells.
   - Remove the isolated Learn phase; move Find (Symbol Search) to review with a one-unit lag.
5. **Sessions of three parts.** A level becomes `review` + `current` + `text` (`SESSION` for IC and EC), each a list of `ItemSpec`s from generators with the right lag. Review picks the weakest units from the mastery model.
6. **Dictation (Lesson 4a).**
   - New mechanic: Sensei says a sentence; the child builds each word with tiles, saying the sounds; then re-reads.
   - Content comes from two units back; untaught high-frequency words appear "on the board".
   - Add single-word quizzing to battles.
7. **Sound Swap:** insert and delete (`swapBetween`), `OFFICIAL_SWAP_CHAINS`, nonsense chains from IC8, one-unit lag.
8. **Reorder worlds 3–6.**
   - Remove the sorts from world 3, and the c/k/ck and ch/tch sorts from world 5.
   - Add the Rainbow Bridge land (Bridging Unit: /k/, /ch/, /w/, /v/ with Lessons 6, 7, 8).
   - Rebuild Sky Temple as EC1–EC5 in S~W order, with EC3 < ea > and EC5 < o > as Lesson 10 spelling units, and PW1 from EC4 week 2.
   - Add IC11 < n > for /ng/ (think, pink); it is official (2020 plan; 2025 PSC analysis).
9. **Content pipeline.**
   - Extend `GRAPHEMES`/`parseWord` to all 174 pairs under the consonant + e policy (split spellings with `gap` only for the Freshford variant).
   - Move word lists to per-unit files; run the validator in `validate.ts` (CI).
   - Have Codex generate EC units in order against the quotas.
10. **Grown-ups report.**
    - Per unit: code, reading, spelling, manipulation and dictation, each labelled with its expected lag ("spelling usually catches up about five units later").
    - A watch list; the four concepts reached; "At school this term" from `FRESHFORD_TIMELINE`.
    - A mini diagnostic (blending, segmenting, deletion) modelled on the official test; S~W language tips for parents.

Later: polysyllabic lessons (PW1–PW4 in Year 1 lands), Seek the Sound in stories, Lesson 6 word puzzles, schwa and suffixes in the polysyllabic strand, and the Year 3–6 library.

---

## 8. What we know, and what is still open

**Settled by public official sources** (after the dossier and the free downloads):

- the scope and sequence of all three levels, the four concepts and three skills (Handbook 2026 wording);
- lesson numbers and names (1–15 and 4a), which lessons go in which part of the session, and "3 or 4" lessons per session;
- pacing per term and year (Reception to Year 6), the one-week units, the lags, the move-on rule and its reasons;
- the Bridging Unit's current content (/k/, /ch/, /w/, /v/) with word lists and official stories;
- every Extended Code unit's spellings (record sheet and word lists) and an official post-2024 word set for every sound unit to 48 (progress checks);
- the 2024 split-spelling change, and where consonant + e words appear in official post-2024 material;
- high-frequency words by Initial Code unit, the tangential-teaching sheet and the PSC adjustments;
- full or near-full scripts for Lessons 1 (steps 1–3), 4a and 10, Top Tips for 1, 3, 5, 6, 15 and 11–14, and an official Lesson 11 demonstration;
- Teaching Through Errors templates for most reading and writing errors, the blending ladder (with EC 4.2/4.3 by name), the Lesson 4(a) correction list and the polysyllabic sheet;
- assessment: the 2026 progress checks (which check, what each covers), the Tracker's error tags, quizzing, SpeedRead, the diagnostic test;
- the polysyllabic strand's structure sequence, lesson progression, lag and Years 3–6 guidance;
- the lexicon's inventory of sounds and spellings (`LEXICON_AUDIT`).

**Still open** (the Manual and portal are members-only; the numbers are DOSSIER §16's):

1. The Manual's main scripts for Lessons 2, 7, 8, 9, 12–14, the post-2024 Lesson 6 (Parts 1, 3, 4) and Lesson 15 Part 3; the full title of Lesson 5 (§16.4, §16.12).
2. The wording of EC 4.2 and 4.3; official scripts for a guess, an added sound and a misread taught spelling; when untaught spellings in free writing are corrected (§16.6).
3. Which consonant + e spellings each unit formally teaches (§16.11 q2); < ear > in Unit 6 and < oe > in Unit 10 (§16.11 q1, q4); when /zh/ and < ch > = /sh/ are taught (§16.11 q8).
4. The bridging-level Lesson 6 script and summing-up questions; why /l/ was replaced by /v/ (§16.10).
5. Unit 10's structure label (5 or 5–7 sounds; CCCVC or not), the layout of < x > words, and < n > before /k/ in Unit 8 (§16.9).
6. What "75–80% proficiency" is measured on; per-child pass marks (§16.15).
7. How the one-week units change the week grid; the Year 1 one-week list (§16.16); Year 3's "33 sound units" (§16.11 q6).
8. The Y3–6 course manual, its vocabulary scope and sequence and suffix order (§16.12 q9–q10).

**Questions for Jonas** (ask Freshford's Year 1 teacher, who is Sounds~Write trained):

- Does Freshford still teach split spellings (a-e) or has it moved to "a + te"? (The game follows the official guidance either way.)
- Does the school teach the Bridging Unit (/k/, /ch/, /w/, /v/), < tch > and < ve >?
- Does the school follow the official order or its own timeline (Y1 spring order, ph and early EC in Reception)?
- Does it use the Sounds-Write progress checks, the Tracker or the adapted PSCs?
- Can we have the Seesaw word lists per unit? They would be ideal validator seeds.

---

## References

Official Sounds-Write (bibliography ids from DOSSIER §17 in brackets):

- **Handbook 2026** – Phonics Lead Handbook, September 2026 [O1]
- **S&S** – Initial Code, Extended Code and Polysyllabic Words scopes and sequences (11.2023) [O9, O238, O261] and the UK Scope and Sequence (portal) [O10]
- **Record sheet / Word lists / Worksheets** – Manual Part 3 record sheets [O14]; manual pp. 147–153 Extended Code word lists [O240]; Part 3 Section 2 worksheets [O243]; Initial Code vocabulary and HFW table [O198]; revised pp. 99–100 [O199]; IC words to read and spell (2019) [O160]
- **Checks 2026** – Progress checks for the Initial Code [O152] and the Extended Code [O153] (with the reading spreadsheet [O242]), the October 2024 edition [O241], and the Progress checks FAQs [O122]; **Tracker** – Progress Tracker demo and screenshots [O137, O138, O108]
- **Plan R 2023 / Plan Y1 2023 / Plan Y2 2023** – Planning Guidance, first/second/third year of school (England, 06.2023) [O30, O60, O64]; **Timelines** – IC and EC PSW timelines 07.2024 [O200, O239] and 06.2023 [O72]
- **Y1 new 2024 / Y2 start 2024** – Schools new to Sounds-Write in Year 1; Starting Sounds-Write in Year 2 or beyond (10.2024) [O201, O233]; **Mixed age** (06.2023) [O255]
- **Impl 2020** – Suggested implementation of the Initial Code (2020) [O19]; **Tracking form 2020** [O206]
- **PSC 2024 / 2023** – The Phonics Screening Check Guidance (England) 09.2024 and 06.2023 [O11, O245]; **PSC 2025 blog** – PSC 2025 analysis [O197]; **PSC reflective guide** (2026) [O343]
- **HFW 2025 / HFW 2023** – High Frequency Words in Sounds-Write (06.2025, uploaded 2026; 06.2023) [O91, O145]; **Tangential** – Tangential Teaching (09.2024) [O244]; **Statutory 2025** – analysis of the statutory spelling lists (12.2025) [X71]
- **Split 2024** – Changes to guidance on the split spelling (September 2024) [O18]
- **Top Tips** – Lessons 1, 3, 5, 6, 15 and the polysyllabic lessons [O36, O25, O45, O61, O70, O58]; **L4a page** [O35, O117]; **L10 pages** [O37]; **General points** [O16]; **doc 47**, **doc 25**, **doc 45**, stimulus cards [O67, O150, O273, O268]; **Introducing Polysyllabic Words** (10.2024) [O226]; **L11 demonstration** (2020) [O264]; **'autobiographical'** Lesson 12 clip [O266]; **Podcast Ep 20** [O65]
- **TTE-PSW** – Error Correction, Lessons Eleven to Fourteen (© 2021) [O68, O149]; **Blending Masterclass** (03.2026) [O102]; **Readers guide** (2012) [O110]; **Parent course** – Help your child to read and write, Parts 1–2 [O20, O44, O104, O106]
- **Quizzing** (2019) [O95]; **SpeedRead** [O94]; **Diagnostic** – Criterion-Referenced Phoneme Skills Tests and Alphabet Code Knowledge Test [O338]
- **Lexicon** – English Spellings: A Lexicon (Philpot, Walker & Case; April 2011) [O17]; local PDF and text in `assets-src/sw-sources/downloads/`
- **Free downloads (September 2026)** – *Bridging Unit Christmas Stories* (2024); *Christmas Edition Phonics Activities* for the Initial and Extended Code (2024); *Bert's Plan* (EC6, 2024); *The Glow in the Snow* (EC4, 2025); Extended Code sound posters for older readers (2025); *Initial Code Egyptian Adventures* (2026); First Steps e-books (IC 2021, EC 2022); Seek the Sounds texts (2023); *Santa's Snack* (IC3); *Sounds-Write in the Early Years* samples (2025) — `assets-src/sw-sources/downloads/INDEX.md`
- **Pedagogy** – Our Pedagogy page [O24]; Planning Phonics Lessons page [O41]; **Poster 2024** – Skills and Concepts posters [O3]; **Membership video** (2026) [O48]
- **Blogs** – The Cumulative Nature of Sounds-Write (2024) [O210]; Supporting Student Reading Success Through Assessment (2025); Mastering Phonemic Awareness (2024) [O23]; PSC 2024 analysis [O76]; PSC mid-year strategies (2024) [O262]
- **2017 deck** – parent presentation © 2017 [O4]; **Parents' guide** (06.2023, 09.2024) [O143, O196, O112]; **ELG FAQ** [O190]

Research compendium: `assets-src/sw-sources/research/DOSSIER.md` (26 September 2026).

Founder: **Walker 2020** Word building; **Walker 2014** Linguistic phonics: a practical example; **Walker 2016** How to correct common spelling errors; **Walker 2015** non-words (theliteracyblog.com).

School: **Freshford** Reception and Year 1/Year 2 parents' presentations (23 September 2026).

Secondary: Grange Primary (Phonics Expectations 2024-25 and 2026-27), Fairfield, Iford and Kingston, St Bede's, St Bernadette's, Stanley Road, English Martyrs, Barley Hill, Spring Gardens, Newport Gardens, St Teresa's.

Full URLs and local file names are in `SOURCES` in `src/content/sw.ts`.
