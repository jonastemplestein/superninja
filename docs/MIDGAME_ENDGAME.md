# The middle and end game: Year 1, Year 2 and after

**27 September 2026. The game designer's spec, revision 2.** Nothing here is built yet. Three judges scored revision 1: Sounds~Write fidelity (7/10, [midgame/judge-sounds-write.md](midgame/judge-sounds-write.md)), a six-year-old's eye (7/10, [midgame/judge-six-year-old.md](midgame/judge-six-year-old.md)) and building it on a phone (6/10, [midgame/judge-feasible.md](midgame/judge-feasible.md)). This revision fixes every must-fix they named, and most should-fixes. §R lists each one and where it went. The work itself is in [midgame/BUILD_PLAN.md](midgame/BUILD_PLAN.md), the honest marketing in [midgame/MARKETING_PLAN.md](midgame/MARKETING_PLAN.md) and the bots and checks in [midgame/PLAYTEST_PLAN.md](midgame/PLAYTEST_PLAN.md). Revision 1 is kept at [midgame/MIDGAME_ENDGAME.v1.md](midgame/MIDGAME_ENDGAME.v1.md) for diffing. **[R3: Jonas, Baron final only]** An amendment the same evening (§R.3) makes the Baron a fighter only once, in the final battle, always with the hardest words; the first step for today's game, the interim swap, is in [fix-requests.md](fix-requests.md), "Baron final only: the interim swap (27 Sep)".

**What Jonas asked** (27 September), in short:

> "…are these games really good to learn how to spell magician and optician and division and multiplication and all the shuns… I also don't know that I understand, yeah, how the boss battles work. Is the panda just like the boss of lame sounds? Because more complicated sounds come later, right? Like, I feel like the middle and end game isn't really well thought through."

And later the same day, as a direction to design around: overworld **maps** that are broadly pre-school, Reception, Year 1 and Year 2 (never called that); game types that only appear on some maps; a school-entry path that says "we assume you know these things, but no worries if not", with **really obvious catch-up**; and, for later, a **weekly word list** deep link that turns the school's list into about five minutes of practice a day.

**Inputs.** The Sounds~Write research ([midgame/sw-y1y2.md](midgame/sw-y1y2.md), "SW" below), the audit of today's game on production ([midgame/audit.md](midgame/audit.md)), the prior-art report ([midgame/prior-art.md](midgame/prior-art.md)) and the three judges' reports. Also [SOUNDS_WRITE_MODEL.md](SOUNDS_WRITE_MODEL.md), [MULTI_SOUND.md](MULTI_SOUND.md) (Sound Detective), [TEACHER_SCRIPT.md](TEACHER_SCRIPT.md) (the voice rules and table format), [SPEECH_TEMPLATES.md](SPEECH_TEMPLATES.md) (templated speech, "SPT"), [PERF.md](PERF.md) (the budgets), [MAP_DESIGN.md](MAP_DESIGN.md) (one glowing stone), [FIRST_MINUTES.md](FIRST_MINUTES.md) §4, §9–10 (the opt-in and the school start points), [READ_SLIDER.md](READ_SLIDER.md) and [architecture/planner.md](architecture/planner.md). Sounds~Write's Phonics Screening Check guidance (09.2024, `assets-src/sw-sources/sw-psc-guidance-england-2024.txt`, also in `PSC_ADJUSTMENTS` in `src/content/sw.ts`) was re-read for this revision. The Freshford Year 1–2 parents' presentation (23 September 2026) describes the weekly lists.

**Rules for this document.**
- Sounds~Write material is quoted a phrase at a time, and word examples are a few single words. Full lists stay in the git-ignored `assets-src/sw-sources/`.
- British English. A **sound** is /ae/; a **spelling** is < ai >. A middle dot marks a syllable break (sun·set).
- **School years never appear in the child's view.** They appear here, and on the grown-ups' pages, as "Year 1" or "Y1".
- Sensei's lines follow TEACHER_SCRIPT §2: whole sentences, a pure sound only at the end of a sentence, no letter names, a spelling never "says" or "makes" a sound. Line ids starting `tv_` are new fixed lines to record; ids starting `w_`, `ws_` are SPT templates (one take per value). The tables have TEACHER_SCRIPT's columns.
- Stage sizes are in stage px (the 1280 × 720 stage). On production the stage is drawn at **0.492** on an 844 × 390 phone, 0.471 on 667 × 375 and **0.45** on 740 × 360 (measured, `playtest/runs/midgame/judge-feasible/scale.txt`). So **nothing a child taps is under 90 stage px, or 98 where it must work on a 360-dp phone.**
- Decisions made without asking are marked **Decision** and collected in §7 for docs/DECISIONS.md.
- **Revision marks.** A section or paragraph changed in revision 2 starts with **[R2: …]**, naming the must-fix it answers: **SW** is the Sounds~Write judge, **SY** the six-year-old judge, **F** the feasibility judge; a lower-case **s** marks a should-fix (SW-s3). Unmarked text is unchanged in substance from revision 1, apart from the renames (§R.2) and small edits that follow from a marked change; `diff docs/midgame/MIDGAME_ENDGAME.v1.md docs/MIDGAME_ENDGAME.md` shows every change. **[R3: Jonas, Baron final only]** marks the amendment of 27 September evening (§R.3): the Baron is fought only in the final battle.

---

## R. What changed in revision 2

### R.1 Every must-fix, and where it went

| Must-fix | The judge's point, in short | Fixed in | How |
|---|---|---|---|
| **SW1** | Sounds~Write's own PSC guidance was ignored: < ar oi oy > came after the check, the practice check fell in the check's week, < sc > came before it | §1.2 (Sky Isles), §1.4, §3.4, §3.8, §6.3 item 11, M21 | The official unit order stays. The guidance is applied as additions inside units and as tangential "met early" stones: < ie > *chief* in EC2; < ou > *mould* and < ph > in EC4; < ou > *you* in EC10; /oy/ met with /ow/ in Cloud Town; < ch > as /sh/ and /k/, < g > as /j/, < c > as /s/, < s > as /z/ and < ar > met in Circus Island (before Easter); < sc > after the check; < er > as schwa in the long words. The practice check moves to Autumn Orchard |
| **SW2** | Eight Year 1–2 bosses spelt their land's newest code; the lag rules contradicted each other | §2.3, §2.4, §2.5, §6.3 item 5, M12 split into M12a–c | Three named lags: reading uses code up to the check's unit; boss dictation uses code at least two sound units before it; rival tiles in ordinary battles only four or more units back. Every signature re-pointed, with a "code and lag" column to check it |
| **SW3** | The Year 1 long-word strand lagged the official check words | §1.2, §4.2, §2.4 (big attacks) | Realigned land by land to the official checks' own long words |
| **SW4** | §1.3 claimed curriculum targets no land taught | §1.3, §1.2, §4.2 | -ing, -er, -est, -s/-es and un- are syllables in the long words from Cloud Town; -ed is met in dictation, Sensei taking responsibility; the days of the week arrive with their code; Year 2 gets its suffix words and spells *treasure* and *usual* |
| **SW5** | "Four- and five-syllable words" illustrated with three-syllable ones; *multiplication* sold as Year 2 | §0.1, §0.2, §1.3, §2.1 | Year 2 reads and spells three-syllable words and meets its first four-syllable ones; *multiplication* is a five-syllable stretch, the final battle's encore |
| **SW6** | The Bridge Troll taught a false position rule | §1.2, §2.4 | "Pay the gem this word uses": each word read first, the choice is word knowledge; Sensei may notice a pattern afterwards, never a rule |
| **SW7** | The root clue pointed the wrong way (*add → addision*) | §3.3, §4.3, §2.4 | -tion gets no root clue ("the ending most words use"). The root clue is only for -cian after < c > and -ssion after < ss >. *optician* links to *magician* by Lesson 15 |
| **SW8** | Wrong readings that are real words (*greet*) or accents (*booook*, *noo*) | §2.4, §2.5.2 | Every wrong reading passes MULTI_SOUND §4.1's try-safety and accent check; the Magpie misreads *break*; the Owl's and the Scarecrow's misreadings are gone |
| **SW9** | Alien Words could mark a valid reading wrong; a two-way choice isn't PSC scoring | §3.8, §1.3, §1.4 | Wrong readings are always real error types, never another valid sound; PSC structures only; the practice check is read aloud to a grown-up who ticks each word |
| **SW10** | Lesson 6 has no choice; the fan put a choice on day one | §3.2, §6.2 | The dojo's word puzzle uses the word's own tiles; the fan starts at the Lesson 7 step, with the peek |
| **SY1** | A daily player finishes Year 1 in 5–7 weeks, with no mastery gate; "stay close to school" means weeks of "Soon" | §1.2 (play time), §1.7, §2.6, M11 revised, M22–M24 | A play-time table per land; two paces ("In step with school" for school children, "Own pace" otherwise); a bridge built one plank per practice day; at most three new stones a day; a boss-shaped moment about once a week (the guardian's skirmish, minion raids, the lair) |
| **SY2** | Victories weren't pure wins | §2.3, §2.5, §2.6, §5.1 | The long word staggers the boss and the sentence is the finishing move, full stop as the knockout; the imp grabs a gem during the fight, when Sensei helps, and taunts about itself; the stripe is always sewn, in silver thread below the pass mark |
| **SY3** | Signature moves quizzed brand-new code with many rivals | §2.3, §2.4 | The same fix as SW2; a signature on the newest code is a reading move; at most three gems in any signature |
| **SY4** | Five bosses were "pick a gem from a pile"; seven reused "reads it wrong" | §2.4 | One physical verb per boss (pop, catch, shoo, walk the rope, dig, climb, put the ending back); "who read it right" and Sound Detective at most twice per map as boss moves; -tion is the Roaring Boar's signature |
| **SY5** | Old saves have seen the Baron say sorry; the Baron vanished for five lands | §2.2, §6.1 | A once-per-save "It was a trick!" scene; the Baron introduces every guardian, his balloon floats one land ahead, and the petal imp is openly his |
| **SY6** | "Wyrm" can't be decoded by the target reader | everywhere | **Word Dragons** (and one creature for every long word, §R.2) |
| **SY7** | Sensei's voice didn't grow up | §3.0.4 (new), §1.5 | Concept lines once per land at most; five seconds of talk before a replay's first action; Year 2 versions of Reception-flavoured lines; a playtest metric |
| **SY8** | Lands were units, not places | §1.2 (land cards) | A five-line card per land: the place, the trouble, the new verb, the set piece, the boss |
| **SY9** | Stories weren't plot chapters | §3.8, §4.1, §2.2 | Two chapters per land: what the guardian did, and where the chest is; the boss drops the next land's first chapter |
| **SY10** | The final battle was a quiz of greatest hits, about 8 minutes | §2.5.3 | The beaten guardians come back to help; the throne of muddled letters stands up; the last sentence is four words; about 6 minutes |
| **F1** | No slice for the content model; positional world numbers | §6.2, §6.4, BUILD_PLAN Slice 0 | `Level.sw`, one word source over `units/*.ts`, `GRAPHEMES` grown step by step, stable world keys, append-only level ids |
| **F2** | The stage scale is 0.49, not 0.54 | the rules above, §1.9.5, §3.0–§3.8 | Every size rechecked against 90 stage px (98 on a 360-dp phone) |
| **F3** | The bank must be bounded by `rowFit()`, not by rung | §3.0.3, §3.2 | Rivals added in confusion order while tiles stay at 90 px or more, up to 7 tiles; R4 is "no rims, the child's own confusions", not "every spelling known" |
| **F4** | The boss stands where the long word goes | §2.3, §3.0.1, §3.1 | The boss steps back to a perch at 0.55× top right during build phases; the row's width limit drops to 840 px; the sweep checks the boss's box |
| **F5** | The read-back at 1.3× overflows | §3.0.1, §3.0.2 | Read-back scale = min(1.3, 770 ÷ width), over the slider's rail; `RAIL` becomes a parameter |
| **F6** | 9-word, 30-sound sentences don't fit and take 30 taps | §3.5 | At most 8 words and about 22 sounds; Year 2 may pre-fill the non-target words as whole-word tiles; a boss's last word is at most five words |
| **F7** | New word-slot lines used the old lead-in shape and weren't counted | §3.1, §3.2, §3.6, §4.4 | Written as SPT templates (`w_syl_hear`, `ws_gem_we_need`, a `~syl<i>` clip mod); about 2,800 clips, about 2.5 hours and $3 |
| **F8** | 600 isolated syllables is the pure-sound problem again | §3.0.2, §4.4 | One spelling-voice take per long word, with pauses, cut into `SYLL_TIMES`; about 380 takes; Jonas's ear on 20 |
| **F9** | Alien words "generated from the child's code" can't be pre-rendered | §3.8, §4.4 | A closed list of about 120 per stage; slow words spliced from the pure sounds; a gate and Jonas's ear for the blended word |
| **F10** | A nightly job for unknown list words is an ops system with teaching risk | §1.9.3, §1.9.7 | v1 plays only words the game has; others show as "not in the game yet" and are logged; they ship in reviewed batches with a normal deploy |
| **F11** | A boss breaks the 60-clip warm budget | §2.3 | Audio is warmed per phase; the phase save points are the warm boundaries |
| **F12** | Visuals must follow the PERF rules | §1.5, §1.6.1, §1.8, §5.2 | Static ghost petals; the door's swirl on an HTML layer, paused off-screen; doors and lairs as spur slots; painting sizes; one Atlas at a time; 24 cards a page |
| **F13** | The save is cloned on every `store.set` | §6.3 item 12 | Rungs and per-KC summaries bounded to about 150 KB a child; raw events capped or in IndexedDB, never cloned per tap |
| **F14** | Boss art and voices weren't budgeted | §2.3, §4.4 | v1 is one sprite per boss, poses by transform and tint, lines as captions with a growl (the Baron keeps his voice); a cast voice when the boss's land ships; boss lines never have word slots |
| **F15** | 17 bespoke signature moves | §2.3, §2.4 | A kit of six phase types; each boss is data |
| **F16** | Slice 1 held nine deliverables | §6.4, BUILD_PLAN | Split: Slice 0 (the content model, in parallel), Slice 1a (long words proved: *sunset* on the path and the "shun" preview), Slice 1b (the Sky Magpie, and lag-correct rival tiles), then the Sky Temple, the weekly list, the maps, and one land at a time |

**Should-fixes taken** (Sounds~Write judge): SW-s1 (75% is "adapted from" a class rule, §2.3), SW-s2 (a write-it-again step in the Syllable Dragon, §3.1), SW-s3 (dictation as word, sentence, word, §1.9.4, §3.5), SW-s4 (Sensei's line for the untaught part, §1.9.1, §1.9.5), SW-s5 (the parrot swaps only secure words, §2.4), SW-s6 (special words graduate only when their last part is taught, §4.2), SW-s7 (*strap → trap*; < x > is one spelling for two sounds, §2.4), SW-s8 (< ear > in one-syllable words, *played* isn't a long word, < pe > is EC4, §1.2, §4.2), SW-s9 (no pure sound mid-sentence, §1.2, §3.8), SW-s10 (teaching stones scale with the number of spellings, §1.2). **New ideas taken** (six-year-old judge): N1 one creature for long words (the Word Dragon), N2 the child makes the cut, N3 a flawless finisher, N4 the weekly scroll charges the ninja's headband, N5 the practice-day bridge, N6 the aliens become pets, N7 a new verb for each Muddle land.

### R.2 Renames

| Revision 1 | Revision 2 | Why |
|---|---|---|
| the Syllable Train | **the Syllable Dragon** (the game), a **Word Dragon** (any long word as a creature) | SY6 and N1: one creature for every long word, from the first *sun·set* to the Library's bosses and the Word Scroll's cards. A train is young for seven and odd in a boss fight. The layout underneath is unchanged: the **carriage row** (§3.0.1) keeps its name in code and for builders |
| the wyrms (the Shun Wyrm, the Great Bookwyrm …) | the Word Dragons of the Library (the Shun Dragon, the Magic Dragon, the Treasure Dragon, the Great Book Dragon) | SY6: "wyrm" uses < y > for /er/, which the game never teaches |
| "the ninja slices the carriage" | "the child marks the joins" (Sensei gives the count and sparkles show where; at syllable level the child finds them) | N2, and no sword through a dragon |
| a 0.54 stage scale, 81 px taps | 0.49 (0.45 on the smallest phone), 90 px taps (98) | F2 |

### R.3 [R3: Jonas, Baron final only] The Baron is fought once

**Jonas (27 September, evening), verbatim:** "I don't really understand one thing, which is how we have a video of a battle with Baron Muddle, with the final super boss, with like super simple words in it. That should be the final, final battle with really hard words always."

He is right on both counts. Today the Sky Temple's boss (`w6-11`) *is* the Baron, fought over unit 12's words, and the trailer's "THE FINAL SHOWDOWN" and the enemy supercut both end on him losing to *beg*, *coat* and *tea*. Revision 2 had already moved his last fight to Muddle Castle, but it still had him fight at Star Dunes, at the end of Year 1 ("Baron Muddle, first round"). So:

| What | Now | Where |
|---|---|---|
| **The Baron fights once** | only in the final battle at Muddle Castle (check 38, the end of Year 2). Before it he introduces each guardian, taunts in cut-ins, and runs away: up the Rainbow Bridge, off the Sky Temple in his balloon, across the sea from Star Dunes. Until Muddle Castle exists, the game has no Baron fight at all | §0.1, §0.3 item 10, §2.2, §6.1, M10 |
| **Really hard words, always** | every item of the final battle, rematches included, uses Year 2 code or a long word: the muddled letter's words have Year 2 spellings, the speed round is Year 2's spellings with more than one sound, the long words are the end-of-Year-2 check's (*mechanic, character*), the encore is *multiplication*, and the last sentence gains < wh > ("The whole World Flower blooms.") | §2.4, §2.5.3, M38 |
| **Star Dunes gets its own guardian** | **the Sand Shark**, the Baron's lieutenant: it swims the dunes under the stars guarding his balloon and his alien pets, and keeps the old boss's check and moves (the first muddled note, the alien pets, *le·vel, re·port, night·mare*, "The boy saw a coin."). *shark* has < ar >, Star Dunes' own sound. When it falls, the Baron cuts his balloon free and escapes across the sea | §1.2, §1.4, §2.2, §2.4, §2.4.1 (new), §3.6, §4.4, M37 |
| **The interim, before Slice 1b** | `w6-11` becomes the Sky Magpie with today's boss kit; the Baron's cut-in introduces her; on the first win he escapes in his balloon ("It was a trick!"), instead of today's reformed-Baron finale; the finale is kept for the real end, gated by `FINALE_LEVEL` | [fix-requests.md](fix-requests.md) "Baron final only", §2.2, §6.1, §6.4, M39 |
| **One pair of trick lines** | `baron_trick_1` and `baron_escape_sky` serve both the interim's post-fight beat and the map-arrival scene for old saves; `baron_trick_2` is dropped | §2.2, M40 |
| **Marketing** | no video or page shows a Baron fight until the final battle ships; the landing's boss copy, the trailer's showdown gameplay and the supercut's last block change when the swap ships | [midgame/MARKETING_PLAN.md](midgame/MARKETING_PLAN.md) §4.1 |

---

## 0. The short version

### 0.1 The answers to Jonas

**[R2: SW5, SY6, N1]** **Magician, optician, division, multiplication.** Today, no: the game has no word longer than *strong*, no syllables, no special endings and no spelling choice (audit §4–5). With this design, yes, in the order school teaches them:
- **Year 1** builds and reads two- and three-syllable words syllable by syllable (*sunset*, *fantastic*, *window*, *pencil*, and by the summer *nightmare* and *report*) in a new game, the **Syllable Dragon**: Sounds~Write's Lessons 11–14 done with tiles. Every long word hatches as a **Word Dragon** with one body segment per syllable, and it wakes up when the child joins the syllables into one word. The common endings (-ing, -er, -est, -s, -es and un-) are syllables in those words from the autumn (*jumping*, *thicker*, *unlock*).
- **Year 2** reads and spells three-syllable words with Extended Code spellings (*holiday*, *multiply*, *mechanic*, *character*), meets its first four-syllable words (*absolutely*, *automatic*), adds the suffixes as syllables (*payment*, *illness*, *grateful*, *slowly*), and meets the first special ending, **-tion** (*station*, *motion*, *fiction*, *section*). *multiplication* has five syllables and uses -ation, which the National Curriculum puts in Years 3–4, so it is a **stretch**: the final battle's encore, for a child on a streak.
- ***magician*, *optician*, *musician*, *division*, *television*** are **read** syllable by syllable at the end of Year 2 and **spelt** in the post-game **Library of Long Words**. *magician* has its root as the clue (*magic*), and *optician* is linked to it because it spells /sh/ the same way. That is a Year 2 stretch and Year 3 at school: the National Curriculum puts -cian and -sion in Years 3–4 (SW §4). We say so plainly.

**Is the panda the boss of lame sounds?** It is the boss of the first eight sounds, and that is right: those eight sounds make the first words a four-year-old ever spells. What was wrong is that every later boss was the same fight with more hit points. **[R2: SW2, SY3, SY4]** In this design **each boss guards its land's code and fights with it**, so the bosses climb:
- the panda squashes three-sound words, and the child pulls their sounds apart;
- the Year 1 bosses test the spelling choices the class learned weeks earlier (the Magpie snatches the vowel gem out of *r _ n*; the Scarecrow's crows each carry an /or/ gem) and make the child *read* the land's newest spellings (the Circus Lion's tightrope of long words);
- the Year 2 bosses squawk muddled spellings back, blow the ending off *station* and make the child climb a beanstalk of syllables;
- **[R3: Jonas, Baron final only]** the Baron himself is fought **once**, in the final battle at the end of Year 2, and always with the hardest words in the game: the whole chart, a proofread letter of Year 2 words, the end-of-Year-2 check's long words (*mechanic, character*) and, for a child on a streak, *multiplication*. The guardians the child has beaten come back to help. Before that he only introduces his guardians, taunts, and escapes;
- the Library's Word Dragons are made of syllables: *mul·ti·pli·ca·tion* has five segments.

Every boss is also its land's Sounds~Write **progress check**, with the check's own lags: it reads what the class has just learned and spells only what was taught at least two units earlier (§2.3).

**[R2: SY1]** **A Year 1 week**, for a child in Cloud Town in the autumn, playing 15 minutes a day:
- **Monday.** A grown-up opens the school's list link. Today's scroll (5 minutes): the /er/ petal opens on this week's gems, the list's words drop into their chests, and Ninja Vanish teaches *people*. Then two new stones (Gem Choice on *bird* and *her*; a Syllable Dragon stone with *chop·stick* and *splen·did*) and a short battle against the Thunderbird's minions, over words due for review.
- **Tuesday to Thursday.** The scroll first, then a stone or two, and the story's first chapter: the Thunderbird has stolen the town's weathervane. On Wednesday the Thunderbird swoops down at the halfway stone for a 90-second skirmish (pop the storm clouds). Thursday's scroll is the practice test for Friday's school test.
- **Every day** a plank goes on the bridge to the next land, and eggs in the Word Scroll hatch as long words are spelt from memory on a second day.

**How long it lasts.** At its own pace, a child who plays every day spends about **2–3 weeks in each land** (its bridge needs 12 practice days), so each map lasts about 15 weeks at five days a week, and about 25 at three. In step with school, a land lasts as long as school takes over it (6–7 weeks), with a boss-shaped moment about once a week. The table is in §1.2.

**The middle and end game.** Today the story ends (Baron reformed, flower in bloom) at the first half-term of Year 1, after a Baron fight over Year 1's first words. **[R3: Jonas, Baron final only]** The interim swap (fix-requests.md) ends that first: the Sky Temple's boss becomes the Sky Magpie and the Baron escapes in his balloon. In this design:
- **Year 1** is a map of six lands (the **Sky Isles**) and **Year 2** is a map of six more (the **Muddle Isles**, the Baron's own islands).
- The story ends at the end of Year 2, when every petal and every common gem is back. The reformed Baron then opens the **Library of Long Words**, which is the endgame.

### 0.2 The shape

| Map (the child sees) | For grown-ups | Sounds~Write | Lands (one boss each) | The story beat at the end |
|---|---|---|---|---|
| **Sensei's Garden** | pre-school | before Initial Code (game-only listening and picture reading) | 1 | the white belt; the boat to the Island |
| **The Island of Sounds** | Reception | Initial Code 1–11, Bridging | 6 (Bamboo Village … Shadow Castle, **Rainbow Bridge**, new) | the island's petals are home; the Baron flees up the Rainbow Bridge into the sky |
| **The Sky Isles** | Year 1 | Extended Code 1–26, with Sounds~Write's Phonics Screening Check additions **[R2: SW1]**; long words from EC4 week 2 | 6 (Sky Temple, Cloud Town, Moon Marsh, Circus Island, Autumn Orchard, Star Dunes) | nearly every petal is on the World Flower; the Baron escapes across the sea with the rarest gems |
| **The Muddle Isles** | Year 2 | Extended Code 27–49; long words of three syllables and the first of four **[R2: SW5]**; suffixes; -tion | 6 (Echo Island, Gnome Hollow, Giant's Gorge, Dolphin Bay, Roaring Peaks, Muddle Castle) | the final battle; the flower is complete; the Baron says sorry, and why he hated words |
| **The Library of Long Words** | Year 2 stretch, Year 3 on | long words, special endings (-tion -cian -sion -ssion -ture), roots | endless wings, each with its Word Dragon | the golden bloom (the last, rarest gems) |

### 0.3 The decisions that matter most

1. **Four overworld maps and the Library** (§1.1). Each map is a stage; each land is about one progress check (6–8 weeks of school); each map ends with a story beat. There are no seasons in the child's world. The school term matters only to grown-ups.
2. **Game types belong to maps** (§1.4). The listening games live only in the Garden, first sounds only on the Island, spelling choice from the Rainbow Bridge on, special endings from Roaring Peaks, most of them in the Library. **[R2: SY8, N7]** Every Muddle land adds a verb of its own.
3. **"We assume you know these things"** (§1.5). A school child starts on their year's map, half a term behind school. Everything before it is **assumed**, and shows as **ghost petals**: still outlines on the World Flower and silver sparkles on the maps.
4. **Catch-up is the glowing stone** (§1.6). A ghost petal comes home the moment the child shows they know it, in any game. When the evidence shows a gap, the next glowing stone becomes a **catch-up door** to the earlier level that teaches it, and comes back. A child who wants to go faster can clear a whole earlier land with its **guardian's challenge**. The child never has to find catch-up.
5. **[R2: SW2, SW10, F3]** **Spelling choice, with Sounds~Write's three lags** (§2.3, §3.2). A new spelling is first built from the word's own tiles (Lesson 6), then read and built after a peek, choosing its gem (Lesson 7). Rival spellings go in an ordinary battle's bank only when they were taught four or more units back. A boss dictates only code at least two sound units behind its check. The bank never grows past what fits at tap size. Sensei's recorded "that's a spelling of that sound too" correction finally plays.
6. **[R2: N1, N2]** **Long words the Sounds~Write way** (§3.1). A long word hatches as a Word Dragon. Sensei says how many syllables it has, the child marks the joins, and then builds each segment sound by sound. The segments join and the dragon wakes, which is "write it without the gap". The read slider reads a long word the slow way (its syllables, in the spelling voice) and the fast way (the whole word, in the talking voice).
7. **Special endings are three sounds under one gold bracket** (§3.3). At sound level *station* is < s t a > | < ti o n >, one tile per sound as Sounds~Write requires, with the ending bracketed in gold ("three sounds, one ending"). At syllable level the ending is one gold chunk.
8. **[R2: SY2]** **Bosses are progress checks, and every win is a pure win** (§2.3). The long word staggers the boss, and the dictated sentence finishes it: the full stop is the knockout. There is no losing screen, but there is a stake: when Sensei has to help with a word, the Baron's petal imp grabs that gem there and then, and a short rematch in its **lair** wins it back. The chest only ever celebrates.
9. **The weekly word list** (§1.9): `…/play/?list=` opens a week's scroll. It gives five minutes a day of Gem Choice on the list's words, a game for the words with untaught code (**Ninja Vanish**: read it, the word vanishes, build it, check it), and a practice test on the day before school's. **[R2: F10, N4]** Version 1 plays only the words the game has, and each day's scroll charges the ninja's headband for that day's battles.
10. **The story ends once, and the Baron is fought once** (§2.2). **[R3: Jonas, Baron final only]** His only fight is the final battle at Muddle Castle, with the hardest words; every other boss is one of his guardians. The finale plays once, at the end of Year 2. **[R2: SY5]** Saves that saw the old finale get a once-only "It was a trick!" scene. After that, nothing loops: the Library's content renews itself.
11. **[R2: SY1]** **Months, not weeks** (§1.7). Two paces: "In step with school" (the default for school children) opens new units as school reaches them; "Own pace" opens the next land when its boss is beaten and its bridge is built, one plank a practice day. At most three new stones a day.
12. **[R2: SW1]** **Sounds~Write's own Phonics Screening Check guidance, applied** (§1.2). The unit order stays official. What the check needs is added inside units or met early, and the practice check is in Year 1's summer 1.
13. **[R2: F15, F14]** **Bosses are data** (§2.3). Every boss is built from a kit of six phase types, with one sprite and captioned lines in version 1.

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

**[R2: SW-s10, SY1] What a land contains.** A land teaches three to five Sounds~Write units in about 19–27 stones. Each stone is a short lesson of one to three games (about 3–4 minutes), which is the shape of a Sounds~Write session ("3 or 4" lessons in 30 minutes) cut down for home. Teaching scales with the code, as the content quota already does:
- **A sound unit** gets 2 + ⌈spellings ÷ 2⌉ stones, at most 6: a Lesson 6 dojo (the word puzzle, from each word's own tiles), a Gem Choice stone (Lesson 7), a practice battle (Lesson 8), and more teaching stones for the units with many spellings. So /ow/ (two spellings) gets 3, /er/ (four) gets 4 and /or/ (seven) gets 6.
- **A spelling unit** gets one Sound Detective stone.
- **Every land** also has two Syllable Dragon stones (three in the Muddle Isles), two story chapters (§3.8), a Dictation Scroll, the guardian's skirmish at the halfway stone (§1.7) and the boss.

The planner adds practice between stones (the guardian's minions, Sensei's Challenge, the catch-up doors, the lair; §1.6, §1.7), so a child who needs more time gets it without the land growing.

**[R2: SW3] The long-word strand follows the official checks' own long words**: Initial Code words (the Handbook's steps 1–6) up to about Cloud Town, then Extended Code spellings **4–7 units behind** the land's own code, except Units 18, 34 and 35, whose spellings only exist in long words (SW §1.2, §3.1). The "spells" column uses the check's dictation lag (§2.3). "Reads" is the land's code, as the check reads it.

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
| **Rainbow Bridge** (new) | Bridging Unit: /k/ c k ck, /ch/ ch tch, /w/ w wh, /v/ v ve | **the Bridge Troll** (check 11) | **[R2: SW6]** reads each word first, then builds it with < c k ck >, < ch tch >, < w wh > or < v ve > on the bank. The choice is word knowledge (Lessons 6–8: build it from its own tiles, notice the spelling, read, then write). Sensei may notice a pattern afterwards ("Look, all these words end with… < ck >") but never states a rule. The first spelling choice |

#### The Sky Isles (Year 1)

**[R2: SW1, SW3, SW4]** The unit order is the official one (Jonas's decision). The fourth column applies Sounds~Write's own Phonics Screening Check guidance (09.2024) exactly as it is written: some spellings are added inside units, some are taught "tangentially" (pointed out and practised alongside the planned units, the teacher taking responsibility at first), and < ar >, < oi > and < oy > are **met early** in one stone each, so that all the code the check uses has been met by the end of the spring term. The full units stay where they are. This is official guidance, not a reorder (M21).

| Land (school time) | Units and new code | Added for the Phonics Screening Check | Spelling units: Sound Detective | Long words (a few of the official checks' words) | Boss (check) | By the end: reads … / spells (lagged) … |
|---|---|---|---|---|---|---|
| **Sky Temple** (EC1–5; Y1 autumn 1, weeks 1–7), after two review stones for the Initial Code | /ae/ ai ay a ea; /ee/ ee ea e y; /oe/ o oa ow oe; consonant + e: te me ke le pe (EC1), de ne ze se be (EC4) | < ie > (*chief*) in EC2; < ou > (*mould*) and < ph > (*phone, photo*) in EC4. Pointed out when met: < ey > (*they*), < eigh > (*eight*), < kn > (*know*), < wr > (*wrote*) | < ea > (*team, great*); < o > (*hot, no*) | from EC4 week 2, steps 1–2: *sun·set, zig·zag, cob·web, den·tist* | **the Magpie** (check 3) | reads *rain, play, cake, great, feet, sea, she, happy, chief, boat, snow, go, bone, phone* / spells Initial Code and Bridging words (each read first), and EC1 words: *rain, play, cake* |
| **Cloud Town** (EC6–9; Y1 autumn 2) | /er/ er ir ur or (+ fe); /e/ e ea ai; /ow/ ou ow | **/oy/ met early**, with /ow/ ("Unit 23 /oy/ … along with Unit 8"): one stone, *coin, boy, toy*, built from their own tiles. The unit itself stays in Star Dunes | < ow > (*cow, snow*) | steps 3–6: *chop·stick, splen·did, fan·tas·tic, le·mon*; then EC1–2 words: *day·break, pain·ting, Sun·day*. **Endings as syllables begin**: *jum·ping, thi·cker, sis·ter, un·lock* (< er > as schwa, as the guidance asks) | **the Thunderbird** (check 6) | reads *her, bird, turn, word, bread, said, cloud, town, cow, snow, coin, boy* / spells EC1–6 first spellings: *feet, sea, bird, her, turn* |
| **Moon Marsh** (EC10–13; Y1 spring 1) | /oo/ oo ew ue u o; /ie/ i igh y ie; /oo/ (book) oo u oul | < ou > (*you*) in EC10. Pointed out: < ch > (*school*), < tw > (*two*). Alien Words begin (§3.8) | < oo > (*moon, book*) | EC1–7 words: *win·dow, slow·ly, rea·dy*; *Fri·day*; *hel·ping, qui·ckest* | **the Hoot Owl** (check 9) | reads *moon, blue, flew, June, you, night, my, pie, find, book, put, could* / spells EC4–10: *boat, snow, word, moon, blue* |
| **Circus Island** (EC14–18; Y1 spring 2, to Easter) | /u/ u o ou; /s/ s ss st c ce se (**< sc > waits until after the check**); /l/ l ll le al el il ol (in two-syllable words from the start) | **Tangentially, before Easter:** < ch > as /sh/ and /k/ (a Lesson 10 Sound Detective stone: *lunch, chef, school*), < g > as /j/ (*gem*), < c > as /s/ (*cell*), < s > as /z/ (*hens*). **< ar > met early** (*car, star, farm*). In EC16 and EC18, Lesson 6 shows every spelling, and Gem Choice and practice focus on the check's (< s ss c >, < l ll >) | < ou > (*loud, double, soup*); < s > (*cats, his*); < ch > (*lunch, chef, school*) | EC8–11 words: *a·bout, flow·er, my·self*; *Mon·day, Thurs·day*; -s and -es as syllables: *di·shes, bu·ses* | **the Circus Lion** (check 12) | reads *come, love, young, face, circle, listen, his, table, camel, pencil, chef, gem, car* / spells EC10–14: *moon, night, book, come* |
| **Autumn Orchard** (EC19–22; Y1 summer 1, up to the check in June) | /or/ or aw au a ar al oor; /air/ air are ear ere eir; /ue/ ue ew u eu | **The practice check**: 10 real and 10 alien words, read aloud to a grown-up (§3.8). < ar >, < oi > and < oy > practised again. In EC19 and EC20, Lesson 6 shows every spelling, and Gem Choice and practice focus on the check's (< or au aw >, < air >) | < ew > (*blew, new*) | EC12–16 words: *some·times, mo·ther, sen·tence*; **spelling** the EC18 /l/ words (*pen·cil, tra·vel*); *Sa·tur·day* (in the spelling voice). Syllable level (Lesson 13) for children who are ready | **the Scarecrow** (check 15) | reads *born, saw, sauce, walk, door, chair, share, bear, there, few, unit, blew* / spells EC14–19: *come, face, table, born, saw* |
| **Star Dunes** (EC23–26; Y1 summer 2, after the check) | /oy/ oi oy; /ar/ ar a al au; /o/ o a. **< sc >** (*scene*) at last, and every spelling of EC16 and EC18–20 comes back in review, as the guidance says | After the check: the aliens become the Baron's pets (for any child who will retake the check in Year 2) | < a > (*cat, was, apron, father*) | EC18–20: *le·vel, re·port, night·mare*; *Tues·day, Wed·nes·day* (a spelling-voice word, like *every*) | **[R3: Jonas, Baron final only]** **the Sand Shark**, the Baron's lieutenant (check 18) | reads *coin, boy, car, father, calm, was, want, swan*, and alien words / spells EC19–23 first spellings |

**[R2: SW-s8]** One should-fix was checked and not taken: `sw.ts` files < pe > under EC1 (inferred from the 2025 /ae/ poster's *cape*), not EC4, so it stays in EC1 here.

#### The Muddle Isles (Year 2)

| Land (school time) | New code | Spelling units | Long words (a few of the official checks' words) | Boss (check) | By the end: reads … / spells (lagged) … |
|---|---|---|---|---|---|
| **Echo Island** (EC27–31; Y2 autumn 1) | more /ae/: ei ey eigh; /d/ d dd ed; more /ee/: ey ie i; /i/ i ui e y | < y > (*yes, gym, my, happy*) | EC19–23: *air·line, stair·case, au·thor, wa·ter*; -ed where it is a syllable: *wai·ted, lan·ded*. **[R2: SW-s8]** *played* and *called* are one syllable: they are EC28's own words, not long words | **Captain Parrot** (check 22) | reads *eight, they, vein, ladder, played, key, chief, ski, build, gym* / spells EC19–28: *they, eight, ladder, played* |
| **Gnome Hollow** (EC32–34; Y2 autumn 2) | more /oe/: ou ough; /n/ n nn gn kn; more /er/: **[R2: SW-s8]** < ear > in one-syllable words (*earth, heard*), and < ar our re > in two-syllable words (*do·llar, fa·vour, li·tre*) | – | EC25–29: *ho·li·day, de·co·rate, cham·pi·on*; **[R2: SW4]** suffixes as syllables: *pay·ment, use·ful* | **the Gnome King** (check 25) | reads *soul, dough, though, knee, knock, gnome, sign, earth, heard, collar* / spells EC29–32: *key, chief, gym, dough, though* |
| **Giant's Gorge** (EC35–39; Y2 spring 1) | /v/ v vv ve; more /oo/: ui ou ough; /j/ j g ge gg dge; /g/ g gg gh gu | < g > (*gum, gem*) | EC28–30: *ra·di·o, sym·bol, mul·ti·ply* (the spelling voice for schwa); *ill·ness, grate·ful, help·less* | **the Giant** (check 29) | reads *have, sleeve, fruit, soup, through, giant, huge, bridge, ghost, guess* / spells EC33–36: *knee, sign, have, fruit, soup* |
| **Dolphin Bay** (EC40–42; Y2 spring 2) | /f/ f ff ph gh; /m/ m mm mb mn | < gh > (*laugh, ghost*) | EC33–36: *rou·tine, si·mi·lar, knee·cap*; **the first four-syllable word**: *ab·so·lute·ly* | **the Ghost Captain** (check 31) | reads *phone, graph, laugh, rough, photo, climb, thumb, lamb, autumn* / spells EC36–38: *fruit, huge, bridge, guess* |
| **Roaring Peaks** (EC43–45; Y2 summer 1) | more /or/: oar ore our augh ough; /h/ h wh; /k/ c k ck ch cc | – | EC37–40: *sub·merge, laugh·ter, pho·to·graph*; *slow·ly, ha·ppi·ly*; **-tion begins**: *sta·tion, mo·tion, fic·tion, sec·tion* (National Curriculum Year 2) | **the Roaring Boar** (check 34) | reads *board, more, four, caught, thought, who, whole, school, echo* / spells EC38–43: *guess, phone, thumb, board, caught* |
| **Muddle Castle** (EC46–49; Y2 summer 2) | /r/ r rr wr rh; /t/ t tt te bt ed; /z/ z zz ze s se ss; /eer/ eer ere ear | – | EC43–45: *me·cha·nic, cha·rac·ter, che·mis·try* (the end-of-Year-2 check's kind of word), *au·to·ma·tic*; **[R2: SW4]** /zh/ spelt < s >, spelt: *trea·sure, u·su·al*; the maths words *a·ddi·tion, sub·trac·tion* read and spelt; *mul·ti·pli·ca·tion* read, and spelt only as the final battle's encore | **Baron Muddle, the final battle** (check 38; **[R3: Jonas, Baron final only]** his only fight) | reads *write, wrong, rhyme, carrot, doubt, stopped, please, scissors, deer, here* / spells EC41–47, first and more spellings together |

#### The Library of Long Words (Year 2 stretch, Year 3 on)

| Wing | Content | Bosses |
|---|---|---|
| The Shun Wing | -tion (*station* … *multiplication*, *information*), -ssion (*mission, permission*), -sion as /sh/ (*tension*) | the Shun Dragon |
| The Magic Wing | -cian (*magician, optician, musician, electrician*), with the root as the clue where there is one (*magic, music, electric*) | the Magic Dragon |
| The Treasure Wing | /zh/ (*division, television, decision, treasure, measure*), -ture (*picture, nature, adventure*) | the Treasure Dragon |
| The Everything Wing | the planner's long words from every unit, the weekly lists, subject words (*February, hexagon*) | the Great Book Dragon (a dictated sentence) |

**[R2: SY6]** The Library's bosses are **Word Dragons**: long dragons that come out of the Library's oldest books, with one body segment per syllable of their word (§2.5.4). They are wild cousins of the child's own Word Dragons (§3.1).

#### [R2: SY8, N7] The lands, as a child meets them

Each land is a place with a problem, not a list of units. Every land card has five parts: the place, the trouble (what the Baron or his guardian did), the new verb (what the child does here that they haven't done before), the set piece (the land's big moment), and the boss. The Baron introduces each guardian as the child arrives (§2.2).

| Land | The place | The trouble | The new verb | The set piece | The boss |
|---|---|---|---|---|---|
| **Rainbow Bridge** | a rainbow arching from Shadow Castle up into the clouds, with a toll booth at the bottom | the Baron ran up it and told the troll to let nobody over without the right gems | paying a toll: read the word, then pay the gem it uses | a colour comes back to the rainbow with each sort | the Bridge Troll: "Who's that spelling over my bridge?" |
| **Sky Temple** | a temple on a cloud, its roof glittering with nests | the Magpie has stolen the vowel gems to line its nest | putting a stolen gem back into a word | the first Word Dragon hatches: *sun·set* | the Sky Magpie, whose nest covers the temple roof |
| **Cloud Town** | a town of cloud houses, chimney pots and weathervanes | the Thunderbird's storm has blown the town's words into the clouds | popping storm clouds by reading them | the weathervane spins back, pointing at each word with /ow/ | the Thunderbird |
| **Moon Marsh** | a marsh at night with glowing reeds and an enormous moon | the Hoot Owl has hidden the /oo/ gems in the dark | catching glowing gems in the dark | the moon rises a little with each gem found | the Hoot Owl |
| **Circus Island** | a big top whose sign has lost its letters | the Circus Lion has taken over the ring, and the tightrope's words are muddled | walking a tightrope, one syllable at a time | the big top's sign lights up, word by word | the Circus Lion |
| **Autumn Orchard** | apple trees and a scarecrow in a golden field | the Scarecrow's crows have carried off the /or/ gems | shooing crows away | the aliens land in the orchard (the practice check) | the Scarecrow |
| **Star Dunes** | desert dunes under the stars, the Baron's balloon tied to a palm | **[R3: Jonas, Baron final only]** the Baron is hiding here with his alien pets, and his lieutenant, the Sand Shark, swims the dunes guarding the balloon and the last Sky gems | fixing the Baron's first muddled note, which the Sand Shark carries in its fin | the shark falls; the Baron cuts his balloon free and escapes across the sea | the Sand Shark: "Chomp! Who's that on my dunes?" |
| **Echo Island** | an island of caves where every word echoes back | Captain Parrot repeats every word with the wrong gem | fixing what the echo says back | the parrot's treasure map, unmuddled | Captain Parrot |
| **Gnome Hollow** | a hollow of burrows and round gnome doors | the Gnome King has buried the starts of words | digging up the hidden start of a word | the gnomes' lanterns light as the words come back | the Gnome King |
| **Giant's Gorge** | a gorge with a beanstalk up to the Giant's castle (every UK child knows Jack and the Beanstalk) | the Giant has stomped the long words into pieces | climbing the beanstalk, one syllable per leaf | *mul·ti·ply* is the top leaf | the Giant, the Year 2 midpoint spectacle |
| **Dolphin Bay** | a bay with a sunken ship and a pod of dolphins | the Ghost Captain's ghostly spellings fade in and out | an underwater Ninja Run for /f/ (< f ff ph gh >) | the dolphins lead the way down to the wreck | the Ghost Captain |
| **Roaring Peaks** | mountains where the wind roars | the Roaring Boar's roar blows the endings off long words | putting the gold ending back on a word | *station*: the first special ending | the Roaring Boar |
| **Muddle Castle** | the Baron's castle, its walls covered in muddled letters | everything is muddled, even the throne | unmuddling the walls (Muddled Notes as the land's own verb) | the throne of muddled letters stands up | Baron Muddle, the final battle: **[R3: Jonas, Baron final only]** the only time he fights |

#### [R2: SY1] How long each land lasts

A **practice day** is a day with at least one finished block in the land: the scroll if there is one, up to three new stones (at most two of them teaching new code), and a practice block, about 15–20 minutes in all. The bridge to the next land gets a plank for each practice day, and at its own pace a land opens when its boss is beaten **and** its bridge is built (§1.7).

| Land | Units | Stones | Minutes of stones (about 3½ each) | Own pace: practice days (planks) | Own pace: weeks, playing 5 days a week | In step with school: weeks |
|---|---|---|---|---|---|---|
| Sky Temple | EC1–5, and two review stones | 25 | 90 | 12 | 2½ | 7 (autumn 1) |
| Cloud Town | EC6–9 | 20 | 70 | 12 | 2½ | 7 (autumn 2) |
| Moon Marsh | EC10–13 | 22 | 75 | 12 | 2½ | 6 (spring 1) |
| Circus Island | EC14–18 | 26 | 90 | 13 | 2½–3 | 6 (spring 2) |
| Autumn Orchard | EC19–22 | 24 | 85 | 12 | 2½ | 6 (summer 1) |
| Star Dunes | EC23–26 | 19 | 65 | 12 | 2½ | 7 (summer 2) |
| **The Sky Isles** | | **136** | **about 8 hours** | **73** | **about 15 weeks** | **the school year** |
| Echo Island | EC27–31 | 26 | 90 | 13 | 2½–3 | 7 |
| Gnome Hollow | EC32–34 | 21 | 75 | 12 | 2½ | 7 |
| Giant's Gorge | EC35–39 | 27 | 95 | 13 | 2½–3 | 6 |
| Dolphin Bay | EC40–42 | 19 | 65 | 12 | 2½ | 6 |
| Roaring Peaks | EC43–45 | 23 | 80 | 12 | 2½ | 6 |
| Muddle Castle | EC46–49 | 27 | 95 | 13 | 2½–3 | 7 |
| **The Muddle Isles** | | **143** | **about 8½ hours** | **75** | **about 15 weeks** | **the school year** |

- **Minutes of stones** are about half of the time played: the other half is practice (the minions, Sensei's Challenge, doors, lairs, the scroll), which the planner fills to the day's 15–20 minutes.
- **A child who plays three days a week** takes about 25 weeks over a map at its own pace. A child who plays every day and keeps in step with school spends about six weeks in each land, and meets the land's new code as school teaches it.
- **Boss-shaped moments.** Every land has the guardian's skirmish at its halfway stone, the boss, and often a lair. At its own pace that is about one a week. In step with school, when seven days pass without one, the day's practice block becomes a **minion raid** (§1.7).

**Why the lands have these names.** Each name holds its land's sound, so the name is a small mnemonic: **Cloud Town** has both spellings of /ow/; **Moon Marsh** the /oo/ of moon; **Circus Island** < c > as /s/ and as /k/; **Autumn Orchard** two spellings of /or/; **Star Dunes** /ar/; **Gnome Hollow** < gn > as /n/; **Giant's Gorge** both sounds of < g >; **Dolphin Bay** < ph > as /f/ (the /f/ petal's own picture is a dolphin); **Roaring Peaks** < oar > as /or/. **[R2: SW-s9]** Sensei points this out once per land, in the land's welcome, with the sound at the end of the sentence: "Listen… Cloud Town. Both words have the same sound… /ow/". It is never a test. The Sky Temple keeps its name and art. Moon Marsh, Autumn Orchard and Star Dunes are SOUNDS_WRITE_MODEL §6.1's placeholders, kept because they already carry their sounds.

### 1.3 The targets for Year 1 and Year 2

**[R2: SW4, SW5]** What the game means by "end of Year 1" and "end of Year 2", from Sounds~Write's own end-of-year picture and the National Curriculum (SW §7.4, §7.1, §7.3). Every claim here is taught by a named land; a claim without one was dropped.

| | End of Year 1 (Star Dunes done; check 18) | End of Year 2 (Muddle Castle done; check 38) |
|---|---|---|
| **Code** | the first spellings of every vowel sound but /eer/ (EC1–26); the spellings with several sounds < ea o ow oo ou s ew a >; and the check's extra code, met by the end of the spring term: < ie > (*chief*), < ou > (*mould, you*), < ph >, < ch > as /sh/ and /k/, < g > as /j/, < c > as /s/ (Sky Temple to Circus Island) | the whole Extended Code (EC1–49): first and more spellings, rare consonant spellings (< kn gn wr mb ph gh dge >) |
| **Reads** | words with any of that code; two- and three-syllable words with code to about EC20 (*level, report, nightmare*); alien words with the check's code and structures (practised in Autumn Orchard) | most words without sounding out; three-syllable words with Extended Code spellings (*mechanic, character, chemistry*) and the first four-syllable words (*absolutely, automatic*); suffixes as syllables (*payment, illness, grateful, slowly, happily*); -tion words |
| **Spells** | first spellings of about EC1–20 in words, choosing between them; -ing, -er, -est, -s, -es and un- as syllables of long words (*jumping, thicker, quickest, dishes, unlock*: Cloud Town to Circus Island); the days of the week (Cloud Town to Star Dunes); short dictated sentences. **-ed** is met in dictation sentences with Sensei taking responsibility ("This is… /t/"), because its sounds are taught in EC28 and EC47 | first and more spellings of about EC1–43; three-syllable words in the spelling voice (*multiply, holiday*); -ment, -ness, -ful, -less and -ly words (*payment, illness, grateful, helpless, slowly*); -ed words (EC28, EC47); -tion words (*station*); /zh/ spelt < s > (*treasure, usual*); common homophones (*sea, see*); dictated sentences of up to eight words |
| **Special words** | the code for 233 of the 300 common words has been taught; Year 1's common exception words, with Sensei giving the untaught part until its unit (*said, friend, school, once*) | all of them; Year 2's (*because, busy, people, climb*) |
| **Stretch** | – | reads *magician, optician, division, television* syllable by syllable; spells *multiplication* (the final battle's encore, for a child on a streak) |

**How the game proves each target.** Each is the boss check of the land where it lands: a check reads and dictates words the way the official one does (§2.3). The grown-ups' page shows each land's check result with real words ("Moon Marsh check: read 17 of 20, spelt *boat, snow, word* and *moon*"). Nothing is claimed that a level doesn't test. **[R2: SW4]** The grown-ups' page says -ed is "met" in Year 1, never "spelt", until EC47 is done.

### 1.4 Game types belong to maps

Jonas: "some game types just only appear on some maps. That is, in my opinion, totally fine." Here is where each one lives. ✓ means it teaches there; "review" means it appears only in review and challenges.

| Game | Garden | Island | Sky Isles | Muddle Isles | Library | Sounds~Write basis |
|---|---|---|---|---|---|---|
| Ninja Ears, Slow Words, Pocket Hunt, Guess My Word, Sound Dots | ✓ | – | – | – | – | game-only oral work (Decision 3) |
| Ninja Reading (the read slider on compound words) | ✓ | – | returns as the Syllable Dragon's slider | – | – | "follow my finger" |
| First Sounds, Sound Hunt | – | ✓ (Bamboo Village) | – | – | – | Lesson 1's first-sound question |
| Word Building (the dojo), Kai and Suki | – | ✓ | ✓ **[R2: SW10]** a new unit's word puzzle, built from each word's own tiles | ✓ | – | Lessons 1, 4, 5; Lesson 6 in the Extended Code |
| Monster Battle | – | ✓ | ✓ with rival spellings taught four or more units back | ✓ | ✓ | quizzing, Lesson 4a |
| Sound Swap | – | ✓ | review (Initial Code words and alien words only) | review | – | Lesson 3 ("with Initial Code words only" in the Extended Code) |
| Ninja Run | – | ✓ | ✓ as Speed Read and alien words | ✓ (Dolphin Bay's underwater run) | – | Speed Read |
| Story Time | – | ✓ | ✓ two chapters a land, with Seek the Sound | ✓ longer, with questions | ✓ | Lessons 4 and 9 |
| Sorting | – | Rainbow Bridge only | ✓ (read, then spell the chests' words) | ✓ | – | Lessons 6–8 |
| Gem Trials | – | ✓ | ✓ as a choice (§3.2) | ✓ | – | quizzing |
| **Gem Choice** (§3.2) | – | – | ✓ **[R2: SW10]** from the Lesson 7 step: read, then build with the peek | ✓ | ✓ | Lesson 7; the "valid alternative" correction |
| **Sound Detective** (MULTI_SOUND.md) | – | – | ✓ **[R2: SW1]** including < ch > in Circus Island | ✓ | review | Lesson 10, spelling units, tangential teaching for the check |
| **Syllable Dragon**, sound level (§3.1) | – | – | ✓ from Sky Temple's EC4 stones | ✓ | ✓ | Lessons 11–12 |
| **Syllable Dragon**, syllable level | – | – | from Autumn Orchard, for children who are ready | ✓ | ✓ | Lessons 13–14 |
| **Dictation Scroll** (§3.5) | – | ✓ from Blossom Hills (short sentences) | ✓ | ✓ | ✓ | Lesson 4a |
| **Alien Words** (§3.8) | – | – | **[R2: SW1, SW9]** ✓ Moon Marsh to Autumn Orchard (the practice check, read aloud to a grown-up); the Baron's pets after that | review (for a child retaking the check) | – | adapted Phonics Screening Checks |
| **Muddled Notes** (§3.6) | – | – | Star Dunes only (the Baron's first note; **[R3: Jonas, Baron final only]** the Sand Shark brings it) | ✓ (Echo Island's parrot, Muddle Castle's walls) | – | proofreading (National Curriculum Year 2); reading back |
| **Sound Twins** (§3.7) | – | – | – | ✓ | ✓ | homophones (National Curriculum Year 2) |
| **Word Detective** (§3.8) | – | – | – | ✓ | ✓ | Lesson 15 |
| **Special endings, the Root Dojo, the Shun Sort** (§3.3) | – | – | – | -tion only, from Roaring Peaks | ✓ | "special endings"; Lesson 15 |
| **Ninja Vanish** (§1.9.5) | – | ✓ (with the weekly list) | ✓ | ✓ | – | word building a word with untaught code; the improved "look, say the sounds… cover… write… check" |
| **[R2: SY1]** The guardian's skirmish, minion raids | – | later | ✓ | ✓ | – | review, in the land's own story |
| Boss (a progress check, §2) | – | ✓ | ✓ | ✓ | the Word Dragons | progress checks |
| Sensei's Challenge, the weekly scroll | everywhere, from the map and the title | | | | | review; the school's own list |

**Why some games stop.** The listening games belong to children who don't read yet. First Sounds is a bridge into Lesson 1 and has done its job by Blossom Hills. Sound Swap stays in review because Sounds~Write keeps Lesson 3 to Initial Code and nonsense words after Reception. Sorting starts at the Rainbow Bridge because "the same sound can be spelled in more than one way" is taught formally there (NARRATIVE_AUDIT F25). Special endings start at Roaring Peaks because -tion is Year 2 in the National Curriculum.

**[R2: SY8, N7] Why Year 2 doesn't drag.** The Muddle Isles' teaching games are mostly Gem Choice with rarer spellings, so each land gives its games a verb of its own (the land cards in §1.2): Echo Island's games answer the parrot's echo, Gnome Hollow's dig up word starts, Giant's Gorge climbs the beanstalk, Dolphin Bay runs underwater, Roaring Peaks puts gold endings back, and Muddle Castle unmuddles its walls. Sound Twins and Word Detective arrive, and long words take a bigger share of the stones.

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

The child starts at the **first stone of the land** that holds the start unit, which keeps the "half a term behind" margin and gives them the land's story from its start. **[R2: SY1]** A school start also sets the pace to "In step with school" (§1.7).

**What "assumed" means.** Every unit before the start point is **assumed**:
- Its petals and gems are **ghost petals** and **ghost gems**. **[R2: F12]** On the World Flower a ghost petal is a still, dotted silver outline: it never animates, because the flower's SVG must stay still (PERF fix 9; the flower is already at 29.7% of the phone's main thread against a 30% budget). On the maps, small still silver sparkles sit over those lands. They are neither won nor missing; they are waiting.
- The stones of the assumed lands are open. They play with the full forms of their games (the child has never been introduced to them), and a tap on one asks first, as a finished stone does (MAP_DESIGN §7).
- In the planner, assumed code counts as taught (it may appear in words and on the bank), and it starts with a prior, not evidence (§6.3). So the child is never shown code their school hasn't taught, and nothing about them is recorded as known until they show it.

**The welcome to the map** (a school path's first session, after the opt-in's confirmation and before the first lesson). The Atlas unrolls. Run to the child's first tap: about 9.4 s; from the tap to ▶: about 11.5 s.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_atlas_frame | 0 s | the Atlas unrolls: the Garden and the World Flower at the bottom, the Island, the Sky Isles floating above, the sea and misty islands beyond | This is the map of our whole world. | — | once per save (school paths) |
| **[R2: SY7]** tv_school_know_y1 / _y2 | 2.6 s | the Garden and the Island glow softly | You've been learning sounds at school, so you know lots of them already. / You've been learning sounds at school for a whole year, so you know loads already. | — | once per save |
| tv_school_start_sky / _muddle | 6.0 s | the view glides to the start map; the child's ninja token lands on the start land and bounces | So your adventure starts up here, in the Sky Isles. / So your adventure starts over here, on the Muddle Isles. | taps the token (the ninja jumps into the land) | once per save |
| tv_school_tap_ninja | ↳ 4 s with no tap | the token pulses | Tap your ninja to jump in. | taps | every time |
| tv_school_island / _both | the tap | the view dips to the Island (and the Sky Isles for Year 2); still silver sparkles appear over its lands | Down here is the Island of Sounds. Some of its petals might still be there. / Back there are the Island and the Sky Isles. Some of their petals might still be there. | — | once per save |
| tv_school_collect | 4.2 s | a ghost petal flies up to a small World Flower in the corner and fills with colour | That's fine. When you show me a sound you know, its petal comes home. | — | once per save |
| tv_school_go_<land> | 8.6 s | ▶; the view returns to the start land | Let's go to the Sky Temple. Tap the green arrow. | taps ▶ | once per save |

The Reception opt-in keeps FIRST_MINUTES's own line ("You go to big school…"); the two Year lines above replace it for Year 1 and Year 2, because "big school" is a Reception phrase that a seven-year-old winces at.

**For grown-ups** (a card on the grown-ups page, and once by the opt-in's confirmation, press-and-hold to dismiss):

> **Maya starts in the Sky Isles (Year 1, autumn term: Sounds~Write Extended Code Unit 1).** We assume she knows the Reception sounds (the Initial Code and the Bridging Unit). Nothing is marked as known yet. As she plays, every sound she shows she knows is collected on her World Flower. If we spot a gap, a catch-up stone appears on her path and brings her back when it's done. You can also open the Island of Sounds any time from the map. **Pace:** in step with school (new sounds open as a Sounds~Write class reaches them). [Change]

### 1.6 Catch-up: how it is shown, and how it is nudged

Jonas: "It needs to be, like, really obvious how to sort of do catch-up learning." Obvious to whom matters. A five-year-old can't be expected to go looking for gaps, so for the child **catch-up is simply the next glowing stone**. For grown-ups it is a card that says what was assumed, what was collected and what is on the way.

**Four ways a ghost petal comes home**, all drawn the same way (silver becomes colour, and the petal flies to the World Flower):

| Way | When | What the child sees | What Sensei says |
|---|---|---|---|
| **1. Shown in play** (most of them) | a ghost gem's spelling is right first try, with no help, in two you-do items, with no miss between them | at the end of the level, on the reward: the ghost gem fills, and its petal flies home with the level's rewards | `tv_known_petal` "You knew that sound already! Its petal is flying home." (the first three times per save); later the flight only, and `tv_known_petals_<n>` "You knew three sounds already!" when several come at once |
| **2. The catch-up door** | the planner finds a gap: an assumed spelling missed twice in different items, or a pattern of confusion (/ch/ for /sh/) | the next glowing stone is a round door on a short side path, with a silver swirl and the earlier land's colour and game picture inside (§1.6.1) | `tv_catch_door` (first time), `tv_catch_door_short` |
| **3. The guardian's challenge** | the child or a grown-up chooses to clear an earlier land fast | on the overworld map, an earlier land with ghost petals shows its guardian awake, with a silver "!" | the guardian's own taunt, then the boss check, short (§2.3) |
| **4. The lair** | the petal imp grabbed gems during a boss fight (§2.3, §2.6) | a lair stone on the land map: the petal imp's nest, holding the gems | the imp's taunt, then a short Gem Chase |

**Rules for the doors,** so that catch-up never takes over the adventure:
- A door is only ever the glowing stone. There is never a second glowing thing, and never a list of chores.
- At most one door in every three stones, never two doors in a row, never as the session's first stone (the day starts with the child's own land), and at most two a day. A grown-up's "Catch up first" setting raises this to one in two.
- A door leads to one short earlier level, the one that first teaches the missing spelling (`firstTaught`), cut to its teaching and practice games (about three minutes). Then it brings the child back, with the walk, to the stone after the door.
- The child's own land's next stone stays on the map, calm and open, so a child who taps it plays it (after Sensei's question, as for any stone that isn't the glowing one).
- A door's level counts as a normal level: stars, rewards, and the ghost gems it proves come home. It also counts as a practice day's block for the bridge.

#### 1.6.1 The door, on the map

- **Where:** **[R2: F12]** the door is a **spur slot**: it stands on a short dotted spur off the path, just after the ninja, so it reads as a side trip and not as the land's next stone. It is never a new node on the path, because `nodePos(i, n)` reflows the whole path when `n` changes. The ninja stands beside it (MAP_DESIGN §5.3 treats it as the glowing stone's slot). Lairs and the weekly scroll use the same spur slot.
- **What it looks like:** a round stone door, 150 stage px, with a slow silver-blue swirl inside, the earlier land's colour on its rim and that level's game picture in the swirl. It has the glowing stone's rays and halo, because it *is* the glowing stone. **[R2: F12]** The swirl is a `rotate` on an HTML layer (never an SVG animation), paused when the door is off-screen.
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

### 1.7 Placement, the first check, Jump ahead, and the pace

- **The first check** (FIRST_MINUTES §10) stays: the first three you-do items at a school start point. If 0 or 1 is right first try, the child drops one band on the spot: Year Two to Year One's start, Year One to the Island's Reception start, Reception to the Garden. What they were assumed to know from the dropped band stops being assumed.
- **Show Sensei** (the grown-ups' placement quiz) now does two things. It suggests a start land, as today, and every spelling it sees right first try comes home as a collected petal. So a grown-up who runs it on day one gives the child a head start on the flower.
- **Jump ahead** is still a grown-up's decision. The planner offers it when the child is bored and near-perfect on a probe of the next three units (planner §1). A jump moves the child to the first stone of the next land (or the next map), builds the bridges it passes, and makes everything skipped assumed, with ghost petals, the same as a school start. There is never a separate "skipped" state.
- **Start from here** (grown-ups) can move the child's start earlier. Nothing they collected is lost.
- **Moving up** (1 September) keeps FIRST_MINUTES's ten-second moment and adds a look at the Atlas: the new year's map glows. Progress never moves by itself. If school is now ahead of the game, the grown-ups page offers "Start from here", which turns the gap into ghost petals.

#### 1.7.1 [R2: SY1] Two paces, so the game lasts for months

Revision 1 moved the frontier on at every boss, "pass or not", and made "Go at their own pace" the default. A child who played every day would have finished the Year 1 map in five to seven weeks, reaching Year 2 code while school was still on EC5, with no mastery gate; and "Stay close to school" left weeks of a gate marked "Soon". Revision 2 has two paces, and a grown-up can switch between them on the grown-ups page at any time.

| | **In step with school** | **Own pace** |
|---|---|---|
| **The default for** | a child whose opt-in answer is Reception, Year One or Year Two | a child whose answer is "not yet" or "not sure"; any child whose grown-up picks it |
| **New code opens** | unit by unit, the week a Sounds~Write class reaches it (`PACING`, from the school year and the date, keeping the start's half-term margin) | as fast as the child goes |
| **New stones a day** | at most three, at most two of them teaching new code | the same |
| **The next land opens** | with school, after the land's boss | when the land's boss is beaten **and** its bridge is built (12–13 planks, one per practice day) |
| **Between new stones** | the land's practice: the minions, Sensei's Challenge, the weekly scroll, long words, rematches, doors and lairs | the same |
| **A child who is ahead** | the frontier waits at the unit school is teaching; a boss-shaped moment still comes about once a week (below) | the planner offers Jump ahead to the grown-up when a probe of the next land is near-perfect |
| **A child who is behind** | catch-up doors and lairs; the next land still opens with school (Sounds~Write's class moves on, with keep-up support) | the bridge waits for the practice days, never for a pass mark |

Why days, and not a pass mark: a word moves up at most one rung a day (§3.0.3), so days are the honest unit of practice, and it is Brain Age's "unlock by days" (prior-art §2.11). A pass mark would stop a struggling child at a wall; days of practice never do.

**The bridge.** Every land map shows, at its far edge, the way to the next land: a rope bridge between clouds on the Sky Isles, stepping stones across the sea on the Muddle Isles, and at a map's last land the Petal Ship's sails. At the end of each practice day a plank drops into place (a sail panel fills, a stepping stone rises) with a soft chime. Sensei says `tv_bridge_plank` "Another plank for the bridge!" the first three times, and `tv_bridge_ready` "The bridge is ready! Now the guardian…" when it is built before the boss is beaten. Planks never go away, and nothing counts down. In step with school the bridge is not a gate: it fills a plank a practice day and is finished, with any missing planks, on the day the next land opens.

**The guardian's skirmish.** At the land's halfway stone (after its middle sound unit's Gem Choice stone) the guardian swoops in for a 90-second skirmish: four or five items of its signature move only (§2.4), on the code the land has taught so far, with the boss lags. The guardian flees ("You haven't seen the last of me!") and drops the land's second story chapter. It is a boss-shaped moment in the middle of the land, and a preview of the fight.

**Minion raids.** When seven days pass with no boss-shaped moment (a skirmish, a boss, a lair or a rematch), the day's practice block becomes a **minion raid**: a two-minute battle against the guardian's minions over the child's due words, with its own short entrance. In step with school this gives a boss-shaped moment about once a week; at its own pace it rarely fires.

### 1.8 Navigation: the land, the map, the Atlas

Three zoom levels, and the child needs only the first.

| Level | What it is | When the child sees it | Taps |
|---|---|---|---|
| **The land map** (today's map, MAP_DESIGN.md) | one land's stones, the glowing stone, the ninja beside it; **[R2: SY1]** the bridge at the far edge | always: Home lands here | as MAP_DESIGN |
| **The overworld map** (one per stage) | the stage's six lands as islands on one painting, joined by a route; the child's ninja token on the current land, which glows; beaten guardians as small portraits with a flag; ghost sparkles and guardians awake over earlier lands; lairs; misty lands ahead; **[R2: SY5]** the Baron's balloon floating over the land after the child's | the journey after each boss (§2.6); the map-scroll button on the land map (a paper scroll icon beside Sensei's Challenge, indigo like it, never gold); a ghost petal's gate on the World Flower | the current land: its land map. An earlier land: Sensei's question ("Do you want to go back to Moon Marsh?"), then its land map. A guardian awake: its challenge (§1.6.2). A misty land: the hint ("Not yet! Your ninja is here.") |
| **The Atlas** | the four maps and the Library on one painting | the school welcome (§1.5); each map's end (§2.6); the overworld map's zoom-out | a map: its overworld map. The Library, before it opens: a locked door with a keyhole and one line ("This place is locked. I wonder what's inside?") |

**The journeys between maps** are short scenes of up to 10 s. A tap on ▶ ends them after the first viewing.
- **Garden → Island:** Sensei rows the child across to Bamboo Village.
- **Island → Sky Isles:** the child runs up the Rainbow Bridge after the fleeing Baron.
- **Sky Isles → Muddle Isles:** the Petal Ship, a flying ship with petal sails, chases the Baron's balloon across the sea.
- **Muddle Isles → Library:** the reformed Baron unlocks the Library's doors.

**One glowing thing, at every level.** On the land map it is the stone (or door, or scroll, or lair). On the overworld map it is the current land. On the Atlas it is the current map. Ghost sparkles are silver, small and still, and never pulse.

**[R2: F12] Within the PERF budgets.** Each overworld painting is 1376 × 768, like the land backgrounds (4.2 MB decoded). The Atlas is at most 2752 × 1536 (16.9 MB decoded): only one is mounted at a time, and it is unmounted when the child leaves it. Journeys are transforms of those paintings, or short videos, never new particle systems. The Baron's balloon bobs with a CSS transform on an HTML layer, paused off-screen.

### 1.9 The weekly word list: a deep link and five minutes a day

Jonas, "for later": "Every week at school, they get this word list … a list of words that have all got different spellings of a sound they've gone through in phonics class. And also one or two or three special words … there should be a game for those as well … a deep link system where you can just have query params or something that encode the word list and then get a special sort of challenge levels to master that word list with like five minutes of practice a day."

This section designs it for the child and the grown-up. The build (the link's parser, the validation against the content, the files and the tests) is Slice 3 in [midgame/BUILD_PLAN.md](midgame/BUILD_PLAN.md), and §1.9.8 lists the hooks to build before it, so that the build later is small.

#### 1.9.1 What school sends home, and what Sounds~Write says about special words

**Freshford** (the Year 1–2 parents' presentation, 23 September 2026): the lists go out weekly on Seesaw or in the red books, "based on the sounds a child has been taught". Children learn "the different spellings of a particular sound and apply them in some common words", plus "some high frequency 'special words' that cannot be sounded out". There is a test each week. A child who doesn't get all or almost all right practises the same list again, but every two or three weeks the class moves on regardless, so "it is crucial that spelling words are practised regularly at home". The school suggests "Look, cover, write, check", and "trial and error": try each spelling of the sound and see which looks right.

**Sounds~Write** has no "tricky words" or "sight words" (SW §6; DOSSIER §11.1). It calls them words "that contain code which has not yet been taught", and the teacher "takes responsibility" for that part: "This is /e/, say /e/ here". To practise a word that keeps coming up, you build it with its tiles, the hard spelling on one tile, and write it saying the sounds. Its improved "look, cover, write, check" is: look, say the sounds and read the word, talking about the unfamiliar spelling; then cover it, write it saying the sounds, read it back, and check with the original. The limits are "no more than one 'difficult' bit in each word", and "no more than one or two of these words a week" (DOSSIER §11.3).

**Decision.** The game practises the school's list exactly as sent, including the special words, but teaches the special words the Sounds~Write way: every word is sounded out, and the untaught part is given, not memorised as a shape. **[R2: SW-s4]** The child never hears "tricky", "sight words" or "special words": Sensei says "This word has a spelling we haven't learned yet. I'll tell you that bit." "Special words" appears only on the grown-ups' screens and in the link, because it is the school's term and parents will look for it. At most two new special words are taught on one day; a list with three spreads them over two days.

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
- **It carries no child data, and there are no accounts.** The link is only a list. It is stored in the save of the profile a grown-up chooses (§1.9.3), on the device, never on a server with a name attached. A word the game doesn't have is logged by word only (§1.9.7).
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
- **Special words show their untaught part**, from the game's high-frequency chart (SW §6).
- **[R2: F10]** **Words the game can't play yet** are listed plainly: "Not in the game yet: *Wednesday*. We'll practise the other 7 words." (§1.9.7).

#### 1.9.4 The week's scroll: five minutes a day

**For the child** the week's list is a **scroll**. It is the session's first glowing stone each day until that day's scroll is done: a paper scroll with a ribbon standing in the glowing stone's spur slot (§1.6.1), with the stone's glow. Then the adventure's own stone comes back. So a child who plays every day does their school words first, for five minutes, and no one has to find anything. A grown-up can switch "school words first" off, and the scroll then hangs by the map's side as a calm button.

| Day | What the scroll does | About |
|---|---|---|
| **Day 1** (the day the list is added) | *Meet the list.* The week's sound's petal opens and shows this week's gems (a short dojo Learn, known sounds greeted as known). A sort: the list's words drop into their gem chests, read first (Lesson 7). Three words are read, then vanished, then built (Gem Choice's peek, §3.2). Special word 1 in Ninja Vanish (§1.9.5) | 10 items, about 5 min |
| **Days 2 to the day before the test** | *Practise.* Gem Choice on 6–8 list words: with a peek on day 2, without on later days, word by word as each word's rung rises (§3.0.3). One Ninja Vanish, taking turns between special words. A Sound Detective or Syllable Dragon item if a list word needs one (*great*, *eight*; *because*). Yesterday's misses come first | 8–10 items, about 5 min |
| **The day before the test** | *Practice test.* **[R2: SW-s3]** Sensei dictates every word the Sounds~Write way, the word, a sentence, then the word again: "The word is… great. That cake was great. Build great, and say the sounds as you go." (the sentence comes from the unit files where one holds the word, and always for a homophone; otherwise "The word is… great. Build great…"). The full bank, bounded (§3.0.3). The special words too. A result card for the child (every word, ticked or glowing to practise) and for the grown-up | 8–15 items, 4–6 min |
| **After the test** | *Keep.* The list's words join the planner's normal spaced review, so they come back in battles and challenges over the next weeks | – |

- **A week strip** runs along the scroll: seven dots, a stamp for each day's scroll done, a gold stamp for the practice test. A missed day leaves an empty dot, never a broken flame.
- **[R2: SY, N4] The scroll powers the adventure,** so it never feels like homework before play. Each day's finished scroll lights the ninja's **headband**: for the rest of that day, the ninja's first finisher in every battle is the headband's special move (a bigger, brighter strike; the look only, never extra stars). A practice test with every word right earns a **charm** that glows on the ninja's belt at the next boss, and the boss's knockout uses it. Neither is ever taken away.
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
| tv_wk_all | the practice test, every word right | the card: every word ticked; the charm flies to the belt | You spelt every word! You're ready for tomorrow. | — | every time |
| tv_wk_some | the practice test, some to practise | the card: the words to practise glow | Nearly all of them! Let's practise these once more. | builds them again | every time |
| tv_wk_stamp | each day's end | a stamp lands on the week strip; the headband lights | That's today's scroll done. Your headband is glowing! | — | every time (the headband half: first three per save) |

#### 1.9.5 Ninja Vanish: the game for words with untaught code

**Sounds~Write basis:** word building a word with untaught code, the hard spelling on one tile, and the improved "look, say the sounds and read it, cover it, write it saying the sounds, read it back, check" (DOSSIER §11.3). The teacher's line for the untaught part is Sounds~Write's: "This is /e/. Say /e/ here."

**The game in one paragraph.** A scroll unrolls with the word on it, the untaught part underlined in gold. The child reads it the Sounds~Write way: the read slider's tortoise walks under the spellings and each sound plays, and at the gold part Sensei gives the sound ("This is… /e/"). Then the rabbit reads the word. The ninja throws a smoke ball: puff, and the scroll rolls up. The child builds the word from its tiles, saying the sounds, and **[R2: SW-s4]** reads it back with the tortoise. Then the scroll unrolls again, and the built word flies up under it: each tile that matches chimes. A tile that doesn't glows, and the child swaps it.

**[R2: F2, F5] The screen (stage 1280 × 720; drawn at 0.49 on an 844 × 390 phone, 0.45 on the smallest).**

| Thing | Where (stage px) | Notes |
|---|---|---|
| the scroll | top centre, 760 × 200, at y 90–290 | the word in Andika 110 px; the untaught spelling underlined in gold. When rolled up it is a 120 px tube at the top |
| the read slider | under the word, y 300–340 | the tortoise at the left end, the rabbit at the right. `RAIL` is a constant in `ReadSlider.tsx` today; this needs it as a parameter of `geoFor()` (a small change, also needed by Muddled Notes) |
| the lines | y 360–460, centred, one per sound | 104 px slots, 92 at five sounds, 90 at six or more (never smaller: a slot can be tapped to undo) |
| the tiles | the bank row, y 520–620, between the ninja and Help | the word's own tiles, jumbled, at least 90 px (`rowFit()`). From a word's third play, one rival for the untaught part (< e > beside < ai > in *said*) |
| the ninja, Help, Hear it again, Home | as everywhere | the ninja's smoke ball flies from its hand to the scroll |

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_van_frame / _path | 0 s | the scroll unrolls: *said*, with < ai > underlined in gold | This game is called Ninja Vanish. Here's a word from your school list. / This game is called Ninja Vanish. Here's a word we use a lot. | — | full |
| **[R2: SW-s4]** tv_van_untaught | 3.2 s | the gold part pulses | This word has a spelling we haven't learned yet. I'll tell you that bit. | — | full |
| tv_van_slide | 6.8 s | the tortoise glows at the start of the rail | Slide the tortoise, and say the sounds with me. | slides: /s/ … | full; recap |
| tv_van_this_is · /e/ | the tortoise reaches the gold part | < ai > glows | This is… /e/ | — | every time |
| **[R2: SW-s4]** tv_van_say_here · /e/ | straight after | the gold part glows | Here, you say… /e/ | says it; slides on: /d/ | first two per word |
| tv_fs_rabbit_read · [said] | the tortoise reaches the end | the rabbit wakes | (as TEACHER_SCRIPT §9) · said | taps the rabbit | every time |
| tv_van_vanish | straight after | the ninja throws the smoke ball; puff; the scroll rolls up | Now watch my ninja make it vanish. | — | full; then the puff alone |
| tv_van_build | straight after | the lines and the tiles | Now you build it, and say the sounds as you go. | builds | full; recap |
| **[R2: SW-s4]** tv_van_read_back | the last tile | the tortoise under the built word | Now read it back. | slides; taps the rabbit | full; recap |
| tv_van_check | straight after | the scroll unrolls; the built word flies up under it; each matching tile chimes | Let's check it with the scroll. | — | first two per session |
| **[R2: F7]** `w_built_right` · [said] | all match | the word sparkles | You built said just right. (one take per word, SPT) | — | every time |
| same_sound_spelling (existing) | ↳ a rival tile in the gold slot | that tile glows; the scroll's gold part glows | Yes, that's a spelling of that sound too! But in this word, we spell it like this... | swaps it | every time |
| tv_van_listen_here | ↳ a wrong sound elsewhere | the slot glows | Let's listen to that part again. | — | every time |

Run to the child's first action (the slide): about 9.5 s. The whole word takes about 30 s. A special word is played once a day in the scroll, and it counts towards its rung like any word (§3.0.3).

**The same game on the adventure path.** Year 1 and Year 2 stones use Ninja Vanish for the common exception words whose code comes late (SW §6's chart), one or two a week, as Sounds~Write advises. **[R2: SW-s6]** When a word's last untaught part is taught in its unit (*said* in EC7), Sensei says so once: "You know the word said. Now you know its spelling too. It's one of the ways to spell… /e/". The word leaves Ninja Vanish and becomes an ordinary word. A word with two untaught parts graduates only when both have been taught (§4.2).

#### 1.9.6 What the list changes in the rest of the game

- **The planner** pins the list's words for the week (planner §3, `pinned`). They count as current-unit words: read before they are spelt, first with a peek, never blind dictation before day 3.
- **The learner model** gets their evidence like any other word's, tagged `source: "school-list"`, so the grown-ups' page can show "School list, week of 29 September: 7 of 8 right in the practice test".
- **The World Flower** charges the gems the list uses. A gem first met in a list shows a small school badge.
- **The boss and the lags** don't change: a list word can appear in a boss only after its week, as review.
- **The headband and the charm** (§1.9.4) are the only rewards the list gives in the adventure.

#### 1.9.7 [R2: F10] Words the game doesn't know yet

The game can play a word only if it has its segmentation (`segs`), its recording and, for picture games, its picture. About 1,100 words have segmentations and recordings today (933 unit words and 180 long words; audit §0.9), and Year 1–2 lists will often go beyond them.

- **v1 (Decision): the list plays only the words the game has.** A word it can't play is shown to the grown-up as "not in the game yet", the rest of the list is practised as normal, and the word alone (no child, no list, no device) is logged to the Worker.
- **Unknown words ship in reviewed batches,** with a normal deploy: the logged words are segmented by an LLM over the 174 official pairs (SOUNDS_WRITE_MODEL §6.4), checked by the content validator, glanced at by a person, recorded with the existing audio pipeline and its accent gate, and released with the next build. Revision 1's nightly job is dropped: it was an ops system with teaching risk (an aligner that segments *because* wrongly teaches a wrong sound), and Workers static assets need a deploy per addition anyway.
- **Later:** a grown-up can record a word in their own voice (Squeebles's best feature, prior-art §2.6), and pictures for list words that are pictureable.

#### 1.9.8 Hooks to build now

So that the list is a small build later, the first slices should already:
- parse `?list=` in `main.tsx` into a **pending list** in `sessionStorage`, and show the grown-ups' confirmation (a stub that stores it is enough);
- add `weekList?: { v: 1; words: string[]; special: string[]; week: string; test: Day; added: string }` to the save, per profile;
- add the level kinds `"weekly"` and `"vanish"` to `LevelKind`, and a `special?: true` flag on word items (it exists on `DictationItem.words` in sw.ts);
- give the planner a `pinned` source other than authored episodes (`source: "school-list"`);
- make the map's glowing stone's **spur slot** able to hold something other than the next level, with a `kind` (`"stone" | "door" | "scroll" | "lair"`): the scroll, the catch-up door and the lair all need it (MAP_DESIGN §5.2);
- tag evidence with `source`.

---

## 2. Bosses that make sense

### 2.1 The panda, and what a boss is for

The Sumo Panda is the boss of the first eight sounds: a, i, m, s, t, n, o and p. For a four-year-old in their first half-term of Reception, spelling *mat*, *pin* and *top* one after another is the hardest thing they have ever done with letters. So it is a proper first boss, not the boss of lame sounds. Jonas's instinct is still right about the rest, though. Today every boss is the same battle with more words, no boss tests its land's idea, and the last boss is the second-easiest to spell (audit §6–7).

**What a boss is for, in this design:**
1. **A guardian.** Each boss guards the petals and gems of its land's code, locked in its chest. That is the story reason for the fight.
2. **A test of the land's own idea.** Each boss has a **signature move** built from that idea, and the child's counter to it is exactly the skill the land taught. The Knight splits two-letter spellings apart; the Magpie snatches vowel gems; the Giant's beanstalk is a long word's syllables.
3. **A Sounds~Write progress check.** Reading, spelling and, from the Sky Isles, a dictated sentence, with the official lags (§2.3). So the boss is what tells a parent "she's where school expects".
4. **A climb.** **[R2: SW5]** Because the checks follow the programme, the bosses get harder by themselves: three-sound words (the panda), spelling choices (the Magpie), rare spellings (the Gnome King), three-syllable words in the spelling voice (the Giant's *mul·ti·ply*), **[R3: Jonas, Baron final only]** the whole chart and the end-of-Year-2 check's long words (the Baron, fought once, at the very end), special endings (the Library's Word Dragons).

### 2.2 The story: guardians, chests and the Baron's retreat

**The film's promise** is "Win back every petal, one sound at a time!" The design keeps it and stretches it over three years of school:

| Map | What the Baron did | Who guards what | How the map ends |
|---|---|---|---|
| **Island of Sounds** | blew the petals across the island | his monsters, one guardian per land, each with a chest of that land's petals | the Bridge Troll falls; every island petal is home. The Baron runs up the Rainbow Bridge: "You'll never reach my Sky Isles!" |
| **Sky Isles** | carried the vowel petals up into the sky, where they are hardest to reach | **[R3: Jonas, Baron final only]** six sky guardians: the Magpie, the Thunderbird, the Hoot Owl, the Circus Lion, the Scarecrow and, at Star Dunes, the Baron's lieutenant, the Sand Shark | the Sand Shark falls, and **nearly every petal is on the World Flower** (the last few, such as /eer/ and /zh/, are in the Muddle Isles). But many of its gems are dim: the Baron cuts his balloon free and escapes across the sea with the rarest gems. "My Muddle Isles are full of spellings you've never seen!" |
| **Muddle Isles** | hid the rarest gems (the "more spellings") on his own islands | his lieutenants (Captain Parrot, the Gnome King, the Giant, the Ghost Captain, the Roaring Boar) | **the final battle** at Muddle Castle, **[R3: Jonas, Baron final only]** the only time the child fights the Baron. The flower is complete: every petal and every common gem. The Baron says sorry (§2.5.3) |
| **The Library** | – | **[R2: SY6]** the wild Word Dragons, long dragons made of syllables that live in the Library's oldest books | no end: the wings renew. The **golden bloom** (the last, rarest gems: < ti ci si ssi >, < t > in -ture, schwa's spellings) is the long goal |

**[R2: SY5] The Baron stays on screen.** The audit found his cut-ins among the few things that work for this age (audit §8), so he never disappears for a whole map:
- **[R3: Jonas, Baron final only]** **He fights only once.** Before the final battle he never takes a hit: he introduces each guardian, taunts in cut-ins, and runs (up the Rainbow Bridge, off the Sky Temple in his balloon, across the sea from Star Dunes). A fight with the Baron always means the hardest words in the game (§2.5.3).
- **He introduces every guardian** as the child arrives in a land, as `baron_w1`–`baron_w5` do today ("Mwa-ha-ha! Meet my Sky Magpie, little ninja. She'll steal every gem you know!"), in his own recorded voice.
- **His balloon floats over the land after the child's** on the overworld map, always one step ahead.
- **The petal imp is openly his**: it wears his colours, it carries his muddled notes, and it flies grabbed gems towards his balloon.
- **The story chapters carry the plot** (§3.8): each land's two chapters say what its guardian did and where the chest is, and the final battle's letter quotes them.

**The finale plays once.** It moves from the Sky Temple to the end of Year 2 (`isFinale` becomes "the final battle, the first time it is won"). A replayed boss is a plain fight with a friendly sparring line, and the land's welcome never says a beaten villain is "hiding up here somewhere". The story's lines are keyed to the story state, not the land (audit §2.4 and §11.1 E).

**[R2: SY5] Saves that have already seen the old finale.** Jonas's own children have very likely heard today's Baron say "Sorry for all the muddle". **[R3: Jonas, Baron final only]** From the interim swap (fix-requests.md), which changes the Sky Temple's boss before Slice 1b, every save hears the trick once: on the first win against the Sky Magpie, with his balloon rising, or, for a save with the old finale seen that doesn't replay the boss, on its next map arrival. The lines are the same in both places, in the Baron's own voice. Six-year-olds love "he was only pretending", and the real apology at the end of Year 2 then means more.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| baron_trick_1 | **[R3: Jonas, Baron final only]** the first win against the Sky Magpie (`w6-11`), or the first map arrival of a save with the old finale seen | the Baron's balloon rises over the Sky Temple; he laughs and waves a sack | Did you think I'd turned nice? Mwa-ha-ha! It was a trick! I've still got the rarest gems! | — | once per save |
| baron_escape_sky | straight after | the balloon drifts up out of the painting | Catch me if you can, little ninja! My Sky Isles are full of spellings you've never seen! | — | once per save |
| tv_trick_soon | straight after, until Cloud Town ships | Sensei, hands on hips | He tricked us! Don't worry. We'll follow his balloon to the Sky Isles soon. | taps ▶ | once per save |
| tv_trick_after | the same moment, once Cloud Town ships | Sensei, hands on hips | He tricked us! Come on. Let's get those gems back. | taps ▶ | once per save |

**The Baron's reveal** gives the Library its reason. After the final battle: "I never could read the long words. They muddled me. So I muddled everyone else." The child has just read *mechanic* and *character* in front of him. Then: "Will you help me read them?" He becomes the Library's keeper and turns up there as a friend, stuck on a long word, asking the child's help. That is the endgame's premise. It also answers the film's "Words, words, WORDS! How I HATE them!" with a reason a child understands.

### 2.3 What every boss is: a check with a signature phase

#### 2.3.1 [R2: SW2, SY3] The three lags, named apart

Revision 1 said "rivals only for spellings taught four or more units back" in a boss, which forbids what the official checks themselves do, and then authored signatures that spelt brand-new code. Revision 2 separates three lags. **U** is the land's last sound unit: the one its progress check follows (Sounds~Write chooses the check "by the last unit completed"). A spelling unit taught alongside a sound unit counts with it, because Sounds~Write runs them in parallel.

| What | The lag | Where it applies | Why |
|---|---|---|---|
| **Reading** | code up to U: one unit behind a class that has moved on to the next unit | a boss's Read phase and its reading signatures. **The land's newest code appears in a boss only here** | the checks read at least one unit back |
| **Dictation** | code at least **two sound units before U**, with the full bank (R4, bounded by `rowFit()`, §3.0.3) | a boss's Spell phase, spelling signatures, the Last word; the Dictation Scroll; the weekly practice test | the checks dictate at least two units back; writing is a free choice |
| **Rival tiles in ordinary battles** | spellings taught at least **four units before the level's unit**, unless the word has just had its peek | battles, Gem Trials, Sensei's Challenge (R3) | the Extended Code's quizzing lag |
| **Long words** | code 4–7 units behind, except Units 18, 34 and 35, whose spellings only exist in long words | the Big attack; the Syllable Dragon's stones | the checks' long words |

A worked example: the Scarecrow's check follows EC21 (U). It **reads** /ue/ (EC21), < ew > (EC22, with it), /air/ (EC20) and /or/ (EC19). It **spells** /or/ (EC19, two sound units before U) and older code. Its long words are *pen·cil* and *tra·vel* (EC18, whose spellings only exist in long words; check 15 dictates them).

The Island bosses (before the Extended Code) keep their strong signature moves on their land's own code by always **showing the word first** (the frozen word in the ice, the word on the Knight's shield, the Troll's word read before its toll): that is Lesson 7's "read, then write" with the word's own tiles, not dictation.

#### 2.3.2 [R2: F15] A kit of six phase types

Every boss is **data**: which phase types it uses, their skins, its words, its art and its lines. There are six types, each built from a game that exists or is designed here:

| Type | What the child does | Built from | Skins |
|---|---|---|---|
| **Read** | *find the word* (Sensei says a word, the child taps its card among three) or *who read it right* (Kai and Suki) | Kai and Suki's read check (exists) | every boss's phase 1; the Thunderbird's storm clouds, the Circus Lion's tightrope, the Gnome King's mounds |
| **Spell** | builds dictated words from a bank | Battle (exists), with rivals (§3.2) | every boss's phase 2; the Squash, Mirror trick, Freeze, Shield split, Toll, Night flight, Crow swarm |
| **Snatch** | a word is missing one spelling; the child hears the word and puts the gem back | Battle with one open slot | the Gobble, the Gem Grab, the Roar |
| **Misread** | a spelling is read the wrong way; the child tries its other sound (Sound Detective) or picks who read it right | Sound Detective (MULTI_SOUND.md), Kai and Suki | at most twice per map (§2.4) |
| **Big attack** | builds a long word in the Syllable Dragon; the Word Dragon flies at the boss | the Syllable Dragon (§3.1) | phase 4 from the Magpie on; the Giant's beanstalk |
| **Last word** | builds a dictated sentence of at most five words | the Dictation Scroll (§3.5) | phase 5 from the Magpie on |
| **Note** (a variant of Read) | proofreads words the child spells securely | Muddled Notes (§3.6) | the Baron's first note (**[R3: Jonas, Baron final only]** carried by the Sand Shark), Captain Parrot's echo, the final letter |

#### 2.3.3 The shape

A boss is a short run of phases. The monster's health bar is split into one segment per phase, and the monster changes pose between phases. The phases, in order:

| Phase | What the child does | The lag (§2.3.1) | Where |
|---|---|---|---|
| **1. Read** | reads the boss's words: find the word, who read it right, or a reading signature | reading | every boss |
| **2. Spell** | spells dictated words from the full bank | dictation | every boss |
| **3. The signature** | counters the boss's own move, one physical verb (§2.4). On the land's newest code it is a reading move; a spelling signature uses code at least two sound units back and never shows more than three gems | reading or dictation | every boss |
| **4. The big attack** | one or two long words in the Syllable Dragon. **[R2: SY2]** It **staggers** the boss: it drops to one knee, and the chest's lock cracks | long words | from the Magpie on |
| **5. The last word** | a dictated sentence of at most five words. **[R2: SY2]** It is the **finishing move**: each word built flies at the boss as a hit, and the full stop, the ninja star, is the knockout | dictation | from the Magpie on |

**[R2: SY2] Every win is a pure win.** The knockout is the last thing on screen before the chest, and nothing after it is a test. The Island bosses end on their own finishing zap (the rabbit's read-back of a three-sound word; the Troll's last toll).

**[R2: F4] Where the boss stands.** In phases 1–3 the boss stands where monsters stand today, at its fight size (1.5×, `MONSTER_INFO`). In phases 4 and 5, and in any Note phase, it **steps back to a perch**: 0.55× at the top right, beside its health bar (x ≥ 1000, y ≤ 250). The carriage row's width limit then drops from 980 to **840 stage px** (x 150–990), and the §3.1 sweep checks the boss's box against every carriage.

**[R2: SY, "too small"] Presence grows by map.** Every boss enters big before it settles to its fight size: a Sky boss enters at 2× over the land's painting (the Sky Magpie's nest covers the temple roof), a Muddle boss at 2.5×, and the final Baron fills the screen. The entrance is a transform of the one sprite, about 3 seconds, skipped on a rematch.

**[R2: F11] Audio.** A boss warms its clips per phase, at most 60 clips and 600 KB a phase (SPT §7.4), while the phase's opening line plays. The phase save points are the warm boundaries.

**[R2: F14] Art and voices, version 1.** One sprite per boss (as the Island bosses have), with its poses made by transform and tint (idle, angry, stagger, beaten) and the perch as a scale. Its lines are captions with a short growl or squawk (a sound effect, not speech), except the Baron, who keeps his recorded voice. A cast voice and a pose sheet for a boss come when its land ships, if Jonas wants them. Boss lines never have word slots: the template generator has only Sensei's voice (SPT open risk 14). A boss that "misreads" a word holds it up on its sign, and Kai and Suki do the reading, as in their existing read check.

**How long.** Reception bosses 7–9 items (about 3 minutes), Year 1 bosses 10–12 (about 4 minutes), Year 2 bosses 12–14 (about 5 minutes), and the final battle about 16 (6 minutes, 7 with the encore, with a save point at each phase). The official check reads 20 words and dictates several. The boss takes a sample of it, and the land's last two stones (the Dictation Scroll and the second chapter) supply the rest of the evidence.

**Scoring, the Sounds~Write way.** Only an independent first try counts. A word read right only after a correction counts as an error for the record, although the child is still taught it (Teaching Through Errors, then they finish the word). A spelling counts only if the whole word is right. **[R2: SW-s1]** The land is **passed** at 75% or more of first tries. That mark is adapted from Sounds~Write's rule of thumb for a class ("75-80% of your class has achieved 75-80% proficiency"); Sounds~Write gives no pass mark for one child.

**[R2: SY2] Stakes without a losing screen.**
- The bar always empties. Every word gets finished, with Sensei's help if needed, so the child always beats the boss.
- **The imp grabs a gem during the fight, when Sensei helps.** The moment Sensei has to help with a word (Help's second press, or a correction's show step), the Baron's **petal imp** darts in and grabs that word's gem. Its caption taunts about itself, never the child: "Ooh, shiny! Mine!" Sensei: `tv_imp_grab` "The imp's got one. We'll get it back." (the first two per session; then the imp's squeak). The gem flies off towards the Baron's balloon and ends up in the imp's **lair** on the land map (§2.6). The cause is clear while it happens.
- **The chest only celebrates.** When it opens, every gem still in it flies home.
- **The belt stripe is always sewn at the boss** (§5.1): in colour at 75% or more of first tries, and in silver thread below that. The lair turns silver thread to colour. Silver always means "not shown yet", never "failed".
- **[R2: N3] Flawless.** A boss beaten with no help at all gets its own finishing animation (the ninja's golden finisher) and a gold portrait on the overworld map at once, not only after a rematch.
- This follows Sounds~Write's pace: the class moves on regardless (the next land opens with school, or when its bridge is built: §1.7.1), and the gaps get "keep-up" support (the lair, and the catch-up doors).

**Rematches.** A beaten boss's portrait on the overworld map can be tapped for a **rematch** at a harder rung: no peeks, the full bank and the land's longest words. Winning puts a small gold crown on the portrait. It never replays the story, and it counts as a boss-shaped moment (§1.7.1).

**The boss's lines** follow a fixed set, so each new boss is a small writing job (captions for all but the Baron in version 1):

| Moment | Line kind | Example (the Magpie) |
|---|---|---|
| the Baron's introduction (once per land) | `baron_intro_<land>` | **[R3: Jonas, Baron final only]** "Mwa-ha-ha! Meet my Sky Magpie, little ninja. She'll steal every gem you know!" |
| the land's welcome (once per land) | the boss's taunt, `<boss>_taunt` | "Shiny, shiny gems! They're all mine now!" |
| the skirmish ends (§1.7.1) | `<boss>_skirmish` | "Shiny! I'll be back for the rest of them!" |
| the fight starts | `<boss>_start` | "You want my gems? Come and get them!" |
| each new phase | `<boss>_phase_<n>` | "Grr! Then I'll snatch them right out of the words!" |
| the big attack | `<boss>_big` | "That word is far too long for you!" |
| the stagger | `<boss>_stagger` | "Ow! My feathers!" |
| beaten (the knockout) | `<boss>_beaten` | "My lovely gems! Oh, all right, take them." |
| a rematch | `<boss>_rematch` | "Back for another go? I've been practising!" |

### 2.4 The bosses

**[R2: SW2, SY3, SY4, SW6, SW7, SW8, SW-s5, SW-s7]** "Signature" is the boss's move, as a verb the child performs, then the child's counter. "Kit" is its phase type (§2.3.2). "Reads / spells" gives the code in each phase and its lag against the check's unit U, so the rule can be checked row by row. The last word is the finishing sentence (at most five words, code at least two sound units before U).

| Map | Land (check; U) | Boss | Signature: the verb → the child's counter | Kit | Reads (≤ U) / spells (≤ U − 2) | Big attack | Last word |
|---|---|---|---|---|---|---|---|
| Island | Bamboo Village (none; IC2) | **Sumo Panda** | **Squash:** the panda squashes a word into a blob → the child pulls its sounds apart onto the lines, and each tile pops the blob back into shape; then reads two squashed words (who read it right) | Spell, Read | the land's own code (Sounds~Write has no check before Unit 3) | the finishing zap: a three-sound word, pushed together with the rabbit | – |
| Island | Blossom Hills (2; IC4) | **Oni** | **Mirror trick:** it flips look-alike tiles on the bank (b d p), and the flipped tiles jiggle so they are visibly tricks → the child listens past them | Spell | reads IC1–4 / spells IC1–2 | – | – |
| Island | Misty Mountains (5; IC7) | **Yeti** | **Freeze:** each frozen word is shown in the ice and ends in a double spelling → "two letters, one sound": the child breaks the ice with the double tile. **[R2: SW-s7]** < x > is one spelling for two sounds, so it is read (*box, fox*) and never frozen | Spell (the word shown first) | reads IC5–7 / spells IC3–5, and IC7 doubles after the word is shown | – | – |
| Island | Dragon River (8; IC10) | **River Serpent** | **Gobble:** it swallows one sound from a cluster (**[R2: SW-s7]** *strap → trap*: one sound, as Sound Swap changes one) → the child puts it back (Sound Swap's insert) | Snatch | reads IC8–10 and alien words from IC9 / spells clusters of IC1–8 code | a five-sound word (*stamp*) | – |
| Island | Shadow Castle (9; IC11) | **Shadow Knight** | **Shield split:** the word is shown on its shield, then its < sh > splits into < s > and < h > on the bank → the child uses the two-letter tile | Spell (the word shown first) | reads IC11 / spells IC5–9, and IC11 after the word is shown | – | – |
| Island | **Rainbow Bridge** (11; BR) | **the Bridge Troll** (new) | **[R2: SW6] Toll:** "Who's that spelling over my bridge?" Each word is read first, then pays its toll: the child builds it with < c k ck >, < ch tch >, < w wh > or < v ve > on the bank → the gem **this word** uses. After the fight Sensei may notice a pattern, never a rule | Read, then Spell | reads BR / spells IC words, and BR after the word is read | – | – |
| Sky | Sky Temple (3; EC4) | **the Sky Magpie** | **Gem Grab:** it snatches the vowel gem out of an EC1 word on its sign (*r _ n*, *pl _*) → the child hears the word and puts the right gem back (< ai ay a >). **[R2: SW8]** Its misreading: it holds up *break*, and Kai reads "breek" → Sound Detective, try /ae/ | Snatch; Misread (1 of 2) | reads EC1–5 (*boat, feet, play*; < ea > both ways) / spells EC1 and Initial Code and Bridging words | *sun·set* | "I can play a game." |
| Sky | Cloud Town (6; EC8) | **the Thunderbird** | **Storm clouds:** thunder rolls clouds over the town, each carrying a word → Sensei says a word and the child pops the cloud that says it (*cow, snow, show*: < ow > both ways). The /er/ choice is in phase 2 | Read | reads EC6–9 / spells EC6: *bird, her, turn* (at most three /er/ gems) | *fan·tas·tic* (the first three-syllable word in a boss) | "Her bird can sing." |
| Sky | Moon Marsh (9; EC12) | **the Hoot Owl** | **Night flight:** the marsh goes dark and three /oo/ gems glow (< oo ue ew >) → Sensei says the word and the child catches the right gem as the owl swoops past (*moon, blue, flew*) | Spell (three gems) | reads EC10–13 (*night, my, book, could*: /ie/ and /oo/ as in book are read only) / spells EC10: *moon, blue, flew* | *win·dow* | "I see the moon." |
| Sky | Circus Island (12; EC18) | **the Circus Lion** | **Tightrope:** the lion's tightrope carries long words → the child walks the tortoise along the rope, reading each syllable (*ca·mel, pen·cil, ta·ble*), and the rabbit reads the whole word | Read | reads EC14–18 (*face, circle, camel*: /s/ and /l/ are read only) / spells EC14 and EC12: *come, touch, should, full* | *flow·er* | "Come and see my dog." |
| Sky | Autumn Orchard (15; EC21) | **the Scarecrow** | **Crow swarm:** three crows land by a dictated word's empty slot, each carrying an /or/ gem → the child shoos away the two whose gem doesn't belong (*born, saw, walk*) | Spell (three gems) | reads EC19–22 (*chair, bear, few, blew*: /air/, /ue/ and < ew > are read only) / spells EC19: *born, saw, walk* | *pen·cil, tra·vel* (check 15 dictates EC18's /l/ words) | "I saw a bird fly." |
| Sky | Star Dunes (18; EC25) | **[R3: Jonas, Baron final only]** **the Sand Shark**, the Baron's lieutenant (§2.4.1) | **The first muddled note:** the shark surfaces with the Baron's note in its fin: one misspelt word, a word the child spells securely (§3.6) → the child finds it and fixes its gem. **Alien pets:** the Baron's aliens, left in the shark's care; their names are alien words → who read it right (the check's kind); each alien read right joins the child's crew (N6) | Note; Misread (2 of 2) | reads EC23–26 and alien words / spells EC19–23 | *le·vel, re·port, night·mare* | "The boy saw a coin." |
| Muddle | Echo Island (22; EC30) | **Captain Parrot** | **Parrot talk:** the parrot squawks a word back with a swapped gem → the child fixes the echo. **[R2: SW-s5]** It swaps only in words the child spells securely (R4–R5), never in the word the child has just built | Note | reads EC27–31 (*key, chief, gym*: < y > is read only) / spells EC27–28: *they, eight, ladder* | *stair·case* | "They play in the snow." |
| Muddle | Gnome Hollow (25; EC34) | **the Gnome King** | **Dig:** the gnomes bury words in mounds → Sensei says a word and the child digs up the mound that holds it (*knee, knot, nose*; *gnome, sign*) | Read | reads EC32–34 (< kn gn >; *dollar, favour, litre*: /n/ and the weak endings are read only) / spells EC32: *though, mould, dough* | *ho·li·day* | "They ate the dough." |
| Muddle | Giant's Gorge (29; EC38) | **the Giant** | **Beanstalk:** the Giant stomps a long word into pieces → the child climbs the beanstalk, building one syllable on each leaf: the lower leaves in phase 3 (*sym·bol*), the top leaf as the big attack | Big attack | reads EC35–39 (*giant, huge, guess*: < g > both ways is read only) / spells EC36: *fruit, soup* | the top leaf: *mul·ti·ply*, in the spelling voice | "I ate the fruit." |
| Muddle | Dolphin Bay (31; EC42) | **the Ghost Captain** | **Now you see it:** ghostly spellings fade in and out of words (< gh > in *ghost* and *laugh*) → the child catches each in the lens and tries its sounds. The fading always waits for the child | Misread (Sound Detective; 1 of 2) | reads EC40–42 (*phone, laugh, thumb*) / spells EC37–38: *fridge, guess* | *rou·tine* | "The bridge is huge." |
| Muddle | Roaring Peaks (34; EC45) | **the Roaring Boar** | **Roar:** it shows a word, then roars its ending off (*station, motion, potion*) → the child puts the ending back, < ti > < o > < n > under the gold bracket, from the ending's own tiles: a build after a peek, never a choice between endings | Snatch | reads EC43–45 (*school, echo, who*: < ch > as /k/ is read only) / spells EC43: *board, caught*; and /f/ and /m/: *phone, thumb* | *pho·to·graph* | "I caught a big fish." |
| Muddle | Muddle Castle (38; EC49) | **Baron Muddle, the final battle**: **[R3: Jonas, Baron final only]** his only fight | five phases of the hardest words in the game, with the beaten guardians coming back to help (§2.5.3) | Note, Spell, Misread (2 of 2), Big attack, Last word | reads EC46–49 / spells EC47 and older; **[R3: Jonas, Baron final only]** every item has Year 2 code or is a long word | *me·cha·nic, cha·rac·ter*; encore *mul·ti·pli·ca·tion* | **[R3: Jonas, Baron final only]** "The whole World Flower blooms." |
| Library | the Shun Wing | **the Shun Dragon** | **Hidden head:** the dragon's head is its word's ending, closed → the child builds each segment, then opens the head by building the ending. **[R2: SW7]** -tion has no root clue: it is "the ending most words use". Only -ssion words have one (*discuss → discussion*) | Big attack | the Library's words (§3.3) | *in·for·ma·tion, mul·ti·pli·ca·tion* | – |
| Library | the Magic Wing | **the Magic Dragon** | the root card (*magic, music, electric*) grows the ending; *optician* joins by its spelling of /sh/ (Lesson 15) | Big attack | | *ma·gi·cian, op·ti·cian, e·lec·tri·cian* | – |
| Library | the Treasure Wing | **the Treasure Dragon** | /zh/ and /ch/ in endings; Lesson 15 links *division* to *television* and *decision* | Big attack | | *te·le·vi·sion, di·vi·sion, ad·ven·ture* | – |
| Library | the Everything Wing | **the Great Book Dragon** | a dictated sentence of long words | Last word | | – | "The magician did a trick." |

**[R2: SY4] One verb each, and no repeated gag.** Every Sky and Muddle boss now has a verb a child can name: snatch back, pop, catch, walk the rope, shoo, fix the note, fix the echo, dig, climb, catch the ghost, put the ending back. "Reads it wrong" (Sound Detective, or who read it right) is a boss move at most **twice per map**: on the Sky Isles the Magpie and **[R3: Jonas, Baron final only]** the Sand Shark's alien pets (the Baron's); on the Muddle Isles the Ghost Captain and the final battle's speed round. Every other reading move is a *find the word* skin (pop, walk, dig), which tests the same reading without the gag.

**[R2: SW8] Every wrong reading is try-safe and accent-safe.** Before a word is used for a misreading, it passes MULTI_SOUND §4.1's check: the wrong reading must not be a real word (*great* read as "greet" is, so the Magpie uses *break*, "breek"), and must not be how a region says the word (Northern *book* rhymes with *Luke*; *new* as "noo"). Revision 1's Hoot Owl ("booook") and Scarecrow ("noo") misreadings are gone.

**Why these creatures.** Each belongs to its land and, where possible, carries its sound: the Thunderbird's *bird* is < ir >; the Hoot Owl's *hoot* is < oo >; the Scarecrow's *scare* is < are > and *crow* is < ow >; the Gnome King's *gnome* is < gn >; the Giant's *giant* is < g > as /j/; the Roaring Boar's *roar* and *boar* are < oar >; **[R3: Jonas, Baron final only]** the Sand Shark's *shark* is < ar >. Sensei may point this out after the fight, never before it.

#### 2.4.1 [R3: Jonas, Baron final only] Star Dunes: the Sand Shark, the Baron's lieutenant

Revision 2 had the Baron fight at Star Dunes, the end of Year 1. He now fights only once (§2.2), so Star Dunes gets a guardian of its own, with the same check and the same moves. **The Sand Shark** is the Baron's lieutenant: a big sandy-gold and dusky-purple shark that swims through the dunes like water under the stars, with a goofy grin of round cartoon teeth, the Baron's crimson-and-black sash and his purple swirl, and his note in its fin (concept: `assets-src/midgame/art/sand_shark_concept.webp`). A fin circling in the sand is a set piece six-year-olds get at once, *shark* has < ar > (Star Dunes' sound, M3), and the name is decodable by then (< sh > and < ar >). It is funny, not scary, like every guardian.

- **The fight** is check 18, as in the §2.4 row: find the word; dictation at EC19–23 with the full bank; the signature (the first muddled note, then the alien pets' names); *le·vel, re·port, night·mare* as the big attack; "The boy saw a coin." as the finishing sentence. It enters at 2×, bursting out of a dune, then settles to its fight size and, in phases 4–5, to its perch.
- **The Baron** is in the land but never in the fight: he introduces the shark from his balloon, which is tied to a palm; his cut-ins taunt; and when the shark falls he cuts the rope and escapes across the sea. That is the Sky Isles' ending, and the Petal Ship's journey follows (§1.8).
- **Lines** are the fixed set (§2.3): the shark's are captions with a growl (F14), the Baron's are in his voice. They are recorded when Star Dunes ships.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| baron_intro_star_dunes | the land's welcome | the balloon tied to a palm; the Baron points at a fin circling in the sand | My Sand Shark guards my balloon, little ninja. Nobody gets past those teeth! | — | once per land |
| sha_taunt | straight after | the Sand Shark bursts out of a dune at 2×, the Baron's note in its fin | Chomp! Who's that on my dunes? | — | once per land |
| sha_skirmish | the skirmish ends | the shark dives back into the sand | Chomp! I'll be back for the rest of them! | — | every time |
| sha_start | the fight | the shark settles to its fight size | You want the Baron's gems? You'll have to get past me! | — | every time |
| sha_phase_3 | phase 3 | the shark slaps the note onto the sand | The Baron wrote this himself. Bet you can't find his muddle! | — | every time |
| sha_big | phase 4 | the shark leaps up to its perch | That word is far too long for you! | — | every time |
| sha_stagger | the Word Dragon hits | the shark flops on the sand, fin drooping; the chest's lock cracks | Ow! My fin! | — | every time |
| sha_beaten | the full stop | the ninja star hits; the shark dives into the dune; the chest pops up | Glug! Oh, all right. Take your gems. | — | every time |
| sha_rematch | a rematch | the fin circles | Back for another go? I've been sharpening my teeth! | — | every time |
| baron_escape_sea | after the chest, the first win | the Baron cuts his balloon's rope; it floats off over the sea | You beat my Sand Shark? Grr! Then I'm off to my Muddle Isles! They're full of spellings you've never seen! | — | once per save |
| tv_after_dunes | straight after | Sensei shades her eyes, watching the balloon | He's getting away again! Let's find a ship and follow him. | taps ▶ | once per save |

### 2.5 Three bosses in detail

#### 2.5.1 The Sumo Panda: a proper first boss

It is still seven words and about three minutes, but it now has phases and a chest.
- **Phase 1, Squash (4 words: *mat, sit, pin, top*).** The panda slams its belly; the word card squashes into a round blob that wobbles. Sensei: "The panda squashed the word! Can you pull its sounds apart?" The child builds it on the lines; each tile pops the blob a little, and the word springs back into shape.
- **Phase 2, Read (2 items).** The panda holds up a squashed word and Kai and Suki each read it: who read it right?
- **Phase 3, the big squash (1 word).** A three-sound word, and the finishing zap is the rabbit read-back (TEACHER_SCRIPT §9). **[R2: SY2]** It is the last thing before the chest.
- **The chest.** It opens on the Bamboo petals, eight of them, the flower's first. That is the biggest reward moment of Reception's first half-term, so the panda is remembered as the boss that gave back the first sounds.

#### 2.5.2 [R2: SW2, SW8, SY2] The Sky Magpie: Year 1's first boss

The Magpie guards the first gems of /ae/ /ee/ /oe/, in a nest that covers the Sky Temple's roof. About 4 minutes; check 3, which follows EC4 (U): it reads EC1–5 and spells EC1 and older.

| Phase | Items | What happens |
|---|---|---|
| 1. Read | 3 | the Magpie holds up shiny word cards: Sensei says a word, and the child taps its card among three (*boat, feet, play*) |
| 2. Spell | 3 | dictation with the full bank: an Initial Code or Bridging word, read first (*duck*: < c k ck >; *catch*: < ch tch >), and one EC1 word (*cake*: < a > < ai > < ay >) |
| 3. Gem Grab | 3 + 1 | an EC1 word hangs on the Magpie's sign with its vowel gem snatched (*r _ n*, *pl _*, *g _ me*); the child hears the word and puts the right gem back. Then the **misreading**: the Magpie holds up *break* and Kai reads "breek"; the child's lens tries /ae/ on < ea >, and "break" is a real word (Sound Detective) |
| 4. Big attack | 1 | ***sun·set*** in the Syllable Dragon, with the Magpie on its perch: the child marks the join, builds *sun* and *set*, the segments join, and the Word Dragon wakes and flies at the Magpie. It drops to one knee; the chest's lock cracks |
| 5. The last word | 1 sentence | "I can play a game." (EC1 and Initial Code only; *I* on the board). Each word built flies at the Magpie, and the full stop, the ninja star, knocks it off its nest |

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| baron_intro_sky_temple | the land's welcome (**[R3: Jonas, Baron final only]** and, in the interim swap, before every fight) | the Baron's balloon passes; he points down at the roof | Mwa-ha-ha! Meet my Sky Magpie, little ninja. She'll steal every gem you know! | — | once per land (the interim: every fight) |
| mag_taunt | straight after | the Sky Magpie lands on the temple roof at 2×, a gem in its beak | Shiny, shiny gems! They're all mine now! | — | once per land |
| mag_start | the fight | the nest glitters; the Magpie settles to its fight size | You want my gems? Come and get them! | — | every time |
| tv_boss_phases | the bar appears, the first boss of the Sky Isles | the bar shows five segments, each lit in turn | This boss has five parts. Each part knocks off a piece of its bar. | — | once per save |
| mag_phase_3 | phase 3 | the Magpie snatches the gem out of the sign's word | Grr! Then I'll snatch them right out of the words! | — | every time |
| tv_gem_grab | the first Gem Grab | the empty slot glows; the /ae/ petal fans out its gems | The magpie took a gem. Listen to the word, and put the right gem back. | picks a gem | first two per save |
| mag_big | phase 4 | the Magpie flies up to its perch and puffs up | That word is far too long for you! | — | every time |
| mag_stagger | the Word Dragon hits | the Magpie drops to one knee; the chest's lock cracks | Ow! My feathers! | — | every time |
| mag_beaten | the full stop | the ninja star hits; the nest tips; the chest falls | My lovely gems! Oh, all right, take them. | — | every time |
| imp_grab | Sensei helps with a word, in any phase | the petal imp darts in, grabs that word's gem, and flies towards the Baron's balloon | Ooh, shiny! Mine! (caption and squeak) | — | every time |
| tv_imp_grab | straight after | Sensei points after the imp | The imp's got one. We'll get it back. | — | first two per session |

#### 2.5.3 [R2: SY10] Baron Muddle: the final battle

**[R3: Jonas, Baron final only]** **The only time the child fights the Baron, and always with really hard words.** Jonas (27 September): "That should be the final, final battle with really hard words always." So every item here, on the first fight and on every rematch, uses Year 2 code or is a long word, and no word is one an earlier boss used: the letter's muddled words have Year 2 spellings (*laugh, caught, knee*); the petals are the year's rarer gems; the speed round is Year 2's spellings with more than one sound; the long words are the end-of-Year-2 check's own kind (*me·cha·nic, cha·rac·ter*), with *mul·ti·pli·ca·tion* as the encore; and the last sentence is "The whole World Flower blooms.", whose *whole* brings Year 2's < wh >. A rematch keeps all of that, and the encore is always offered. Until Muddle Castle ships, the game has no Baron fight.

Muddle Castle, the end of Year 2 (check 38). About six minutes, seven with the encore, with a save point at each phase (if the child leaves, the fight resumes at the phase they reached, and the audio for that phase is warmed then). The Baron's lines are in the voice he has now (`baron_*`). The guardians the child has beaten come back, one per phase: six-year-olds adore "everyone you've met comes to help".

| Phase | Items | What happens | Who helps |
|---|---|---|---|
| 1. The muddled letter | 3 fixes | the Baron's letter, **one sentence at a time** on the note (three sentences, one muddled word each, only words the child spells securely, §3.6; **[R3: Jonas, Baron final only]** each a word with a Year 2 spelling: *laugh, caught, knee*). The child reads each sentence with the slider, finds the muddled word and fixes its gem | **Captain Parrot** lands on each muddled word and squawks |
| 2. Every petal | 4 | Gem Choice across the year: one word per vowel family, with at most three gems each (*eight, chief, though, earth*) | **the Sky Magpie** drops a stolen gem back into the bank each time |
| 3. Two ways | 3 | a Sound Detective speed round on **[R3: Jonas, Baron final only]** Year 2's spellings with more than one sound: *though* (< ough >), *ghost* (< gh >), *gym* (< y >), each wrong reading try-safe ("thoo", "fost", "jime": not words, SW8; *through* is out, because "throw" is a word) | **the Ghost Captain** lights the lens |
| 4. Long words | 2, and the encore | the Baron's **throne of muddled letters stands up** into his last form, a giant made of letters. *me·cha·nic* and *cha·rac·ter* at syllable level: each Word Dragon knocks letters off it. Encore, for a child on a streak: *mul·ti·pli·ca·tion*, "the Baron's longest word", the biggest dragon of all. The letter giant crumbles and the Baron drops to one knee | **the Giant** holds the castle door shut so the Baron can't escape |
| 5. The last word | 1 sentence | **[R3: Jonas, Baron final only]** **"The whole World Flower blooms."** (five words; *whole* has < wh >, EC44, within the dictation lag). At the full stop, the ninja's final kick; the flower blooms complete | all of them cheer |

**Decision (M25).** The encore is the stagger's biggest blow, not the knockout, so one rule holds for every boss: the sentence finishes it. The six-year-old judge asked for the encore "as the literal last blow"; it is still the biggest hit of the game, the moment before the last word. Timing: about 75 s for the letter, 60 s for the petals, 45 s for the speed round, 2 minutes for the long words (60–90 s more for the encore) and 40 s for the sentence.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| baron_final_start | the fight | the castle hall; the Baron on his throne of muddled letters | So you found my castle. My rarest spellings are all in here. Mwa-ha-ha! | — | every time |
| baron_final_letter | phase 1 | the letter unrolls, one sentence showing | Read my letter, little ninja. I wrote it myself! | reads it; taps a word | every time |
| baron_final_throne | phase 4 | the throne stands up into a giant of letters | My throne! Stand up and fight! | — | every time |
| baron_final_long | phase 4 | the letter giant looms over the long word | These words are so long, nobody can read them! | — | every time |
| baron_final_beaten | the full stop | the letter giant collapses into neat words | No! My muddles! They're all unmuddled! | — | every time |
| baron_sorry_1 | the finale, first win only | the World Flower blooms; the Baron sits on a step, small | I'm sorry. I never could read the long words. They muddled me. | — | once per save |
| baron_sorry_2 | straight after | he looks up at the child | So I muddled everyone else. But you read them all. | — | once per save |
| baron_help | straight after | a key glows in his hand; the Library's doors on the Atlas | Will you help me read them? I know a place full of long words. | taps ▶ | once per save |

#### 2.5.4 [R2: SY6] The Library's Word Dragons (in brief)

A wild Word Dragon comes out of a book. Its body has one segment per syllable of its word, and its head is the word's **ending**, drawn closed. The child builds each syllable in the Syllable Dragon, and each built syllable calms a segment, starting from the tail. The head opens only when the child builds the ending: for *magician*, the root card *magic* appears beside it, and the child builds < ci > < a > < n > (§3.3). When the last segment is calm, the dragon curls up into its book and becomes a card in the child's Word Scroll (§5.2). The Great Book Dragon is enormous and drawn differently (an ancient dragon of pages), not a recolour.

### 2.6 After the boss: the chest, the lair and the journey

1. **The knockout, then the chest.** **[R2: SY2]** The chest opens and every gem still in it flies to the World Flower (today's trip). The gems that needed help are already with the imp.
2. **The belt stripe** (§5.1) is sewn on the reward screen: in colour at the pass mark, in silver thread below it.
3. **The next chapter.** **[R2: SY9]** The boss drops the next land's first story chapter, which the child reads when they arrive.
4. **The lair.** If the imp grabbed any gems, a lair stone appears in the land map's spur slot two stones later (at the end of a land, on the next land's map). It becomes the glowing stone after one more stone, so practice comes before the rematch. It is a **Gem Chase**, a two-minute battle on exactly those spellings, with the imp as the monster. The gems come home when they are spelt right first try, and a silver stripe turns to colour.
5. **The journey.** **[R2: SY1]** When the next land is open (§1.7.1), the overworld map opens, the ninja walks, sails or flies there, and the Baron introduces the new guardian. At its own pace, if the bridge still needs planks, the map shows it and Sensei says `tv_bridge_more` "A few more planks, and we can cross!"; the land's practice fills the days until it is built. At a map's end, the Atlas and the map's journey scene play instead (§1.8).
6. **The finale** plays only after the final battle, and only the first time.

---

## 3. New mechanics for Years 1 and 2

Each mechanic has its Sounds~Write basis, where it lives, its screen, and a script sketch in TEACHER_SCRIPT's form (frame, Sensei's slow demo, the Ready tap, the hand-over). **[R2: F2]** Sizes are in stage px (1280 × 720). On production the stage is drawn at 0.492 on an 844 × 390 phone, 0.471 on 667 × 375 and 0.45 on 740 × 360, so 44 CSS px needs 90, 94 and 98 stage px: **nothing a child taps is under 90 stage px, and anything that must work on a 360-dp phone is 98.** **[R2: F7]** Lines with a word in them are SPT templates (one whole take per value); fixed lines are `tv_` lines.

### 3.0 Four shared parts

#### 3.0.1 The carriage row: one layout for long words and sentences

**[R2: N1]** A long word is a **Word Dragon** whose body has one **segment** per syllable, and a dictated sentence is a scroll with one **panel** per word. Underneath, both are one component, the **carriage row** (the name stays in code and for builders), with three rows:

| Row | Stage y | What it holds | Sizes |
|---|---|---|---|
| **A. The dragon** (or the scroll) | 96–196 | the head on the left (the word's picture in a round frame, 110 × 100, or a sparkle when there is no picture), then every segment in compact form, joined by 16 px joints; the last segment ends in the tail | a compact segment is 28 + 40 px per sound wide (at least 68) and 100 tall. Its sounds show as small dots until built, then as small letters |
| **B. The active segment** | 230–410 | the segment being built, enlarged, with one line per sound | **[R2: F2]** slots of 104 px (up to 4 sounds), 92 (5) or 90 (6): never smaller, because a filled slot can be tapped to undo |
| **C. The bank** | 520–630 | only the active segment's tiles, plus any rivals | **[R2: F3]** at most 7 tiles, each at least 90 px, as `rowFit()` allows in the 748 px between the ninja and Help (§3.0.3) |

**[R2: F4] The width limit** is 980 px (x 150–1130). When a boss is perched at the top right (§2.3.3) it is **840 px** (x 150–990); a word wider than that in a boss uses a 90 px head and 36 px per sound in its compact segments.

**It fits the longest words we will use.** The widths are the dragon's, head included; the last column is the read-back scale (below).

| Word | Syllables (sounds) | Width | Fits? | Read-back scale |
|---|---|---|---|---|
| *sunset* | sun (3) · set (3) | 110 + 148 + 148 + 2 × 16 = 438 | yes, and beside a perched boss | 1.3 |
| *fantastic* | fan (3) · tas (3) · tic (3) | 110 + 3 × 148 + 3 × 16 = 602 | yes, and beside a perched boss | 1.28 |
| *multiplication* | mul (3) · ti (2) · pli (3) · ca (2) · tion (3) | 110 + 148 + 108 + 148 + 108 + 148 + 5 × 16 = 850 | yes; beside a perched boss, 90 + 36 px a sound: 778 | 0.91 |
| *electrician* | e (1) · lec (3) · tri (3) · cian (3) | 110 + 68 + 148 + 148 + 148 + 4 × 16 = 686 | yes | 1.12 |
| *autobiographical* (the longest word in our files, a Year 5–6 word) | au · to · bi · o · gra · phi · cal | 978 | just; never in a boss | 0.79 |
| *The World Flower blooms.* (a boss's last word; panels use 32 px a sound) | 2 · 4 · 4 · 5 sounds | 92 + 156 + 156 + 188 + 3 × 16 = 640, with no head | yes, and beside a perched boss | – |
| the longest dictation sentence in the unit files ("The cook put a pot on the hob.", 8 words) | | 944 (measured, `judge-feasible/sentences.txt`) | yes; never in a boss | – |

Today's single row of slots can't do this: *multiplication* is 1,184 px of slots in a 660 px box, and its tiles run under Help (audit §4.2). With segments, no row ever holds more than one syllable's tiles.

**What moves.** A segment being built slides down from row A into row B and grows. When it is done, it shrinks back up into its place in the body, carrying its letters. When every segment is built, rows B and C fade, and the joined dragon moves over the read slider's rail for the reading. Transform and opacity only (PERF.md).

**[R2: F5] The read-back.** The dragon is placed over the slider's rail (`RAIL`, y 460), inside the slider's play area (x 340–1110), at a scale of **min(1.3, 770 ÷ its width)**: *fantastic* reads at 1.28, *multiplication* at 0.91. Revision 1's fixed 1.3× would have made *multiplication* 1,105 px wide.

#### 3.0.2 The read slider for long words and sentences

The read slider (`src/ui/ReadSlider.tsx`; [READ_SLIDER.md](READ_SLIDER.md)) puts the tortoise at the start of a rail under the pictures, and the child slides it left to right. Each part is said as the tortoise reaches it (the slow way), and then the rabbit at the end says the whole (the fast way). For long words and sentences it keeps the same gesture and the same two animals, with one new idea: **the tortoise speaks in the spelling voice and the rabbit in the talking voice.** That is Sounds~Write's own pair: "in our talking voice we say 'multiply', but in our spelling voice we say mul-ti-ply" (SW §3.4).

| Level | The tortoise (slow) | The rabbit (fast) | Sounds~Write |
|---|---|---|---|
| **sounds in a syllable** (sound level) | each sound as it reaches it; at each join it stops, and the syllable is said ("sun") | the whole word | Lesson 12: "say the sounds, read up to the line, and say the syllable" |
| **syllables** (syllable level) | each syllable, in the spelling voice: "mul · ti · ply" | "multiply" | Lesson 14, and the spelling voice |
| **words** (a sentence) | each word, as the tortoise passes under it | the sentence, read smoothly | reading back a dictation |

- **The syllable stop.** At a join, the tortoise waits for the syllable's clip to end, with the elastic ratchet the slider already has (clips never overlap). A join is a small gold notch in the rail.
- **Backwards never reads**, as now.
- **[R2: F5] `RAIL` becomes a parameter** of `geoFor()` (it is a constant today), because the Syllable Dragon (y 460), Ninja Vanish (y 300–340) and Muddled Notes (on the note) put it in different places. For the first stone, each syllable of a compound is a `"words"`-mode item (the item *sun* plays `/a/w/sun.mp3`), with a text plate in place of a picture, so PW1 needs no new slider mode.
- **[R2: F8] The spelling voice is one take per long word.** Sensei says the word slowly in syllables, with deliberate pauses ("mul… ti… ply"), and the take is cut at the silences into a `SYLL_TIMES` table (like `SLOW_TIMES`), one onset per syllable. Revision 1 planned about 600 isolated syllables; that is the pure-sound problem again, because TTS reads an isolated "ti" or "pli" as letter names or as real words ("tie", "ply"), and Whisper can't check a nonsense syllable. In a word, the context gives the right vowels. The gate: the pause count equals the syllable count, then the judge, then Jonas's ear on 20 words. About 380 takes for Years 1–2 and the Library. PW1–PW2 compounds, whose syllables are real words (*sun, set, cob, web*), use the recorded words and need no new clips.
- **Other new clips:** each dictation sentence read smoothly (SPT's sequence tier). The talking-voice word exists for the 180 long words we have.
- **The idea, said.** The fast-and-slow lines (TEACHER_SCRIPT §9) get two long-word forms: `tv_fs_long_slow` "The slow way to say a long word is its syllables." and `tv_fs_long_fast` "The fast way is the whole word, all together."

#### 3.0.3 The support ladder: a rung for every word

Spelling choice is mostly word knowledge (prior-art §4), so every word the learner model tracks has a **rung**, the way Spelling Shed has levels and Pokémon Typing fades its letters (prior-art Idea 5). Every spelling game reads it.

| Rung | The child gets | Moves up after | Used by |
|---|---|---|---|
| **R0** | Sensei builds it (the I do) | being shown once | the first meeting |
| **R1** | the word's own tiles, jumbled, with the word **shown** while they build | one first-try success | the first meeting's we do; Lesson 6's word puzzle |
| **R2** | the word's own tiles, with a **peek**: the word is shown and read, then vanishes, then built. **[R2: SW10]** From Gem Choice's Lesson 7 step, the fan of the sound's gems opens at the slot | a first-try success on a later day | current-unit words (Sounds~Write's Lesson 7: read, then write) |
| **R3** | own tiles plus **rival spellings** of its sounds, rimmed in their petal's colour ("which /ae/ gem?") | a first-try success on a later day | **[R2: SW2]** ordinary battles, for spellings taught four or more units back; the weekly list from day 3 |
| **R4** | **[R2: F3]** no colour rims; the bank is the word's tiles, **the child's own confusions** for its sounds, and the commonest other spelling of each vowel sound, within the bound below. Not "every spelling the child knows" (for *caught* at the end of Year 2 that would be 16 tiles, 1,660 px) | first-try successes on two days | bosses' spell phases, dictation, practice tests |
| **R5** | secure: recalled at spaced intervals (1, 3, 7, 14 days) | – | review; Muddled Notes may use it |

- A miss drops the word one rung for its next appearance. A word moves up at most once a day, and only the day's first attempt counts (Brain Age's rule, prior-art §2.11).
- Help never pays: a word finished with help earns no rung, stars or gems (PEDAGOGY.md's rule).
- **[R2: F3] The bank's bound.** Rivals are added in confusion order (the child's own confusions first, then by frequency) only while `rowFit()` keeps every tile at 90 stage px or more, and never past 7 tiles. A spelling of four letters (< augh ough eigh >) costs about 1.5 tiles. Measured with the game's own `rowFit()` (`judge-feasible/fit.txt`): *rain* with < ay > and < a > is 104 px; *eight* with rivals 96; *though* 90; *caught* with two /or/ rivals would be 84 px, so it gets one.
- **[R2: F13]** A word's rung and its day's first try live in the ledger's per-word summary in the save, which is bounded (§6.3).
- The grown-ups' page shows it in plain words: "*great*: spelt from memory on 3 days."

#### 3.0.4 [R2: SY7] Sensei's voice for 6- and 7-year-olds

The audit counted "It's two letters, but it's one sound" 23 times in 32 minutes of Year 1 play, and "A dojo is where ninjas practise!" said to seven-year-olds. Sensei's voice grows up with the maps:
- **Concept lines once per land.** A school starter on the Sky or Muddle Isles counts as having heard the Initial Code's concept lines ("It's two letters, but it's one sound"; "A dojo is where ninjas practise!"). On the Sky Isles a concept line plays at most once per land; on the Muddle Isles only when a mistake calls for it.
- **Five seconds on a replay.** On a recap or short form, no more than about 5 seconds of talk before the child's first action.
- **Year 2 versions** of the lines that assume Reception: `tv_school_know_y2` (§1.5), and a shorter Year 2 frame for each game's full form (`tv_gc_frame_y2` "Here's Gem Choice. You pick the gem for each word.").
- **Less spoken praise.** On the Muddle Isles, praise is mostly the chime and the ninja's move, with spoken praise at most once a level.
- **Measured.** The playtests count the seconds of Sensei per minute of play, per land, which must fall from map to map (PLAYTEST_PLAN §4).

### 3.1 [R2: N1, N2, SW-s2, F4, F7] The Syllable Dragon (Lessons 11–14)

This is the brief's "Syllable Slice" and "long-word build" in one game. Revision 1 called it the Syllable Train; the layout and the lesson steps are unchanged.

**Sounds~Write basis.** The polysyllabic strand starts "at around the second week of Unit 4 /oe/" in Year 1, with Lessons 11–12 (the teacher splits, the child builds and reads at sound level), then 13–14 (the child splits and works at syllable level), falling back to 11–12 whenever needed ("not linear"). Split by listening, start a syllable with a consonant where possible, never cut a spelling in two (SW §3.1–3.3).

**Where.** The first stone is in the Sky Temple, straight after the /oe/ dojo (EC4's second week). Then two stones in every Sky land and three in every Muddle land, the big attack of every boss from the Magpie on, and the Library. Its words follow the official checks' own long words (§1.2): Initial Code compounds (*sunset, zigzag*), harder Initial Code (*dentist, chopstick*), three syllables and weak syllables (*fantastic, lemon*), endings as syllables (*jumping, thicker*), then Extended Code spellings 4–7 units back (*painting, window*), then three and four syllables and special endings.

**The creature.** Every long word is a **Word Dragon**. It arrives as an egg with the word's picture on it; Sensei says the word, and the egg hatches into a sleeping dragon with one long, blank body. The joins between its syllables are marked, each segment is built sound by sound, and when the segments join, the dragon wakes, flaps and flies: into the Word Scroll as a card (§5.2) in a stone, or at the boss in a fight. "The longer the word, the bigger the dragon." A five-syllable dragon is a monster.

**Two levels, as in Sounds~Write.**

| | Sound level (Lessons 11–12) | Syllable level (Lessons 13–14) |
|---|---|---|
| Who splits | Sensei says how many syllables, and sparkles show where the joins go; **[R2: N2]** the child taps each sparkle to mark the join (the teacher's split, the child's hands) | the child finds them: they tap the dragon's body once for each syllable they hear, then tap ✓ |
| Before each segment | Sensei says the syllable, as a demonstration ("The first syllable is… sun") | nothing; Help's first press plays the syllable |
| Building | tile by tile, saying the sounds; the per-sound help ladder | tile by tile, saying the syllable; rivals on the bank from the word's rung |
| Reading (12, 14) | the word's segments have their lines in; the tortoise reads sounds and stops at each join | the tortoise reads syllables |
| **[R2: SW-s2]** Writing it again | at R2 and above, once the dragon wakes it flies off, and the child builds the whole word again from memory, one syllable at a time ("rub it out and write it again", Lesson 15). The gap closing on its own is copying; this is retrieval | the same |
| When | from the Sky Temple | from Autumn Orchard, for a child whose last 10 sound-level words were at least 80% first try; back to sound level after two misses in a word |

**The play, at sound level.**
1. An egg rolls in with the word's picture; Sensei says the word.
2. The egg hatches into a sleeping dragon with one long body. Sensei says how many syllables it has; a sparkle shows each join, and the child taps each one (Sensei's paw does it in the I do). The body splits into segments, each with its lines.
3. For each segment: Sensei says the syllable; it drops into row B; its tiles drop into the bank; the child builds it, saying the sounds; the tortoise reads it ("/s/ /u/ /n/ … sun").
4. When all are built: the dragon moves over the rail; the child slides the tortoise under every segment (the syllables, in the spelling voice), then taps the rabbit ("sunset").
5. **The gap closes.** The joints pull tight, the segments click into one body, the dragon opens its eyes and flaps. That is Sounds~Write's "write the word without the gap between the syllables". In a boss, it flies at the boss.
6. At R2 and above: the dragon flies off, and the child writes it again.

**Sounds~Write's corrections, in the game** (TTE for Lessons 11–14, SW §3.7):

| The child | What happens | Line |
|---|---|---|
| a wrong-sound tile in a segment | the tile says its sound; the slot glows | `tv_syl_listen_again` "Let's listen to that syllable again." then the syllable (a `~syl<i>` demonstration) |
| a rival spelling (right sound) | the tile glows; the right gem glows | `same_sound_spelling` (existing): "Yes, that's a spelling of that sound too! But in this word, we spell it like this..." |
| taps too few or too many syllables (syllable level) | the joins glow and fade back into one body | `tv_syl_precisely` "Let's say it again, precisely in its syllables." then the word in the spelling voice; the count is given, and this word goes back to sound level |
| a schwa slip (*multuply*) | the segment with the slip glows | `w_syl_talking` "In our talking voice we say {word}." · `w_syl_spelling` "In our spelling voice we say {word}." (the spelling-voice take) |
| taps the rabbit before sliding | the rabbit waits; the tortoise glows | `tv_fs_stuck_slow` (existing family) |

**The screen at 844 × 390** is §3.0.1's. Before it splits, the long blank body lies across row B; each join's sparkle is a tap target 100 × 180 stage px. At syllable level, any tap on the body (at least 600 px wide) adds a join, and the ✓ for "that's my count" sits in the right-hand column where ▶ goes (Sort's layout).

**The script: the full form** (the first Syllable Dragon, in the Sky Temple; *sunset* is the we do, *zigzag* the child's own). Run to the child's first action (building *sun*): about 11.5 s.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_syl_frame | 0 s | an egg with a sunset picture rolls in | This game is called Syllable Dragon. Long words are made of parts called syllables. | — | full |
| `w_my_word` · sunset | 5.4 s | the egg cracks; a sleeping dragon with one long, blank body | My word is sunset. | — | full |
| `w_syl_hear` · sunset, 2 | 7.3 s | the body glows; one sparkle where the join goes | When I say sunset, I can hear two syllables. | — | full |
| tv_syl_mark | 9.4 s | Sensei's paw taps the sparkle; the body splits into two segments with their lines | I'll mark where the syllables join. | — | full |
| tv_syl_first_is · sun (`~syl0`) | 10.2 s | the first segment drops into row B; s, u, n drop into the bank | The first syllable is… sun | — | sound level |
| tv_syl_build_say | 11.5 s | the slots glow | Can you build it? Say the sounds as you go. | builds s, u, n | full; recap |
| tv_syl_read_syl · (sounds) · sun | the last tile | the tortoise walks under the segment | Now say the sounds, and read the syllable. · /s/ /u/ /n/ · sun | — | first two words per session |
| tv_syl_next_is · set (`~syl1`) | straight after | the second segment drops into row B | The next syllable is… set | builds s, e, t | sound level |
| tv_syl_read_each | the last tile | the dragon moves over the rail; the tortoise glows at the start | Now slide the tortoise, and read each syllable. | slides: sun · set | full; recap |
| tv_syl_read_word | the tortoise reaches the end | the rabbit wakes | Now say the syllables, and read the word. | taps the rabbit: sunset | full; recap |
| tv_syl_no_gap | the rabbit's word | the joints pull tight; the dragon opens its eyes and flaps | We write it without the gap, all joined up. | — | full; then the flap alone |
| tv_ready_go | straight after | ▶ and the paw | Do you want to have a go now? | taps ▶ | full |
| `w_your_word` · zigzag · `w_syl_hear` · zigzag, 2 | the hand-over | a new egg hatches: a zigzag picture; the long body; one sparkle | Your word is zigzag. · When I say zigzag, I can hear two syllables. | — | every time |
| tv_syl_your_mark | straight after, first two per save | the sparkle pulses | Tap the sparkle to mark the join. | taps it | first two per save |
| tv_syl_again | R2 and above, the dragon flies off | the empty segments wait | Now you write it again, one syllable at a time. | builds zig, zag | every time (short after three) |

Recap (a later day): `tv_syl_recap` "It's the Syllable Dragon again. We build long words, one syllable at a time." Short: `tv_syl_short` "Here's the Syllable Dragon." The first syllable-level word gets `tv_syl_you_find` "This time, you find the syllables. Tap the dragon once for each syllable you hear, then tap the tick." (the tick is the only new symbol; explained where it appears, TEACHER_SCRIPT §2.5).

**[R2: F7] Its speech, as SPT templates.** `w_my_word` "My word is {word}." and `w_your_word` "Your word is {word}." (long words added to the domain); `w_syl_hear` "When I say {word}, I can hear {n} syllables." (new); `w_syl_talking` and `w_syl_spelling` (new); the syllable said as a demonstration is a `~syl<i>` clip mod of the word's spelling-voice take, beside `~slow` (legal as a demonstration under SPT §1.6); `long-words` and `syllables` domains are added to `members()`. Everything else is a fixed `tv_syl_` line.

**For the bots.** `window.__snState = { scene: "dragon", level: "sound" | "syllable", phase: "mark" | "build" | "read" | "rabbit" | "again", segment: n, joins: [...], bank: [...], answer: [...] }`. **[R2: F4]** The sweep checks that no tile, slot or segment leaves the stage or overlaps a perched boss's box (x ≥ 1000, y ≤ 250), for every word in the pool, at 844 × 390, 667 × 375 and 740 × 360; and a geometry harness checks every long word in the unit files and the "shun" family (§4.3), with synthetic segmentations where the files have none.

### 3.2 Gem Choice: which spelling in this word?

**Sounds~Write basis.** Lesson 6 (one sound, different spellings, word puzzles) opens every Extended Code sound unit, and Lesson 7 has children read the unit's words and then write them. **[R2: SW10]** Lesson 6 gives the child "the sounds we need to build the word": they build it, then the teacher points out the target spelling and sums up that the spellings are different but the sound is the same. There is no choice until Lesson 7. The correction for a right sound with the wrong spelling is "This is a way of spelling /er/, but in this word we need this spelling" (SW §1.3, §3.7). New spellings go into writing only slowly: accurate spelling is expected 5–7 units later, and quizzing runs at least four units behind (SW §1.2).

**Where.** It is not one level. It is how every spelling game works from the Rainbow Bridge on:
- **[R2: SW10] The dojo** (a new unit's first stone, Lesson 6): the word puzzle, built from the word's **own tiles** (R1). After each word, its gem flies into its column on the sound's petal, and Sensei sums up: `tv_gc_sum` "Different spellings, but it's the same sound… /ae/" (once per unit).
- **The Gem Choice stone** (Lesson 7): read the word, it vanishes, build it: the **fan** opens at the sound's slot (R2, with the peek). This is Gem Choice's full form, below.
- **Battles and bosses:** bank mode. Rival spellings are on the bank at R3 in ordinary battles (only for spellings taught four or more units back), and the bounded full bank at R4 in bosses and dictation (§2.3.1).
- **Gem Trials:** a trial's words are drawn from the gem's **sound**, not only its spelling, so an < ai > trial has *rain, day, tail, stay, paint*, and the child chooses each time. The gem's letters no longer hang over the monster (audit §3).
- **The weekly scroll** (§1.9.4).
- **[R2: SW1] Before the Phonics Screening Check,** in EC16, EC18, EC19 and EC20 (Circus Island and Autumn Orchard), Lesson 6 shows every spelling, but Gem Choice and the practice battles use only the check's spellings (< s ss c >, < l ll >, < or au aw >, < air >), as the guidance asks. Every spelling comes back in Star Dunes, after the check.

**Fan mode** (Lesson 7): when the child reaches the slot for the unit's sound, its petal opens above the bank like a fan of cards, showing the gems the child has met for that sound (the chart's petal as the palette, Jonas's idea). The gems are 96 px discs in an arc across x 340–1090, y 420–520, with at most 7. Tapping a gem drops it into the slot.

**Bank mode** (practice): no fan. The rival tiles sit in the bank with the other tiles. At R3 each tile has a thin rim in its sound's petal colour, so the three /ae/ spellings are visibly "the /ae/ gems" and the question is "which one?". At R4 the rims go, which is dictation.

**[R2: F3, SW2] The change to `tileBank()`.** Today a tile can only be a distractor if its sound is not one of the word's sounds (audit §5). From the Rainbow Bridge on:
- for each sound in the word, rival spellings the child has met for that sound, in confusion order (the child's own confusions first, then by frequency), added only while `rowFit()` keeps every tile at 90 px or more and the bank at 7 tiles or fewer (§3.0.3);
- in ordinary battles, only spellings taught four or more units before the level, unless the word has just had its peek; bosses and dictation follow the dictation lag (§2.3.1);
- never in Lessons 1, 5 and 6 (word building stays the word's own tiles, Sounds~Write's rule);
- the existing `same_sound_spelling` branch moves from Dojo.tsx into Battle.tsx too.

**The script: the full form** (the Sky Temple's first Gem Choice, the day after the /ae/ dojo; *play* is Sensei's word, *rain* the child's). Run to the child's first action (sliding the tortoise under *play*): about 10.5 s.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_gc_frame | 0 s | the /ae/ petal opens: < ai > < ay > < a > < ea > as gems | This game is called Gem Choice. Some sounds have lots of spellings. | — | full |
| tv_gc_gems | 4.2 s | each gem glints in turn | Each spelling is a gem in the sound's petal. | — | full |
| `w_my_word` · play · tv_gc_slide_with_me | 7.0 s | the word card *play* with its picture; the tortoise at the rail's start | My word is play. · Slide the tortoise, and read it with me. | slides: /p/ /l/ /ae/, taps the rabbit | full |
| tv_gc_vanish | the rabbit's word | the ninja's smoke puff; the card rolls up | Now my ninja makes it vanish. | — | full; then the puff alone |
| tv_gc_ido_build | straight after | the paw builds p, l; the slot for /ae/ glows, and the fan opens | I'll build it. The last sound is… /ae/ | — | full |
| tv_gc_ido_pick | straight after | the paw picks < ay >; the card unrolls to check: it matches | I remember this gem from the word. | — | full |
| tv_ready_go | straight after | ▶ and the paw | Do you want to have a go now? | taps ▶ | full |
| `w_your_word` · rain · tv_gc_read_first | the hand-over | the card *rain*; the tortoise | Your word is rain. · Read it first. | slides, taps the rabbit; the puff; builds; picks < ai > | every time |
| **[R2: F7]** `ws_gem_we_need` · rain | a right gem, the first two per session | the card unrolls; the gems match and sparkle | That's the gem we need in rain. | — | every time (one take per word) |
| same_sound_spelling (existing) | ↳ a rival gem | the card unrolls; the rival glows beside the right one | Yes, that's a spelling of that sound too! But in this word, we spell it like this... | swaps it | every time |
| tv_gc_think | ↳ 8 s at the fan | the gems wiggle in turn | Think of the word you read. Which gem did it have? | picks | every time |
| tv_gc_peek_again | ↳ 16 s, or Help's second press | the card unrolls for 2 s | Here's the word again. Look at the gem. | picks | every time |

Recap: `tv_gc_recap` "It's Gem Choice again. We pick the right gem for each word." Short: `tv_gc_short` "Here's Gem Choice." In a battle, the first rival tiles of a save get one line as they appear: `tv_gc_battle_first` "Look, some sounds have more than one gem here. Pick the gem for this word."

### 3.3 Long words with special endings: *magician*, worked through

**Sounds~Write basis.** "Shun" is three sounds, /sh/ + schwa + /n/. < ti >, < ci >, < si > and < ssi > are spellings of /sh/ (< si > is /zh/ in *division*), and the < o > of -tion and the < a > of -cian are schwa spellings. At sound level, one tile is one sound ("ONE sound per letter tile!"). Special endings have no unit: they come through the long-word lessons, and Lesson 15 (analysing a word) links the hard spelling to other words with it. The National Curriculum's guidance adds the root word as a clue: -cian after a root ending in < c > (SW §4).

**Decision: three tiles under one gold bracket.** Prior-art Idea 4 proposed a single gold tile for "tion". That breaks "one sound per tile" at sound level. So:
- **at sound level,** the ending is three tiles, < ti > < o > < n >, under a **gold bracket** that appears over their three lines with Sensei's "This is a special ending. It's three sounds.";
- **at syllable level,** the ending is one gold chunk, *tion*, because it is a syllable;
- **on the World Flower,** < ti > < ci > < si > < ssi > are gems of the /sh/ petal (and < si > of /zh/), won in the Library: the golden bloom's gems.

**When.** *-tion* from Roaring Peaks (National Curriculum Year 2: *station, motion, fiction, section*), and the maths words (*addition, subtraction*) in Muddle Castle, with *multiplication* as the final battle's encore and in the Library's Shun Wing. *-cian*, *-sion*, *-ssion* and *-ture* in the Library (National Curriculum Years 3–4). A Year 2 child may **read** *magician* and *division* earlier (Lesson 12 at sound level, with the lines in), but spelling them comes in the Library.

**[R2: SW7] Which ending, and why.** The ending is chosen the way Sounds~Write would teach it: by reading the word and knowing it, with the root only where it truly helps.
- **-tion** is "the ending most words use". It gets no root clue, because roots mislead: the curriculum's own guidance ("-sion after d or se") would make *add* predict *addision*.
- **The root is the clue** only for **-cian** after a word ending in < c > (*magic → magician, music → musician, electric → electrician*) and **-ssion** after < ss > (*discuss → discussion*).
- ***optician*** is linked to *magician* by Lesson 15 ("the same spelling of /sh/"), not by a root: *optic* is not a word a seven-year-old knows.
- ***division*** is linked by Lesson 15 to *television* and *decision*, the words with the same < si > for /zh/.

**The run for *magician*** (the Magic Wing's first word, sound level; tiles m, a, g, i, ci, a, n; three segments). About 60 s.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| `w_your_word` · magician | 0 s | an egg with a magician pulling a rabbit from a hat; it hatches into a long body | Your word is magician. | — | every time |
| `w_syl_hear` · magician, 3 | 1.8 s | two sparkles | When I say magician, I can hear three syllables. | taps both sparkles | sound level |
| tv_syl_first_is · ma | 4.4 s | segment 1 in row B; m, a in the bank | The first syllable is… ma | builds m, a | sound level |
| tv_syl_next_is · gi | the last tile | segment 2; g, i and a rival < j > | The next syllable is… gi | builds g, i (or taps < j >) | sound level |
| same_sound_spelling | ↳ < j > tapped | < j > glows, then < g > | Yes, that's a spelling of that sound too! But in this word, we spell it like this... | taps < g > | every time |
| tv_lw_last_is · (the ending) | the last tile | segment 3 drops; its three lines light; the gold bracket draws over them | The last syllable is a special ending… shun | — | first two per ending |
| tv_lw_three_sounds | straight after | the bracket glows | It's three sounds, but one ending. | — | first two per ending |
| tv_lw_this_is_sh · /sh/ | the first tile placed | < ci > glows on the first line | This is… /sh/ · It's two letters, but it's one sound. | builds ci, a, n | first meeting of < ci > |
| tv_syl_read_each · tv_syl_read_word | the last tile | the dragon moves over the rail | Now slide the tortoise, and read each syllable. · Now say the syllables, and read the word. | slides; taps the rabbit | as §3.1 |
| tv_lw_root_1 · magic | straight after the join | a small card *magic* floats above *magi*; its < c > glows | Magician has another word inside it… magic | — | the Magic Wing's first two words |
| tv_lw_root_2 | straight after | the < c > of *magic* slides down onto the < ci > of *magician* | A magician does magic. So magician keeps the spelling of magic. | — | the Magic Wing's first two words |
| tv_lw_root_3 · music · musician | a later word, *musician* | *music* above *musician* | Music… musician. Can you hear the same ending? | — | once |

**Sounds~Write's other lessons for the same word** (SW §4.5) go in later rounds: **Lesson 12** on another day with *musician* and *optician*, the lines put in; **Lesson 15** once the word reads easily (Word Detective, §3.8): "Which part might be hard to spell?" → the child taps *cian*, then < ci >, and *musician* and *optician* appear as easy words with the same spelling. A child who offers *station* hears "That's the same sound, but it's a different spelling."

**The Root Dojo and the Shun Sort** (the Library):
- **[R2: SW7] The Root Dojo** starts from a word the child knows whose root really is the clue (*magic, music, electric, discuss*) and grows it into its long word. The root card always stays on screen, because the root *is* the clue. Words without a helpful root (*optician, division, station*) go to Word Detective instead.
- **The Shun Sort** is Sort's scene with ending chests: words fall, and the child reads each and sends it to < tion >, < cian >, < sion > or < ssion >. It starts with two chests (< tion > and < cian >). It is Lexia's suffix sort, done Sounds~Write's way: the word is read before it is sorted.

### 3.4 Sound Detective, placed on the maps

Sound Detective is designed in full in [MULTI_SOUND.md](MULTI_SOUND.md): a spelling in a gold lens, its petals below, and the child taps a petal to *try* that sound until the word is a real one ("That's not a real word. Try it a different way."). This design only places it and extends it.

**One stone per official spelling unit**, in the week after the sound unit that teaches its second sound (MULTI_SOUND §5), **[R2: SW1]** plus the Phonics Screening Check's < ch >:

| Land | Spelling units (Sound Detective stones) |
|---|---|
| Sky Temple | < ea > (EC3: *team*, *great*; /e/ joins at EC7), < o > (EC5: *hot*, *no*) |
| Cloud Town | < ow > (EC9: *cow*, *snow*) |
| Moon Marsh | < oo > (EC13: *moon*, *book*) |
| Circus Island | < ou > (EC15: *loud*, *double*, *soup*), < s > (EC17: *cats*, *his*), **< ch > for the check, tangentially** (Lesson 10: *lunch*, *chef*, *school*; moved here from Star Dunes so it comes before Easter) |
| Autumn Orchard | < ew > (EC22: *blew*, *new*) |
| Star Dunes | < a > (EC26: *cat*, *was*, *apron*, *father*) |
| Echo Island | < y > (EC31: *yes*, *gym*, *my*, *happy*) |
| Giant's Gorge | < g > (EC39: *gum*, *gem*) |
| Dolphin Bay | < gh > (EC41: *ghost*, *laugh*) |

**[R2: SY4]** It also appears as a boss move at most twice per map (the Sky Magpie, and the Ghost Captain and the final battle's speed round; §2.4), and as the World Flower's gate for a spelling with several sounds. Every word it uses for a wrong reading passes MULTI_SOUND §4.1's try-safety and accent check.

**In long words (Year 2).** Sounds~Write's Lesson 12 is where children find schwa: a syllable sounds one way on its own and another way in the word (SW §3.2). Sound Detective's lens can sit on a syllable: the child hears *le·mon* in the spelling voice, then the rabbit's "lemon", and Sensei says "In the word, this part sounds weaker. But we still spell it like this." It is a show, not a test (one per land in the Muddle Isles), because schwa is a spelling problem, not a reading problem (SW §3.4).

### 3.5 [R2: F6, SW-s3] The Dictation Scroll (Lesson 4a)

**Sounds~Write basis.** Dictation is in every session, at least two units behind. Words with untaught code are "on the board". Children read back what they wrote "to confirm that what they wanted was what they got" (SW §1.7, §8). In the checks, a dictated sentence ends every Extended Code check.

**The game.** Sensei says a sentence. The scroll unrolls with one panel per word (§3.0.1). The child builds the words in order: each word's panel drops into row B as Sensei says it ("The next word is… boat"), and its tiles fill the bank. Words with untaught code are written on a **little board** at the top right (180 × 110 px, below Hear it again); tapping it says the word. The capital letter at the start is given. The full stop is a ninja star the child taps at the end. Then the child slides the tortoise under the words, and the rabbit reads the whole sentence smoothly.

- **Length.** From Blossom Hills, 3–4 words (*Sam sat on a mat.*). In the Sky Isles, 4–6 words. In the Muddle Isles, 5–8 words. **Never more than 8 words or about 22 sounds** (every one of the 442 sentences in the unit files fits; the longest is 944 of 980 px). A boss's last word is at most five words.
- **[R2: F6] Year 2's option: pre-filled words.** In a Year 2 sentence, the words that aren't the target (*the, a, is*, and words well below the lag) can arrive already built, as whole-word tiles, so the child builds the one to three target words. A 30-tap item becomes about 10, which matters more for a six-year-old than the pixels.
- **Where.** One stone per land, the last before the boss, and the boss's last word.
- **Scoring.** One item per word, first try, each word at its rung (usually R4, since dictation is two units behind).
- **[R2: SW-s3] Dictating a single word** (a boss's spell phase, the practice test, Gem Choice without a peek) follows Sounds~Write's form: the word, a sentence with it, then the word again, "…and say the sounds as you do". The sentence comes from the unit files where one holds the word, and always for a homophone; the spelling voice is used only for a long word said on its own, never inside the sentence.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_dict_frame | 0 s | a scroll unrolls with empty panels | This game is called Dictation Scroll. I say a sentence, and you build it, word by word. | — | full |
| tv_dict_listen · (the sentence) | 4.8 s | the panels light one by one as each word is said | Listen to my sentence… The boat is on the sea. (sequence tier) | — | every time |
| **[R2: F7]** `w_first_word` · The | 7.4 s | the first panel drops into row B | The first word is The. | builds it | full; recap |
| `w_next_word` · boat | each next word | the next panel drops | The next word is boat. | builds | every time |
| tv_dict_board | ↳ the first board word of a save | the board glows with the word on it | This word is on the board. You can copy it from there. | builds it | once per save; then the glow |
| tv_dict_star | the last word built | a ninja star glows at the end | Now tap the star to finish it off. | taps the star (the full stop) | first two per save |
| tv_dict_read_back | straight after | the scroll moves over the rail; the tortoise | Now slide the tortoise, and read it back. | slides; taps the rabbit | every time |
| tv_dict_praise | the rabbit's sentence | the scroll glows | You built the whole sentence. | — | every other time |

Run to the child's first action: about 9 s.

### 3.6 The Baron's Muddled Notes (proofreading)

**Basis.** Proofreading for spelling is National Curriculum Year 2 writing (SW §7.3). Sounds~Write's version is reading back what you wrote, and its correction for a real but wrong spelling is the one Gem Choice uses. It is also Lesson 10's "read it wrongly" turned round: here the word *sounds* right but *looks* wrong.

**Why it fits the story.** The villain is called Muddle. From Star Dunes on, his muddles become misspellings: his notes (**[R3: Jonas, Baron final only]** the first carried by his lieutenant, the Sand Shark), his letter in the final battle, Captain Parrot's squawks, Muddle Castle's walls.

**A guard, because misspellings can stick.** Studies with adults and children have found that seeing a word misspelt can make you more likely to misspell it later (Brown 1988; Jacoby and Hollingshead 1990; Dixon and Kaminska 2007; cited from memory, **to check before the build**). So:
- only words the child already spells securely (rung R4 or R5) are muddled;
- only with a real spelling of the same sound (*trayn*, never random letters);
- at most one muddled word in a Year 1 note and one per sentence in a Year 2 note;
- every muddled word is fixed and read back correctly before the note leaves the screen, and the corrected note is what's said last;
- never within two weeks of the spelling being taught;
- **[R2: SW-s5]** Captain Parrot's swaps follow the same rules, and never touch the word the child has just built.

**[R2: F2, F5] The game.** The Baron's crow drops a note (a paper 1000 × 300 px at y 90–390), showing **one sentence at a time** in Andika at 64 px, each word its own tap target at least 90 px tall. (Revision 1's four-sentence letter at 64 px didn't fit the note.) The child slides the tortoise along the note's own rail (`RAIL` as a parameter) and hears it read. Because each misspelling has the right sounds, it *sounds* right. The child taps the word that looks wrong. A tapped muddled word lifts into the fix area (y 420–640) with its wrong gem glowing and the petal's fan open; the child picks the right gem, and the word flies back healed. A word that was spelt right, when tapped, gets a gentle "That word is spelt right." At the end, the rabbit reads the fixed note.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_note_frame | 0 s | the crow drops a note with the Baron's seal | Baron Muddle wrote a note. He muddled some of the spellings. | — | full |
| tv_note_read | 4.0 s | the tortoise at the note's rail | Slide the tortoise, and read it with me. | slides | full; recap |
| tv_note_find | the tortoise's end | the words wait | One word has the wrong gem. Can you find it? | taps a word | every time |
| tv_note_fix | a muddled word tapped | it lifts; its wrong gem glows; the fan opens | Which gem should it have? | picks | full; recap |
| **[R2: F7]** `ws_gem_we_need` · train | the right gem | the word flies back and sparkles | That's the gem we need in train. | — | every time |
| tv_note_fine | ↳ a word spelt right tapped | the word bounces gently | That word is spelt right. Look for another one. | — | every time |
| tv_note_hint | ↳ 12 s | the muddled word's gem glints once | Look closely at each word's gems. | — | every time |
| tv_note_done | the last fix | the rabbit wakes; the note is read smoothly | Now the note is unmuddled! | — | every time |

### 3.7 Sound Twins (homophones)

**Basis.** Homophones and near-homophones are National Curriculum Year 2 spelling (*there/their/they're, see/sea, bare/bear, one/won, sun/son, to/too/two, be/bee, blue/blew, night/knight*). Sounds~Write dictates a word with a sentence, which is how a homophone is told apart. Today the game hides homophones altogether (`dictationSafe`, audit §9). This game brings them out on purpose.

**The game.** A picture or a short sentence at the top (y 90–330). Two word cards below (380 × 180 each, at x 250–630 and 650–1030). Sensei says the word and its sentence. The child taps the card that fits the meaning, and the picture comes alive (the ship sails on the sea). Then, at rung R3 or above, the child builds it.

- **Only pairs the child can decode both of,** by their units: *sea/see*, *tail/tale* and *there/their* from Echo Island (their code is Year 1's); *night/knight* and *new/knew* from Gnome Hollow, where < kn > is taught.
- **Where.** The Muddle Isles, one stone per land from Echo Island, and inside dictation whenever a homophone is dictated.
- **Pictures.** About 40 pairs need a picture for each meaning (§4.1).

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_twin_frame | 0 s | two cards, *sea* and *see*; a picture of a ship on the waves | This game is called Sound Twins. Some words sound the same, but they're spelt differently. | — | full |
| tv_twin_demo · (sea, with its sentence) | 5.4 s | the paw hovers over each card | Listen… sea. The ship sails on the sea. (sequence tier) | — | full |
| tv_twin_ido | 8.6 s | the paw taps *sea*; the ship sails | I'm looking for the sea with the waves. It's this one. | — | full |
| tv_twin_other · (see) | straight after | the other card; eyes blink on it | The other one is see, with your eyes. | — | full |
| tv_ready_go | straight after | ▶ | Do you want to have a go now? | taps ▶ | full |
| tv_twin_your · (pear, with its sentence) | the hand-over | *pear* and *pair*; a bowl of fruit | Your word is… pear. I ate a juicy pear. | taps a card | every time |
| tv_twin_other_one · (pair) | ↳ the other twin tapped | that card acts out its meaning (a pair of socks) | That's the other one… pair, like a pair of socks. | taps the other | every time |

### 3.8 Four smaller games, and stories that tell the plot

| Game | What it is | Basis | Where |
|---|---|---|---|
| **Alien Words** | **[R2: SW9, F9]** Friendly aliens arrive; each has a name that is an alien word from a **closed list** (about 120 per stage, grouped by unit, so a Moon Marsh alien uses only code taught by Moon Marsh), in the check's structures only: CVC to CCCVC, with scr, spl, spr and str (plus shr and thr) as the only three-consonant clusters. Kai and Suki read the name and the child taps who read it right. **The wrong reading is always a real error** of the kinds Sounds~Write's tracker records (a letter name, a two-letter spelling said as two sounds, a sound added or dropped), **never another valid sound** of a spelling: *meast* read with /ae/ is a valid reading, and the game never marks it wrong. Each alien read right joins the child's crew (N6). **The practice check**, in Autumn Orchard: 10 real and 10 alien words, **read aloud to a grown-up** who taps ✓ or ✗ for each word (like Speed Read); the grown-ups' page shows the score out of 20, labelled "practice, in the style of the Phonics Screening Check". The child sees only "Alien Words". A two-way choice is recognition with a 50% guess rate, so it is never called a check score | pseudo-words in the check; Sound Swap's nonsense words | Moon Marsh to Autumn Orchard; the Baron's pets after the check; review for a Year 2 child retaking it |
| **Seek the Sound** | After reading a story page, **[R2: SW-s9]** "Find every word with this sound… /ae/": the child taps each word with the sound, whatever its spelling; each found spelling glows in the petal's colour, and the petal counts them | Lesson 9 | every Sky Isles and Muddle Isles story |
| **Word Detective** | A long word the child already reads. "Which part might be hard to spell?" The child taps the syllable, then the spelling in it; the lens shows two or three easy words with the same spelling (*happy*: *silly, funny, daddy*). Then the word vanishes and the child builds it by syllables | Lesson 15 | the Muddle Isles and the Library |
| **Speed Read, with a grown-up** | 20 words in 30 seconds, read aloud to a grown-up who taps ✓ or ✗ on each. The result goes on the grown-ups' page. It is the only timed reading game, and a grown-up starts it from their page | SpeedRead ("20 words read correctly in 30 seconds") | Year 2, optional |

**[R2: F9] Alien audio.** An alien word's slow word is spliced from the checked pure sounds (free and exact). Its blended word is a TTS clip that needs its own gate, like the pure sounds, because Gemini normalises nonsense words (*vap* becomes "vape"): the gate checks that the clip's sounds match the word's, then Jonas listens to a sample. About 240 alien words in all (§4.4).

**[R2: SY9] Stories are the plot's chapters.** From the Sky Isles, each land has two stories of 150–400 words, decodable at one unit behind, with Seek the Sound on two pages and questions answered from the text (not a self-declared "I read it!"):
- **Chapter 1**, near the land's start, says what the guardian did (the Thunderbird's storm; the Gnome King's burrows).
- **Chapter 2** is dropped by the guardian when it flees the skirmish (§1.7.1) and is read before the Dictation Scroll: it says where the chest is hidden.
- **The boss drops the next land's chapter 1** (audit §11.5: "a boss drops a story, not a sticker").
- The final battle's letter quotes chapters the child has read.

That is SOUNDS_WRITE_MODEL §6.1's quota of one story per sound unit, halved for version 1 (M20).

---

## 4. Content: words, pictures and audio for Years 1 and 2

### 4.1 What exists, and what is needed

Counts come from `playtest/runs/midgame/quota-gap.txt` (read-only: each Extended Code unit's `contentQuota()` in sw.ts against its unit file, unit by unit), the audit's `ec-stats-all.txt` and `audio-cover.txt`, and the feasibility judge's asset table. The quota is SOUNDS_WRITE_MODEL §6.2's: a sound unit needs max(30, 8 × spellings) words and max(12, 3 × spellings) pictures, 10 long words from EC4, and 8 sentences.

| | Exists | Needed for Years 1–2 | Notes |
|---|---|---|---|
| **Unit words** (one syllable) | 693 Year 1 entries, 581 Year 2, all with word audio | **at least 135 more for Year 1 (and about 12 for the check's additions: *chief, thief, mould, soul, phone, graph*), 387 for Year 2** | a floor: several units count filler words that don't use their unit's spellings (EC33 lists *stand* and *train*). The biggest gaps are EC43 /or/ (23 of 96), EC36 /oo/ (13 of 64), EC34 /er/ (19 of 64), EC48 /z/, EC21 /ue/ and EC31 < y > (5 of 32) |
| **Word pictures** | 247 (Year 1 units), 254 (Year 2) | **at least 99 more for Year 1, 179 for Year 2**, and about 80 for Sound Twins (40 pairs, a picture per meaning) | one unambiguous thing, no text (validator rule 13) |
| **Long words** | 180 distinct, syllables only, **none with sounds** | **[R2: SW3, SW4]** about **150 for Year 1, 150 for Year 2, 80 for the Library**, all with `segs` per syllable, following the official checks' own words, with the endings and suffixes as syllables and the days of the week | the files repeat filler (*lesson* in 30 unit files); curate per land (§4.2) |
| **Long-word pictures** | 4 (*rainbow*, *snowman*, *insect*, *astronaut*) | about 100 (the concrete ones: *sunset, dentist, window, magician, television*) | abstract words (*division, addition*) have no picture: the egg shows a sparkle |
| **Dictation sentences** | 370, of which 131 use code taught after their `maxUnit` (audit §12) | about 190: rewrite the 131, write about 60 more; the bosses' last-word sentences (at most five words) | each checked by the validator's `decodable` rule at two sound units behind |
| **Story chapters** | 6 (one per land, to the Sky Temple) | **[R2: SY9] 24**: two chapters per Year 1 and Year 2 land, 150–400 words each, 4–6 pictures each | one unit behind; Seek the Sound and questions (§3.8) |
| **Special words** | about 10 recorded ("This is 'the'…") | the National Curriculum's Year 1 and 2 common exception words (about 110), each tagged with its untaught part and the unit that teaches it (§4.2) | most have word audio already |
| **Sound Detective try-clips** | MULTI_SOUND §3.6's plan for < ea > | about 10 per spelling unit (11 units, and < ch >) | `try_<word>_<p>` |
| **[R2: F9] Alien words** | none | a closed list of about 240 (about 120 per stage), grouped by unit | §3.8 |

### 4.2 The word bank, land by land

For each land: the unit words to add, the pictures, the curated long words (the official checks' kind of word, §1.2), and the special words. A **special word** here is a National Curriculum common exception word whose code the land teaches: it has been a Ninja Vanish word until now (in stories, sentences and the weekly lists), and in this land it becomes an ordinary word, with Sensei's one line ("You know the word *said*. Now you know its spelling too."). **[R2: SW-s6]** A word graduates only when its **last** untaught part is taught.

**Year 1: the Sky Isles**

| Land | Unit words to add (at least) | Pictures to add | Long words (about 20 per land, examples) | Special words that graduate here |
|---|---|---|---|---|
| Sky Temple (EC1–5) | 1, and about 12 for the check's additions (*chief, thief, mould, soul, phone, graph*) | 4, and 4 | steps 1–2: *sunset, zigzag, cobweb, upset, dentist, hotdog* | *today, great, break* (EC1; *they*'s < ey > is pointed out here and taught in EC27); *be, he, me, she, we* (EC2); *no, go, so, old, cold, told, most, both* (EC4) |
| Cloud Town (EC6–9) | 7, and the /oy/ words met early (*coin, boy, toy*, from EC23's list) | 13 | steps 3–6: *chopstick, splendid, fantastic, lemon*; EC1–2: *daybreak, painting, Sunday*; **[R2: SW4]** endings as syllables: *jumping, thicker, sister, unlock, unpack* | *were* (EC6); *said, says, friend, again, any, many* (EC7, as Sounds~Write's high-frequency chart maps them); *our, house* (EC8) |
| Moon Marsh (EC10–13) | 26, and *you* | 27 | EC1–7: *window, slowly, ready, rainbow, reading*; *Friday*; *helping, quickest* | *do, to, you* (EC10, with < ou > for *you* as the check's addition); *I, my, by, find, kind, child* (EC11); *put, push, pull, full, could, should, would* (EC12) |
| Circus Island (EC14–18) | 10, plus 16 two-syllable /l/ words: *camel, pencil, medal, pupil, petrol, tunnel* (EC18 has none today, SW §9.4); and the tangential words (*chef, lunch, gem, cell, hens*) | 6, plus 8 for the /l/ words | EC8–11: *about, flower, myself, outside, tonight*; *Monday, Thursday*; -s and -es: *dishes, buses, wishes* | *love, come, some, one, once, mother* (EC14); *is, his, has* (EC17); **[R2: SW-s6]** *school* (its < ch > as /k/ is taught tangentially here, for the check). *money* waits for EC29 (< ey >) |
| Autumn Orchard (EC19–22) | 70 | 37 | EC12–16: *sometimes, mother, sentence, cooking, football*; spelling EC18's /l/ words: *pencil, travel, camel*; *Saturday* | *door, floor, poor, water* (EC19); *there, where* (EC20). **[R2: SW-s6]** *your* waits for EC43 (< our >) |
| Star Dunes (EC23–26) | 21, and < sc > (*scene, science*) | 12 | EC18–20 (the end-of-Year-1 kind): *level, report, nightmare, airport, footprint*; *Tuesday, Wednesday* | *are, father, half* (EC24; *ask, fast, path* only where the child's accent says /ar/); *was* (EC25) |

**Year 2: the Muddle Isles**

| Land | Unit words to add (at least) | Pictures to add | Long words (examples) | Special words that graduate here |
|---|---|---|---|---|
| Echo Island (EC27–31) | 71 | 35 | EC19–23: *staircase, author, water, airline*; -ed where it is a syllable: *waited, landed, wanted* | *they* (EC27; pointed out, not taught, in the Sky Temple); *pretty, busy* (EC30); *people* (EC29, tangential); **[R2: SW-s6]** *money* (EC29) |
| Gnome Hollow (EC32–34) | 70 | 29 | EC25–29: *holiday, decorate, champion*; EC34's two-syllable words: *dollar, favour, litre, collar*; **[R2: SW4]** *payment, useful, careful* | none new (*most, only, both, old* came with EC4) |
| Giant's Gorge (EC35–39) | 95 | 39 | EC28–30: *radio, symbol, multiply, piano*; *illness, grateful, helpless* | *of* (EC35); *move, prove, improve* (EC36). **[R2: SW-s6]** *who* is listed once, at Roaring Peaks |
| Dolphin Bay (EC40–42) | 13 | 10 | EC33–36: *routine, similar, kneecap*; the first four-syllable word: *absolutely* | *climb* (EC42) |
| Roaring Peaks (EC43–45) | 83 | 40 | EC37–40: *submerge, laughter, photograph*; *slowly, happily*; ***station, motion, fiction, section, lotion, potion*** | **[R2: SW-s6]** *your, four* (EC43); *whole, who* (EC44); *Christmas* (EC45) |
| Muddle Castle (EC46–49) | 55 | 26 | EC43–45: *mechanic, character, chemistry, automatic*; **[R2: SW4]** /zh/ spelt < s >: *treasure, usual*; *television* (read); the maths words *addition, subtraction*, and *multiplication* (read; spelt as the encore) | *here* (EC49) |

**Never ordinary** (always Ninja Vanish, or long-word lessons with the spelling voice, SW §6): *the, a*; *sure, sugar* (< s > as /sh/ has no unit); *hour, beautiful*; *children, every, everybody, parents, Mr, Mrs*.

**The long-word lists follow four rules** (SW §3.1–3.3, §3.5, §9.4):
1. **[R2: SW3] The official checks' own words and lags.** Initial Code words (the Handbook's steps 1–6) up to about Cloud Town, then code 4–7 units behind the land's own, except Units 18, 34 and 35, whose spellings only exist in long words.
2. **Sounds~Write's splits.** Start a syllable with a consonant where possible, keep a double spelling whole at the start of the next syllable (*ha·ppy, bo·ttle, ye·llow*), never cut a spelling in two. The 18 splits that differ from the official ones and the 5 that cut a spelling in two (SW §9.4: *bot|tle, rot|ten, hap|pi|ly, but|ter|fly, to|mor|row*) are fixed.
3. **[R2: SW4] Endings are syllables, not rules.** -ing, -er, -est, -s and -es and un- from Cloud Town (Sounds~Write's checks use *reading, warmer, unhook*); -ment, -ness, -ful, -less and -ly in the Muddle Isles; -ed where it is a syllable (*waited*). The days of the week arrive as their code does.
4. **No filler.** A word appears in one land's list only (*lesson* is in 30 unit files today). The land's list is what its Syllable Dragon stones, its boss's big attack and its challenges draw from.

### 4.3 The "shun" family, exactly as Sounds~Write codes it

Sounds are per syllable, and a spelling's sound is in brackets where it helps. ə is schwa. **Weak** marks the syllables whose vowel is weak in the talking voice; the tortoise says them in the spelling voice. The "shun" ending is < ti > (or < ci >, < si >, < ssi >) + < o > (or < a >) + < n >: /sh/ ə /n/ (SW §4.1–4.2). Whether Sounds~Write teaches a spelling-voice form of "shun" isn't public (SW §10, question 3), so **Decision:** the ending is always said as it is spoken, "shun", and the gold bracket carries the idea.

| Word | Syllables | Spellings (sounds) | Sounds | Weak | When (National Curriculum) | In the game | Picture | Audio |
|---|---|---|---|---|---|---|---|---|
| station | sta·tion | s t a(ae) \| ti(sh) o(ə) n | 6 | tion | Year 2 | Roaring Peaks: the first special ending; the Roaring Boar's roar | yes (a railway station) | new |
| motion | mo·tion | m o(oe) \| ti(sh) o(ə) n | 5 | tion | Year 2 | Roaring Peaks | – | new |
| lotion | lo·tion | l o(oe) \| ti(sh) o(ə) n | 5 | tion | Year 2 | Roaring Peaks | yes (a bottle) | new |
| potion | po·tion | p o(oe) \| ti(sh) o(ə) n | 5 | tion | Year 2 | Roaring Peaks | yes (a bubbling potion) | new |
| fiction | fic·tion | f i c(k) \| ti(sh) o(ə) n | 6 | tion | Year 2 | Roaring Peaks | – | new |
| section | sec·tion | s e c(k) \| ti(sh) o(ə) n | 6 | tion | Year 2 | Roaring Peaks | – | new |
| location | lo·ca·tion | l o(oe) \| c(k) a(ae) \| ti(sh) o(ə) n | 7 | tion | Year 2 | Muddle Castle | – | exists |
| addition | a·ddi·tion | a \| dd i \| ti(sh) o(ə) n | 6 | a, tion | Year 2 | Muddle Castle: the maths words | – | new |
| subtraction | sub·trac·tion | s u b \| t r a c(k) \| ti(sh) o(ə) n | 10 | tion | Year 2 | Muddle Castle: the maths words | – | new |
| multiplication | mul·ti·pli·ca·tion | m u l \| t i \| p l i \| c(k) a(ae) \| ti(sh) o(ə) n | 13 | ti, pli, tion | Year 2 (-tion); Years 3–4 (-ation) | read in Muddle Castle; spelt as the final battle's encore; the Shun Wing | – | exists |
| information | in·for·ma·tion | i n \| f or \| m a(ae) \| ti(sh) o(ə) n | 9 | for, tion | Years 3–4 | the Shun Wing | – | new |
| mission | mi·ssion | m i \| ssi(sh) o(ə) n | 5 | ssion | Years 3–4 | the Shun Wing | – | new |
| permission | per·mi·ssion | p er \| m i \| ssi(sh) o(ə) n | 7 | per, ssion | Years 3–4 | the Shun Wing | – | new |
| discussion | dis·cu·ssion | d i s \| c(k) u \| ssi(sh) o(ə) n | 8 | ssion | Years 3–4 | the Shun Wing (the root clue: *discuss*) | – | new |
| tension | ten·sion | t e n \| si(sh) o(ə) n | 6 | sion | Years 3–4 | the Shun Wing | – | new |
| magician | ma·gi·cian | m a \| g(j) i \| ci(sh) a(ə) n | 7 | ma, cian | Years 3–4 | the Magic Wing's first word (the root clue: *magic*) | yes | new |
| optician | op·ti·cian | o p \| t i \| ci(sh) a(ə) n | 7 | cian | Years 3–4 | the Magic Wing (linked to *magician* by Lesson 15) | yes (an optician and glasses) | new |
| musician | mu·si·cian | m u(ue) \| s(z) i \| ci(sh) a(ə) n | 7 | cian | Years 3–4 | the Magic Wing (the root clue: *music*) | yes | exists (fix its schwa flag: *mu* is /ue/, not schwa) |
| electrician | e·lec·tri·cian | e \| l e c(k) \| t r i \| ci(sh) a(ə) n | 10 | cian | Years 3–4 | the Magic Wing (the root clue: *electric*) | yes | new |
| division | di·vi·sion | d i \| v i \| si(zh) o(ə) n | 7 | di, sion | Years 3–4 (/zh/ as s is Year 2) | read in Muddle Castle; spelt in the Treasure Wing (linked to *television* by Lesson 15) | – | new |
| television | te·le·vi·sion | t e \| l e \| v i \| si(zh) o(ə) n | 9 | le, sion | Year 2 example word | read in Muddle Castle; spelt in the Treasure Wing | yes | new |
| decision | de·ci·sion | d e \| c(s) i \| si(zh) o(ə) n | 7 | de, sion | Years 3–4 | the Treasure Wing | – | new |
| treasure | trea·sure | t r ea(e) \| s(zh) ure(ə) | 5 | sure | Year 2 (/zh/ as s) | spelt in Muddle Castle; the /zh/ petal's own picture is a treasure chest | yes | new |
| usual | u·su·al | u(ue) \| s(zh) u(oo) \| a(ə) l | 5 | al | Year 2 (/zh/ as s) | spelt in Muddle Castle | – | new |
| measure | mea·sure | m ea(e) \| s(zh) ure(ə) | 4 | sure | Years 3–4 | the Treasure Wing | – | new |
| picture | pic·ture | p i c(k) \| t(ch) ure(ə) | 5 | ture | Years 3–4; read from Year 1 | the Treasure Wing | yes | exists |
| nature | na·ture | n a(ae) \| t(ch) ure(ə) | 4 | ture | Years 3–4 | the Treasure Wing | – | new |
| adventure | ad·ven·ture | a d \| v e n \| t(ch) ure(ə) | 7 | ture | Years 3–4 | the Treasure Wing | – | new |
| special | spe·cial | s p e \| ci(sh) a(ə) l | 6 | cial | Years 5–6 (-cial) | a Ninja Vanish word when met earlier | – | new |
| multiply | mul·ti·ply | m u l \| t i \| p l y(ie) | 8 | ti | Year 2 (official check 26) | Giant's Gorge: the top of the beanstalk | – | exists |

**[R2: SW7] The root clue** (§3.3, the Library) is only for the endings where the root really predicts the spelling: -cian after a root ending in < c > (*magic → magician*, *music → musician*, *electric → electrician*) and -ssion after < ss > (*discuss → discussion*). -tion is "the ending most words use" and has no root clue; *optician* joins *magician*, and *division* joins *television* and *decision*, through Lesson 15's "the same spelling of that sound". The maths words (*addition, subtraction, multiplication, division*) are why Year 2 parents care: they are the names of the four operations.

**What the World Flower gains.** < ti ci si ssi > as gems of the /sh/ petal; < si > and < s > of /zh/; < t > of /ch/ (the -ture words); < o >, < a > and < ure > as schwa gems. These are the golden bloom's gems (§5.3).

### 4.4 [R2: F7, F8, F9, F14] Audio and art, in numbers

Reconciled with SPEECH_TEMPLATES and the feasibility judge's asset table (`judge-feasible.md` §4). Money and render time are not the constraint; **review time and Jonas's ear are**, so every row says who gates it.

| Kind | New | How | Who gates it |
|---|---:|---|---|
| Unit words (talking voice) | about 520 | the word pipeline, with the accent gate | Jonas samples |
| Long words (talking voice) | about 200 (180 exist) | the same | the same |
| Slow words | about 900 (units and long words) | `gen-slow-words.ts`: spliced from the checked pure sounds, no TTS | `--measure` |
| **Spelling voice** | **about 380 takes**, one per long word (not 600 isolated syllables) | a new kind: one take with pauses, cut at the silences into `SYLL_TIMES` (§3.0.2) | the pause count, the judge, **Jonas's ear on 20 words** |
| Sentences, story pages, try-clips | about 190, 150 and 120 | the line, story and MULTI_SOUND pipelines | the judge, then spot checks |
| Sensei's fixed lines | about 250 | the teacher-voice pipeline, TEACHER_SCRIPT §2 | the judge |
| **Template clips** | **about 2,800**: long words × 3 templates (about 1,100), `ws_gem_we_need` over about 1,300 Extended Code words, about 60 homophone sentences, about 300 others | `gen-templates.ts`, with SPT's fluency gate; about 2.5 hours and $3 | SPT's gates; Jonas at the pilot. The risk is SPT's open risk 1: the fluency of templates that talk *about* a word |
| **Alien words** | about 240 (a closed list) | slow words spliced; the blended word by TTS | a new gate, like the pure sounds; **Jonas's ear** |
| Boss voices | version 1: none (captions and growls); the Baron's new lines in his own voice (about 20) | the Baron's voice (Algenib) | Jonas; casting other bosses comes later, if wanted |
| **All new TTS clips** | **about 5,500–6,000** | 3–5 hours of rendering, under $10 (doubling after 31 December) | |
| Hosting | about 6,000 more files, about 50 MB at 24 kHz / 48 kbps | Workers static assets: SPT's programme (about 27k) plus 6k is about 33k of 100k | the deploy gate at 80k |

| Art | New | Notes |
|---|---:|---|
| Word pictures | about 380 (99 Year 1, 179 Year 2, about 20 for the check's additions, about 80 for Sound Twins) | `gen-art.ts`, 8 in parallel, then `post-art.py`; the pic-audit bot |
| Long-word pictures | about 100 | the same |
| Story pictures | about 120 (24 chapters × 4–6) | the story art pipeline |
| Bosses | **[R3: Jonas, Baron final only]** 12 sprites (version 1: one each; poses by transform and tint): the Sand Shark is new, where revision 2 reused the Baron at Star Dunes. The Sky Magpie is drawn (`public/a/i/mon_boss_magpie.webp`, for the interim swap) | refs from the Baron's sheet; **Jonas** approves each |
| The Word Dragon | one modular dragon (head, segment, tail) and an egg, reused for every long word; the Library's four dragons, the Great Book Dragon drawn fresh | |
| Monsters | about 24 (the guardians' minions) | with reuse |
| Backgrounds, maps, props | 13 land and 13 run backgrounds; 3 overworld paintings and the Atlas; about 15 props (the bridges, the balloon, the Petal Ship, the imp's lair) | 1376 × 768 each; the Atlas at most 2752 × 1536 (§1.8) |
| **All pictures** | **about 700** | about 1–2 hours of generation, a few dollars; **about 4 hours of human review** |

### 4.5 Data changes (for whoever wires it in)

- **[R2: F1] Levels get their Sounds~Write units, and the scenes one word source.** `Level.sw: SwUnitId[]` beside the legacy `units`, and one word source over `units/*.ts` (IC, BR, EC1–49, PW1–9) for the scenes, which today read only `phonics.ts` (411 words in legacy units 1–12). `knownSpellings()`, `levelWords()`, `startFor()`, `MILESTONES`, `makeReview()` and `flower.ts`'s `Gem.unit` move to it.
- **[R2: F1] Worlds get stable keys.** `world_${w.id}` lines (`App.tsx`, `narrative.ts`), `WORLDS[l.world - 1]` and `L(world, n)` ids are all positional, so inserting the Garden and the Rainbow Bridge would renumber every land. Each world gets a string key (`bamboo`, `blossom`, `misty`, `dragon`, `shadow`, `rainbow`, `sky_temple`, `cloud_town`, …), lines key by it, level ids stay append-only, and the order of lands is an explicit list.
- **Long words get sounds.** `poly` entries gain per-syllable `segs` in the unit files' notation, with `|` between syllables: `{ text: "magician", syllables: "ma|gi|cian", segs: "m.a|g=j.i|ci=sh.a=schwa.n", schwa: [0, 2], ending: "cian", root: "magic" }`. `PolyItem` in sw.ts already expects `segs` per syllable.
- **[R2: F1] `GRAPHEMES` and `parseWord` grow step by step**, slice by slice, towards the 174 official pairs (SOUNDS_WRITE_MODEL §7), plus the special-ending spellings (< ti ci si ssi > as /sh/, < si s > as /zh/, < t > as /ch/ before < ure >) and the schwa spellings of the long words. Explicit `g=p` segs (`ti=sh`) already parse, so nothing waits for the whole table.
- **The syllable splits and schwa flags** are fixed to Sounds~Write's (SW §9.4).
- **EC18** gets its < al el il ol > words, all two-syllable.
- **`flower.ts`** drops its split spellings (< a-e > and friends, against the 2024 guidance: audit §12), gains the consonant + e gems (< te ke me … > as gems of their consonants' petals) and the special-ending gems, and recounts. The grown-ups' "46 of 46" becomes the whole programme's count (audit §10.1).
- **[R2: SW1] The check's additions** come from `PSC_ADJUSTMENTS` and `TANGENTIAL_TEACHING` in sw.ts, which already hold them; the planner reads them (§6.3 item 11).
- **[R2: F9] The alien words** are a closed list in a content file, by unit, with their segmentations.
- **[R2: F10] The word bank for weekly lists** is a `words.json` built at build time from the unit files and `phonics.ts`: each word's text, `segs`, and audio and picture flags. New words arrive in reviewed batches with a normal deploy (§1.9.7).

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

- **[R2: SY2] A stripe is always sewn at the boss**: in colour at the land's pass mark (75% of first tries in the boss check, §2.3), and in **silver thread** below it. The lair turns silver thread to colour. The child who most needs the win never walks away without it.
- **A school starter's earlier belts are stitched in silver**: assumed, not yet shown. The stitching turns to colour when that map's ghost petals are all home. So silver always means one thing, "not shown yet", never "failed", and placement is visible, and so is proof.
- **Polish, never take away.** If review of a belt's code lapses (its KCs fall due and are missed), the belt looks dusty on the child's ninja, and Sensei offers a polish round: "Your green belt needs a polish. Shall we?" It is a Sensei's Challenge on that code. A belt is never removed.
- **A printable certificate** for each belt, with real words from the ledger ("Green belt: can read *night, moon, book* and spell *light, spoon, boat*"). Children take it to school, which is Times Tables Rock Stars' best loop (prior-art §2.13).

### 5.2 [R2: SY6, N1, F12] The Word Scroll: Word Dragons to collect

From the Sky Isles on, long words are the collection. Stickers stay for Reception.
- Each long word the child builds hatches a **Word Dragon card** in their Word Scroll: a small dragon with one segment per syllable, curled round the word, with its picture if it has one.
- **Rarity is length and spelling:** two syllables are common, three uncommon, four rare, five epic, and special endings legendary. *Multiplication* is legendary.
- **Cards grow with the word's rung** (§3.0.3): an egg (met), a hatchling (built), a young dragon (spelt from memory), a master (spelt from memory on two more days). Only first-try independent spelling grows a card: never time, never a purchase, never a guess (Squeebles keeps its word searches out of its rewards for the same reason, prior-art §2.6). Eggs hatching on a second day are one of the daily reasons to come back.
- **A card is also practice.** Tapping it starts a four-word Syllable Dragon with that word and three others due for review, as Sound Detective's gate does.
- **Within the PERF budgets:** the scroll shows at most 24 cards a page, as still images, with no endless animations; a hatching plays once, on the reward.
- The grown-ups' page counts it honestly: "Maya's scroll: 64 long words; 18 of three syllables or more; 5 masters."

### 5.3 The World Flower as the long goal

- **This year's flower.** The flower screen gets a view of the current map's petals and gems: a Year 1 child sees EC1–26's gems (and the check's additions) as the set to find, and "complete" means complete for this map. The whole flower is one tap away.
- **Full bloom** at the end of Year 2 (every petal and every common gem), **the golden bloom** in the Library (< ti ci si ssi >, < t > in -ture, schwa's spellings, and the last rare gems). The finale shows only what is true: no "full bloom" until it is.
- **Ghost petals** (§1.5) make a school starter's flower full of promise from day one, and every gem that comes home is a small event. **[R2: F12]** They are still outlines; only the flight home moves.

### 5.4 Coming back each day

- **[R2: SY1, N5] The bridge.** One plank a practice day, never taken away (§1.7.1). The next land is always visibly closer.
- **The dojo calendar.** A stamp for each day played, a gold stamp for the day's scroll or ten minutes of play. Stamps unlock cosmetic things: dojo decorations, a new ninja outfit every ten stamps, plants in Sensei's Garden. A missed day leaves an empty square, never a broken flame (Brain Age and NumBots, prior-art §2.11, §2.13).
- **The weekly scroll** (§1.9) is the most useful daily habit for a school child, because it is their own school's words. **[R2: N4]** It lights the ninja's headband for the day's battles, and a perfect practice test earns a charm for the next boss.
- **Sensei's Challenge** is the planner's daily review: 3–4 minutes of the child's due words, with rival spellings, drawn from the whole chart.
- **[R2: SY1] A boss-shaped moment about once a week**: the guardian's skirmish, the boss, the lair, a rematch or a minion raid (§1.7.1).
- **The combo streak** (the tiers and finishers inside a level) stays as it is. It is one of the things the audit found children like.

### 5.5 Reasons to replay

- **Boss rematches** at a harder rung, for a gold crown (§2.3).
- **[R2: N3] Flawless wins**: a boss beaten with no help gets a golden finisher and a gold portrait at once.
- **Guardian challenges** for any land with ghost petals (§1.6.2).
- **New ninja moves per idea:** the dragon call (the first Syllable Dragon), the gem flip (the first spelling choice), the lens throw (the first Sound Detective). They are used in every later game, so the ninja visibly grows with what the child knows.
- **[R2: N6] The alien crew**: each alien read right joins the child's crew, named with its own alien word.
- **The Library,** which renews: its words come from the whole word bank, the weekly lists and subject words, and its Word Dragons are always new.

### 5.6 What we won't do

No purchases, adverts or leaderboards. No timer the child didn't choose (only Gem Trials and the grown-up's Speed Read are timed). No reward for a word finished with help. No card, stripe or gem that can be earned by repetition alone. No long placement test: the first check is three items, and everything else is collected in play. **[R2: SY1]** No gate that counts down or can go backwards: the bridge only grows.

---

## 6. What changes in today's game, and what the planner needs

### 6.1 Today's worlds and levels

Level ids never change (saves keep stars by id), so levels keep their ids when they move between lands. **[R2: F1]** Worlds get stable string keys and an explicit order (§4.5), so inserting the Garden and the Rainbow Bridge renumbers nothing.

| Land today | What changes |
|---|---|
| Bamboo Village | The warm-ups (`w1-wu1`…`w1-wu6`) move to Sensei's Garden. The land starts at `w1-2`. The panda gets its phases (§2.5.1) |
| Blossom Hills | A Dictation Scroll stone (short sentences, from IC2 code). The Oni's mirror trick |
| Misty Mountains | The Yeti's freeze |
| Dragon River | Nonsense words in Sound Swap from IC9, insert and delete steps (SOUNDS_WRITE_MODEL §4). The Serpent's gobble |
| Shadow Castle | The Knight's shield split |
| **Rainbow Bridge** (new world, between Shadow Castle and the Sky Temple) | `w6-br1` and `w6-br2` (the /k/ and /ch/ sorts) move here, plus /w/ (< w wh >) and /v/ (< v ve >), which the Bridging Unit has and the game doesn't. A battle with the first rival spellings, a story, and the Bridge Troll |
| **Sky Temple** | Becomes EC1–5 in full: `w6-1` teaches < ai ay a ea > and the consonant + e tiles (< te me ke le pe >, so *cake* and *game* at last); `w6-3` < ee ea e y > **[R2: SW1]** and < ie > (*chief*); `w6-6` < o oa ow oe > and < ou > (*mould*) and < ph > (*phone*). New stones: two Initial Code review stones at the start, Sound Detective < ea > (`w6-sd-ea`, MULTI_SOUND §5) and < o >, the first Syllable Dragon (`w6-syl1`), a Gem Choice stone per sound unit, a Dictation Scroll, two story chapters and the Magpie's skirmish. `w6-ec11` and `w6-7` (< igh ie >) move to Moon Marsh, where EC11 is. `w6-11` keeps its id and becomes the Sky Magpie's fight. "The Last Petal" (story s6) moves to Muddle Castle. **[R3: Jonas, Baron final only]** Before any of this, the interim swap (fix-requests.md) makes `w6-11` the Sky Magpie with today's boss kit, and changes "The Last Petal"'s last page so it sets her up |
| The Baron | **[R2: SY5]** introduces every guardian. **[R3: Jonas, Baron final only]** He fights **only** at Muddle Castle (the final battle), with the hardest words; never at the Sky Temple or Star Dunes. `boss_baron` stays in `MONSTER_INFO` for it |
| The finale | plays once, after the final battle. **Until the Muddle Isles exist,** the last built land's boss ends honestly: the Baron escapes (superseded by R3: "Catch me if you can, little ninja!"), and the map says more lands are coming. That replaces the loop at once (audit §11.1 E). **[R3: Jonas, Baron final only]** Specified as the interim swap: after the Sky Magpie the Baron escapes in his balloon ("Catch me if you can, little ninja!"), and the finale is gated by `FINALE_LEVEL` (null until Muddle Castle) instead of "the last level" |
| **[R2: SY5]** Old saves' story | A save that saw today's finale gets the once-only "It was a trick!" scene (§2.2) on its next map arrival, **[R3: Jonas, Baron final only]** from the interim swap, or on its first win against the Sky Magpie, whichever comes first |
| Old saves' stones | A child who finished today's Sky Temple sees its new stones appear on a land they had finished: `tv_new_stones` "Look! New stones have appeared in the Sky Temple." once, and the glowing stone points at the first of them. Stars are kept |

### 6.2 [R2: F1, F16] Code, by file, lane and slice

The slices are defined in [midgame/BUILD_PLAN.md](midgame/BUILD_PLAN.md). "Lane" is the owner in FIX_PLAN_PERF_SCRIPT_SOUNDS.md §2 while the big fix runs; after it, the midgame lanes in BUILD_PLAN §2 take over. Other workflows edit several of these files today, so every change waits for its lane to be free.

| Where | Lane today | Change | Slice |
|---|---|---|---|
| **new** `src/scenes/Dragon.tsx`, `src/ui/CarriageRow.tsx` | – (new files) | the Syllable Dragon and the shared carriage row (§3.0.1, §3.1); `rowFit()` moves out of `Battle.tsx` into `ui.tsx` | 1a |
| `src/ui/ReadSlider.tsx` | follow-up (read slider wiring) | `RAIL` as a parameter of `geoFor()`; syllable stops; `"words"`-mode items with text plates | 1a |
| `src/content/worlds.ts` | – | the `"dragon"` `LevelKind` and `w6-syl1`; the Magpie's phases for `w6-11` | 1a, 1b |
| `src/content/longwords.ts` (new) | – | the first long words with per-syllable `segs` (PW1 compounds, the "shun" four) | 1a |
| `src/engine/learner.ts` | – | `tileBank()`: rivals bounded by `rowFit()`, in confusion order, with the lags (§3.2) | 1b (Initial Code and Bridging rivals); 2 (the rest) |
| `src/scenes/Battle.tsx` | D2 | the `same_sound_spelling` branch; boss phases from the kit, the segmented bar, the perch, per-phase audio warming, the imp's grab on help; `maxLen` gone for long words | 1b |
| `src/App.tsx` | B1 | the end-loop fix and `isFinale` (audit §2.4); the "It was a trick!" scene; the glowing spur slot's `kind`; later the overworld maps, the Atlas, the journeys, the school welcome, the bridge | 1b, 4 |
| `src/content/worlds.ts`, `phonics.ts`, `learner.ts`, `flower.ts`, `gems.ts`, `progress.ts`, `App.tsx` | several | **the content model**: `Level.sw`, one word source over `units/*.ts`, `GRAPHEMES` grown step by step, stable world keys | **0** |
| `src/core/**` | F2 (SF Part E) | the ledger with rungs and per-word summaries in the save (bounded); later `catchUp()`, `bossCheck()`, the pacing, `pinned` lists | 0 (ledger), 3, 4 |
| `src/scenes/Dojo.tsx` | D1 | **[R2: SW10]** the Lesson 6 word puzzle from the word's own tiles, with the gem flying to its column; the fan from the Lesson 7 step | 2 |
| new scenes | – | Gem Choice (a Dojo mode or its own scene), Sound Detective (MULTI_SOUND §8), the Dictation Scroll (the carriage row's scroll skin), Ninja Vanish, Muddled Notes, Sound Twins, Alien Words (a Kai and Suki variant) | 2, 3, later |
| `src/content/flower.ts`, `progress.ts` | F3 (read-mostly) | ghost petals (still), the map view, the golden bloom, split spellings gone (§4.5) | 4 |
| `src/scenes/Grownups.tsx` | A | the "Year 2 preview" card; later the pace setting, the catch-up card, check results, the list confirmation | 1a, 2, 3, 4 |
| the save (`store.ts`) | F1 | `weekList`, rungs, lairs, belts and stitching, stamps, story state (`trickSeen`; **[R3: Jonas, Baron final only]** no `baronRound`, since the Baron is fought once; the interim swap uses the narration ledger's `story:trick`), bridge planks; bounded (§6.3 item 12) | 0 onwards |
| `src/main.tsx` | – | `?list=` parsed into a pending list (§1.9.8) | hooks with 1b; the list in 3 |
| content | – | EC27–49 and PW1–9 imported into `unit-data.ts`; long words with `segs`; `words.json`; the alien list | 0, then per land |
| scripts | F4 for the treadmill | spelling-voice takes cut into `SYLL_TIMES` (like `gen-slow-words.ts`); the alien-word gate; the treadmill's new personas, sweeps and audits (PLAYTEST_PLAN) | 1a onwards |

### 6.3 What the planner and the learner model need

The core (`src/core`, [ARCHITECTURE.md](ARCHITECTURE.md), [architecture/planner.md](architecture/planner.md)) is designed but not yet wired into the scenes, and **[R2: F1]** it has no planner yet (types and config only). Everything from §1.5 on (assumed knowledge, catch-up doors, ghost petals coming home, rungs, belts, the weekly list) needs the ledger and a planner, so they come after Slice 0 (BUILD_PLAN). This design adds:

1. **The whole curriculum.** `unit-data.ts` imports EC27–49 and PW1–9 (it stops at EC26 today). Long words carry `segs`, `ending` and `root`.
2. **New knowledge components (KCs).**
   - `word:<w>` with its **rung** and the day's first try (§3.0.3), in the ledger;
   - `poly:<w>:split` (the syllable count and split chosen) and `mech:syllable-level` (whether this child works at Lesson 13–14 level);
   - `ending:<tion|cian|sion|ssion|ture|sure>`;
   - `schwa:<spelling>` for the weak syllables;
   - the existing `gpc:<g>><p>:read|spell` for everything else, including < ti ci si ssi >.
3. **Assumed knowledge.** `ledger.assumed = { units, since, source: "school-start" | "jump" }`. Assumed code counts as taught for the hard constraints (it may appear in words and on the bank), and its KCs start from a prior (pKnown 0.7, a config default), not evidence. The collection rule (two independent first tries with no miss between, §1.6) writes a `collected` event that the flower and the grown-ups' page read.
4. **`catchUp(ctx)`**, a new planner function. It returns at most one catch-up request: a door (for an assumed KC with a lapse, or a confusion pair), found through `firstTaught(kc)` and the authored level that teaches it, cut to its teaching games; or a lair (for gems the imp grabbed). It applies §1.6's caps, and the "Catch up first" setting.
5. **[R2: SW2] `bossCheck(land, ctx)`**, which composes a boss from the check rules (§2.3.1), counting back from the land's check unit U: reading code up to U; dictation code at least two sound units before U, with the bounded R4 bank; long words 4–7 back; one sentence of at most five words at the dictation lag; the land's authored signature items (checked against the same rules); the child's weak KCs weighted in; item counts by map. It returns the phases, their warm lists (§2.3.3), and the gems the imp grabbed.
6. **The scaffold** gains `rivals` (0 before the Rainbow Bridge; from the word's rung; chosen by confusion, then frequency; only for spellings at least four units back in ordinary battles; always bounded by `rowFit()`) and `peek` (rung R2).
7. **[R2: SY1] Pacing by land and map.** Two paces (§1.7.1). "In step with school" opens units from `PACING` and the date; "Own pace" opens the next land when its boss is beaten and its bridge has its planks. Both cap new stones at three a day (two teaching). `pacing` emits `game.progress land-done` (with the pass mark and the grabbed gems) and `game.progress plank` for the director; the planner schedules the guardian's skirmish at the land's halfway stone and a minion raid when seven days pass without a boss-shaped moment.
8. **The weekly list.** `ledger.weekList`; `outline(ctx, 300_000)` makes the day's scroll from §1.9.4's plan; the list's words are pinned with `source: "school-list"`, may be beyond the frontier, and are tagged `met-at-school`.
9. **The director** keeps `StoryState` (`finaleSeen`, `trickSeen`, `libraryOpen`; **[R3: Jonas, Baron final only]** `baronRound` is gone, since the Baron is fought once), plays the journeys, and picks every boss and land line by story state, so a reformed Baron never threatens again.
10. **Budgets for 6–7-year-olds** are already in planner §3 (15–20 minutes, 12–14 items a block). The weekly scroll is a separate five-minute budget.
11. **[R2: SW1] Tangential teaching.** `TANGENTIAL_TEACHING` and `PSC_ADJUSTMENTS` in sw.ts become planner input. A spelling taught tangentially is **met**, not taught: it may appear in reading, with Sensei giving its sound ("This is… /sh/"), and in its "met early" stone with its own tiles; it never appears in dictation or as a rival until its formal unit (or, for the check's additions inside a unit, until that unit's lag allows). The same mechanism carries -ed in Year 1 dictation (Sensei takes responsibility for its sound) and the special words' untaught parts.
12. **[R2: F13] The save stays small and off the hot path.** The save is localStorage JSON, `structuredClone`d on every `store.set` (`store.ts`) and shared by every profile under about 5 MB. So rungs and per-KC summaries go in the save, bounded to about 150 KB a child; raw evidence events are capped or go to IndexedDB, and are never cloned per tap.

### 6.4 [R2: F16] The order to build it

The full plan, with files, lanes, content and asset counts, acceptance and treadmill tests, is [midgame/BUILD_PLAN.md](midgame/BUILD_PLAN.md). In short:

| Slice | What | Why this order |
|---|---|---|
| **[R3: Jonas, Baron final only]** **00. The interim swap** (right after the big fix) | `w6-11` becomes the Sky Magpie with today's boss kit; the Baron's cut-in introduces her; on the first win he escapes in his balloon ("It was a trick!") instead of the finale; the finale gated to the final battle ([fix-requests.md](fix-requests.md)) | Jonas: no Baron fight with simple words, today |
| **0. The content model** (in parallel with 1) | `Level.sw`, one word source over `units/*.ts`, `GRAPHEMES` step by step, stable world keys, the ledger with rungs in the save | everything from §1.5 on needs it; it touches shared files, so it runs beside Slice 1, which mostly adds new files |
| **1a. Long words, proved** | the Syllable Dragon at sound level: ten PW1 compounds as `w6-syl1` on the Sky Temple's path, and the "shun" preview (*station, motion, lotion, potion* under the gold bracket), opened from the grown-ups' "Year 2 preview" card | the smallest end-to-end proof of long words on a phone, within the budgets, with templated speech, and the first test of the spelling-voice takes |
| **1b. One boss that means it** | the Sky Magpie (`w6-11`): five phases from the kit, the big attack as a Word Dragon, the sentence as the finish, the perch, the imp's grab on help; rival tiles for Initial Code and Bridging spellings in ordinary battles; the end-loop fix and the "It was a trick!" scene; the §1.9.8 hooks | Jonas's boss question, answered on screen |
| **2. The Sky Temple as EC1–5** | the new stones (Lesson 6 puzzles, Gem Choice with the fan, Sound Detective < ea > and < o >, the check's additions), two more Syllable Dragon stones, a Dictation Scroll, two chapters, the skirmish, the bridge, Sensei's grown-up voice rules | a whole Year 1 land, playable |
| **3. The weekly word list** | the link, the grown-ups' confirmation, the scroll, Ninja Vanish, the practice test, the week strip, the headband | the most useful habit for a school child; self-contained |
| **4. The maps and catch-up** | the planner's `catchUp()`, ghost petals, doors, guardian challenges, the Sky Isles' overworld map and the Atlas, the school welcome, the two paces, the Garden and the Rainbow Bridge | needs Slice 0's ledger |
| **5. Then one land at a time** | Cloud Town to Star Dunes (the practice check in Autumn Orchard), then the Muddle Isles, then the Library, each with its boss, chapters, clips and sweep | each land ships whole |

### 6.5 What the marketing can show, and when

The claims, the copy and the clips are in [midgame/MARKETING_PLAN.md](midgame/MARKETING_PLAN.md). The rule this design gives it: **a claim ships with the slice that makes it true.**

| After | The site can honestly show |
|---|---|
| Slice 1a | a Year 1 child building *sunset* as a Word Dragon, syllable by syllable; *station* with its gold ending, labelled "a Year 2 preview" |
| Slice 1b | a Year 1 boss that reads, spells with a choice of gems (*r _ n*), builds a long word and finishes on a sentence |
| Slice 2 | a whole Year 1 land: Gem Choice (*rain*: which /ae/ gem?), Sound Detective on *great*, the Magpie |
| Slice 3 | "Put this week's school spellings in with one link" |
| Slice 4 | a Year 1 school start: the welcome, ghost petals coming home, a catch-up door |
| Each land | that land's words in the "What your child will spell" table, with its clip |
| **[R3: Jonas, Baron final only]** The interim swap | nothing new; the footage of a Baron fight over simple words (*beg*, *coat*, *tea*) comes off the site and out of the videos (MARKETING_PLAN §4.1) |
| The Muddle Isles | *station*, *multiply*, *mechanic*; the final battle (**[R3: Jonas, Baron final only]** the only Baron fight anyone sees, with its hardest words) |
| The Library | *magician*, *optician*, *division*, *multiplication*, labelled "a Year 2 stretch; Year 3 at school" |

---

## 7. Decisions made without asking, and open questions

### 7.1 Decisions (for docs/DECISIONS.md)

Revision 2 changes M9, M11, M12, M17, M18 and M19 and adds M21–M36. **[R3: Jonas, Baron final only]** The amendment changes M10 and M25 and adds M37–M40. The DECISIONS.md file belongs to the integration step (FIX_PLAN §2), so these wait there to be copied across.

| # | Decision | Why | To change it |
|---|---|---|---|
| M1 | Four overworld maps (Garden, Island of Sounds, Sky Isles, Muddle Isles) and a Library after them | Jonas's direction; fixed chunks with a visible end; one story beat per map (§1.1) | rename freely; the structure is in `World.map` |
| M2 | Six lands a school year, one boss each, and each boss is its land's progress check | the 6–8-week check rhythm (§1.1) | merge lands in `worlds.ts` |
| M3 | Land names carry their land's sound (Cloud Town, Giant's Gorge …) | a small mnemonic, said once per land | names are data |
| M4 | Game types belong to maps (§1.4) | Jonas: "totally fine" | the registry in `games.ts` |
| M5 | A school child starts at the first stone of the land holding their start unit; earlier units are assumed and shown as ghost petals. Needs the ledger (Slice 0) | "we assume you know these things" | `startFor()` |
| M6 | A ghost gem is collected after two independent first tries with no miss between. Needs the ledger | proof without a test | a config value |
| M7 | Catch-up is the glowing stone (a door in a spur slot), at most one in three stones, never first in a session, at most two a day. Needs the planner | obvious to a child, never taking over | the caps in the planner's config |
| M8 | The guardian's challenge clears a land's ghost petals in about two minutes | the fast lane is the fun lane | – |
| **M9** (revised) | The child always beats the boss. The petal imp grabs a word's gem **during the fight, when Sensei helps**, and taunts about itself; the gems are won back in its lair. The chest only celebrates | stakes without a losing screen, and a pure win (SY2) | – |
| **M10** (**[R3: Jonas, Baron final only]**) | The Sky Temple's boss becomes the Sky Magpie; **the Baron fights only once, in the final battle at the end of Year 2**; the finale plays once, after it | the story must end once, at the end of the programme; Jonas (27 Sep): "the final, final battle with really hard words always" | – |
| **M11** (revised) | Two paces. **"In step with school"** is the default for a child with a school answer: new units open as a Sounds~Write class reaches them. **"Own pace"** is the default otherwise: the next land opens when its boss is beaten and its bridge is built | revision 1's "own pace, pass or not" let a daily player finish Year 1 in 5–7 weeks (SY1) | the defaults in settings |
| **M12a** (new, from M12) | A boss **reads** code up to its check's unit U; the land's newest code appears in a boss only as reading | the checks read at least one unit back (SW2) | `bossCheck()` |
| **M12b** (new, from M12) | A boss **dictates** code at least two sound units before U, with the bounded full bank (R4); so do the Dictation Scroll and the practice test | the checks dictate at least two back; writing is a free choice | `bossCheck()`, the dictation lag in config |
| **M12c** (was M12) | Rival tiles in **ordinary battles** only for spellings taught four or more units before the level, unless the word was just peeked | Sounds~Write's quizzing lag and Lesson 7 | `tileBank()` |
| M13 | Every word has a rung, R0–R5 (§3.0.3). Needs the ledger | spelling choice is word knowledge | – |
| M14 | Long words: Sensei gives the count and the child marks the joins (sound level) or the child finds them (syllable level); the tortoise speaks in the spelling voice and the rabbit in the talking voice | Lessons 11–14 and the spelling voice | – |
| M15 | A special ending is three tiles under a gold bracket at sound level and one chunk at syllable level; "shun" is said as spoken | one sound per tile; the spelling-voice question is open | – |
| M16 | Muddled Notes only use words the child spells securely, one per sentence, always fixed and re-read | seeing misspellings can make them stick | the rung threshold |
| **M17** (revised) | The weekly list: `?list=…&special=…&test=…`; a grown-up confirms; the scroll is the day's first glowing stone; five minutes a day; the child never hears "tricky", "sight words" or "special words"; at most two new special words a day; **version 1 plays only the words the game has**, and unknown words ship in reviewed batches | §1.9; F10 | – |
| **M18** (revised) | Belts come from checks; **a stripe is always sewn at the boss**, in silver thread below the pass mark; a school starter's earlier belts are stitched in silver until their petals are home | honest placement; a pure win (SY2); silver means one thing | – |
| **M19** (revised) | From the Sky Isles, long words become **Word Dragon** cards instead of stickers | a sticker of *tray* is no prize at seven | – |
| M20 | Two story chapters per Year 1–2 land for version 1 (the model's quota is one per sound unit) | cost | the quota |
| **M21** | Sounds~Write's Phonics Screening Check guidance (09.2024) is applied as written: additions inside EC2, EC4 and EC10; < ch >, < g >, < c >, < s > taught tangentially and < ar > met early by Circus Island; /oy/ met with /ow/; < sc > after the check; < er > as schwa in the long words; the practice check in Autumn Orchard. **This is official guidance, not a reorder**: the unit order stays official | SW1; Jonas's decision on the official order | `PSC_ADJUSTMENTS` in sw.ts |
| **M22** | The bridge: 12–13 planks a land, one per practice day, never taken away | days are the honest unit of practice (a word moves up a rung once a day) | the plank count in config |
| **M23** | At most three new stones a day, at most two of them teaching new code | spacing; months, not weeks | config |
| **M24** | The guardian's skirmish at each land's halfway stone; a minion raid when seven days pass without a boss-shaped moment | a boss-shaped moment about once a week (SY1) | config |
| **M25** | The final battle's *multiplication* encore is the stagger's biggest blow, not the knockout; the sentence finishes every Sky and Muddle boss (**[R3: Jonas, Baron final only]** the final battle's is five words now) | one rule for every boss (SY2); the six-year-old judge asked for the encore as the last blow | §2.5.3 |
| **M26** | The Syllable Train becomes the **Syllable Dragon**, and the Library's wyrms become **Word Dragons**: one creature for every long word | SY6 ("wyrm" can't be decoded), N1 | art and names |
| **M27** | At sound level the child taps the sparkles to mark the joins (N2); Sensei still gives the count and the split | Lesson 11 (the teacher splits), with the child's hands | – |
| **M28** | The spelling voice is one take per long word, cut at its pauses; compounds use their recorded words | F8: isolated syllables fail like pure sounds did | `SYLL_TIMES` |
| **M29** | Boss version 1: one sprite, poses by transform and tint, lines as captions with a growl (the Baron keeps his voice); boss lines never have word slots | F14: review time and Jonas's ear are the constraint | cast a voice when a land ships |
| **M30** | Bosses are data from a kit of six phase types (Read, Spell, Snatch, Misread, Big attack, Last word; Note as a Read variant) | F15 | – |
| **M31** | Saves that saw the old finale get the once-only "It was a trick!" scene | SY5 | – |
| **M32** | SW-s8's point that < pe > is EC4 was checked and not taken: sw.ts files < pe > under EC1 (inferred from the 2025 /ae/ poster's *cape*) | the data says EC1 | sw.ts |
| **M33** | The root clue is only for -cian after < c > and -ssion after < ss >; -tion is "the ending most words use" | SW7: roots mislead elsewhere | – |
| **M34** | The practice check is read aloud to a grown-up who ticks each word; a two-way choice is never called a check score | SW9: the check is read aloud, and valid readings count | – |
| **M35** | The weekly scroll lights the ninja's headband for the day, and a perfect practice test earns a charm for the next boss; both are looks, never extra stars | N4: school words should feel like training, not homework | – |
| **M36** | The child never hears "special words"; Sensei says "This word has a spelling we haven't learned yet. I'll tell you that bit." The term stays on the grown-ups' screens | SW-s4; Sounds~Write has no word category for these | the line |
| **M37** (**[R3: Jonas, Baron final only]**) | Star Dunes' guardian is **the Sand Shark**, the Baron's lieutenant, with the old "Baron, first round" check and moves (the first muddled note, the alien pets) | the Baron fights once (M10); a fin in the dunes is a set piece a six-year-old wants; *shark* holds /ar/ < ar > and is decodable at Star Dunes | the name and creature are data |
| **M38** (**[R3: Jonas, Baron final only]**) | Every item of the final battle, rematches included, uses Year 2 code or is a long word, and no word an earlier boss used; its last sentence is "The whole World Flower blooms." | "really hard words always" | `bossCheck()` for Muddle Castle |
| **M39** (**[R3: Jonas, Baron final only]**) | The interim swap ships before Slice 1b: `w6-11` is the Sky Magpie with today's kit; the Baron escapes once per save; `FINALE_LEVEL` is null until Muddle Castle | the Baron-fight footage over simple words stops now, not after 1b | fix-requests.md |
| **M40** (**[R3: Jonas, Baron final only]**) | `baron_trick_1` and `baron_escape_sky` serve both the interim's post-fight beat and 1b's map-arrival scene; `baron_trick_2` is dropped | one recording for both kinds of save | the lines |

### 7.2 Open questions (none blocks the build)

1. **Names.** The land and map names are ours. *Muddle Isles* tells a Year 2 child whose islands they are; if Jonas prefers something gentler, it is data. The same goes for *Syllable Dragon* and *Word Dragon*.
2. **The default pace.** We chose "In step with school" for school children and "Own pace" otherwise (M11). A family that wants to race ahead switches it on the grown-ups page.
3. **Freshford's lists.** What exactly is on a Year 1 list (the sound named, or just words)? Would the class teacher post one link for the class on Seesaw? Does Reception get lists too (Freshford checks Reception word lists fortnightly)?
4. **Does Freshford use the Sounds~Write progress checks?** (SW §10, question 6.) If it does, the grown-ups' page can use the check numbers.
5. **Freshford's order.** Freshford reorders Year 1's spring and summer (/oy/ first; /or/ /ar/ before /s/ /l/). The game follows the official order; "in step with school" follows the official pace. A school-order setting could come later.
6. **Special endings on the official boards.** How the members' building boards tile -tion, and whether a spelling-voice form of "shun" is taught (SW §10, question 3).
7. **The misspelling studies** in §3.6 were cited from memory and must be checked before Muddled Notes is built.
8. **A grown-up's own voice** for list words (later): where the recordings live, and for how long.
9. **Boss voices.** Version 1 captions the bosses (M29). Jonas may want the Sky Magpie voiced for the first clips; that is one casting job.
10. **[R3: Jonas, Baron final only]** **The Sand Shark.** Its name and look (the concept is `assets-src/midgame/art/sand_shark_concept.webp`) are data until Star Dunes ships. The Sky Magpie's sprite for the interim swap is `public/a/i/mon_boss_magpie.webp`; Jonas approves it for Slice 1b.

---

## 8. Sources

- **Research for this review:** [midgame/sw-y1y2.md](midgame/sw-y1y2.md) (Sounds~Write in Years 1–2, with its source keys), [midgame/audit.md](midgame/audit.md) (today's game on production; evidence in `playtest/runs/midgame/`), [midgame/prior-art.md](midgame/prior-art.md) (products and research, with links).
- **The judges of revision 1:** [midgame/judge-sounds-write.md](midgame/judge-sounds-write.md), [midgame/judge-six-year-old.md](midgame/judge-six-year-old.md), [midgame/judge-feasible.md](midgame/judge-feasible.md) (its measurements in `playtest/runs/midgame/judge-feasible/`: `scale.txt`, `fit.txt`, `sentences.txt`).
- **New evidence:** `playtest/runs/midgame/quota-gap.ts` and `quota-gap.txt` (read-only: the content quota per Extended Code unit against the unit files).
- **The game's own designs:** [SOUNDS_WRITE_MODEL.md](SOUNDS_WRITE_MODEL.md) (§1.4 the units, §1.6 long words, §6.1 the arc), [MULTI_SOUND.md](MULTI_SOUND.md) (Sound Detective; §4.1 try-safety), [TEACHER_SCRIPT.md](TEACHER_SCRIPT.md) (§0.1 the anatomy, §2 the voice rules, §9 fast and slow), [SPEECH_TEMPLATES.md](SPEECH_TEMPLATES.md) (templates, tiers, §7.4 the warm budget), [PERF.md](PERF.md), [MAP_DESIGN.md](MAP_DESIGN.md) (the glowing stone), [FIRST_MINUTES.md](FIRST_MINUTES.md) (§4 the opt-in, §9–10 the school start points), [READ_SLIDER.md](READ_SLIDER.md), [architecture/planner.md](architecture/planner.md), [NARRATIVE_AUDIT.md](NARRATIVE_AUDIT.md).
- **The code read:** `src/content/worlds.ts`, `src/content/sw.ts` (`contentQuota`, `PROGRESS_CHECKS`, `PACING`, `PSC_ADJUSTMENTS`, `TANGENTIAL_TEACHING`, `SPLIT_SPELLING.consonantE`, `PolyItem`), `src/content/flower.ts`, `src/content/lines.ts` (the film, the Baron's lines, the finale), `src/content/units/*.ts`, `src/ui/ReadSlider.tsx`.
- **Sounds~Write** (local, not for publication): the Phonics Screening Check guidance, 09.2024 (`assets-src/sw-sources/sw-psc-guidance-england-2024.txt`); `assets-src/sw-sources/research/DOSSIER.md` §11 (high-frequency words: the teacher's language and the load limits); the Freshford Year 1–2 parents' presentation (`assets-src/sw-sources/school-y1y2.txt`, 23 September 2026).
