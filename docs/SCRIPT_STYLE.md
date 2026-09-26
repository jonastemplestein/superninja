# How Sensei speaks: the house style

26 September 2026. This is the style guide for everything the game says: Sensei, the ninja, Baron Muddle, every composed `say()` in a scene, every `teach.ts` moment, the rewards, the map and the World Flower trips. The exact fix list that brings today's game into line with it is [SCRIPT_FIXES.md](SCRIPT_FIXES.md).

It answers Jonas (26 Sep): *"If you just look at the transcript of everything that is said to me, it's really pretty bad. It just says, A, two letters, one sound, A, two letters, one sound."* and *"When showing the student a sound as opposed to a spelling, you always have to show it in the petal shape in all games, with the image at the top of the petal or next to it."*

Sources: the Sounds~Write teacher language ([teacher-language.md](../assets-src/sw-sources/research/sections/teacher-language.md), quoted as *SW*), [ARCHITECTURE.md](ARCHITECTURE.md) §4.2 (the ledger) and §6.2 (dosage), [PEDAGOGY.md](PEDAGOGY.md), and fresh transcripts of today's game (below).

---

## 0. The one test

Read the transcript aloud, as the child hears it. Would a brilliant Reception teacher, sitting beside this one child, say exactly this, now, about the thing on the screen? If a sentence would make her sound like a machine, a lecturer or a cheerleader, rewrite it.

A good teacher:
- says a thing once, at the moment the child needs it, while pointing at it;
- says it again later, on another day, when the child meets it again;
- says less each time the routine is familiar, and lets the child's taps carry the lesson;
- praises the work, not the child, and not every time;
- when the child errs, says exactly what went wrong and ends on the right answer.

---

## 1. How these transcripts were made, and what they show

| Run | What | File (in `playtest/transcripts/2026-09-26-script-editor/`) |
|---|---|---|
| J-P, J-L | every level, one page and a fresh save per level (perfect and learner child) | `journey-perfect.md`, `journey-learner.md` |
| C-P, C-L | **one continuous page**: a brand-new child from the title tap through the first minutes (film, opt-in, dojo welcome, W1, Sticker Book, W2), then the next 12 stones from the map in order (to w1-9 or w1-11), with every reward, map walk and World Flower trip | `continuous-perfect.md`, `continuous-learner.md` |
| C5-P, C5-L | one continuous page from Shadow Castle: a child who has finished everything before w5-1 plays the next 12 stones (the first two-letter spellings in bulk) | `continuous-*-from-w5-1.md` |
| C6-P, C6-L | one continuous page from the Sky Temple: w6-br1 to w6-10, 13 stones (the Bridging Unit sorts and the Extended Code) | `continuous-*-from-w6-br1.md` |

- The continuous runs are the ones to read for repetition. The per-level runs reset the child's ledger every level, so they overstate some repeats; the continuous runs don't, and they show the real problem is worse than the per-level runs suggest, because the repeats pile up across levels, rewards and trips.
- Tools (new): `scripts/treadmill/continuous.ts` plays the continuous journeys (`--from w5-1` starts a child part-way; it records which clips were cut off). `scripts/treadmill/script-audit.ts` counts what this guide names: most-said lines, near repeats, spliced chains, stacked praise, silences, cut-offs and explanation dosage. Its reports are `script-audit-continuous.md` and `script-audit-journey.md` in the same folder.
- The continuous runs played a frozen copy of the source taken at 20:52 on a separate, non-reloading dev server (port 5287), because the shared dev server reloads the page whenever another agent saves a file. The per-level runs used the shared server, and a few of their cases were cut short by those reloads (J-P w1-3 and w2-7, J-L w6-3 have almost no speech); they are used here only for counts across all levels. Line numbers below are for the source at about 21:30 on 26 Sep; the scenes are being edited, so search for the quoted code if a number has drifted.

### 1.1 The catalogue: every kind of problem, with counts

| # | Problem | How big | Examples (run, time) |
|---|---|---|---|
| 1 | **Robotic repetition**: one composed shape said again and again, per tile, per chest, per gem, per level | "It's two letters, but it's one sound." **34 times in 25 minutes** in C6-P (plus 4 three-letter ones), by a child who never made a two-letter mistake; 22 (+3) in C5-P. 7 of the gaps between them are under 20 s. "Ooh! You already know this sound. Here's another way to spell it! Same sound, different spelling." 8× in C6-P and 8× in C5-P. "Welcome to Bamboo Village!" 11× in 12 map arrivals (C-P); "Welcome to the Sky Temple! Baron Muddle is hiding up here somewhere!" 13× in 13 (C6-P). "You did it!" at 11 of 12 rewards (C-P). "Wow! You got everything right. Is this too easy? You can jump ahead!" at **12 of 12** rewards in C5-P and 8 in C-P, starting in the first session (w1-4). | Jonas's sentence, verbatim, in C6-P w6-2 at 5:54: "This sound can be spelt in two ways. /ae/ It's two letters, but it's one sound. /ae/ It's two letters, but it's one sound." The same in w6-br2, w6-4, w6-8 and w6-7. C5-P w5-1 0:10–0:53: the same four-line teaching three times running for /sh/, /ch/ and /th/, each ending "It's two letters, but it's one sound." |
| 2 | **Explanations out of context**, or before their referent is visible | 8 kinds (right) | The first World Flower visit shows and says the petal for **/a/** (C-P 9:28) to a child whose only petals are /s/ and /m/ (`Intros.tsx:58` hard-codes `"a"`). "Ooh! You already know this sound…" comes **after** "And this is how we spell it" and the new spelling (C6-P 3:20–3:23). "This word has three sounds!" is said on the map, before any word exists (C-P 14:35). Sound Swap says "What changed? Listen here." **after** the two words it asks about (C-P 20:49). W5: "This is a mop. /m/ /a/ /p/. Which picture is it?" (C-L 10:58): the naming of one picture runs straight into the sounds of another. "Who read it right?" is asked before Kai or Suki has read, then asked again (C-P 13:56, 14:03). |
| 3 | **Facts with no reason** | The first World Flower visit gives **6 facts in 31 s** (C-P 9:22–9:53), three of them about gem battles and petals flying home, which the child can't meet for many levels. The jump-ahead offer goes to a 3-year-old on day one. "Ninjas read this way!" is said in the fifth and sixth lands (C5-P 1:34, C6-P 3:52) to a child who has read a hundred words. | "When a gem is full, it glows. Then you can win it in a gem battle! Win all the gems in a petal, and the petal flies back onto the World Flower!" (C-P 9:47–9:53, at w1-2) |
| 4 | **Over-dosage and under-dosage** | Over: the two-letter family above; "This is how we spell…" 15× in 5 first-sound levels (C-P), because it is said for every "watch me" and "together" item, not once per spelling. Under: a two-letter **error** never gets the two-letter explanation (`correction()` in `engine/feedback.ts` has no case for it), although that correction is exactly where Sounds~Write uses the phrase ("Do you remember that sometimes we spell a sound with two letters… It's two letters but it's one sound. It's /sh/. Say /sh/ here."). The Hear it again tip in Find never completes (cut off 8 of 10 times in C5-L), so it never counts and is re-said on every item forever. "If you say the sounds, you can hear the word" (`t_if_you_say_sounds`) is never said in any run. | C5-L w5-1 1:14–1:25: "Can you find… /sh/. Tap the speaker to hear the sound…✂" three items running, cut by the child's answer each time |
| 5 | **Monotony**: the same phrasing 10–20 times | "Which one starts with…" 24× in three levels (C-P). "What's the first sound?" and "What's the last sound?" 12× each, "Say the sounds… and read the word!" 17× (C-P). "Can you find…" up to 4× in a row in a dojo. "Change it to make…" and "What changed? Listen here." 6× per Sound Swap. Everyday praise 2.0–4.0 lines a minute. | C-P w1-2 7:46–9:08: eight questions in 75 s, every one "Which one starts with…" |
| 6 | **Lines cut off, overlapping or clashing** | 14–37 cut-off clips per continuous run. The Tap-the-glowing-stone hint is cut by the next level's own introduction on 9 of 12 map visits (C-P) and 10 of 13 (C-L). In Sound Swap, the place line ("Yes, the first sound changes! Now pick the new sound.") or "Now pick the new sound." is cut after about 1 s in **6 of 6** steps (C-P and C-L, w1-8) and 9 of 10 (C5-P): the child never hears which place changed. "I am Sensei Maple. I will train you." is cut by "Great choice!" (C-P 0:56); "You're a super listener!" by the map (C-P 6:44). Streak lines are cut by the next prompt (C5-L 11:21). | C-P w1-8 20:53: "Yes, the first sound changes! Now pick…✂ /s/" |
| 7 | **Chains of spliced fragments** | 7–18% of utterances are joined from fragments. The worst: "The same spelling can sometimes be… /th/ …in… "moth" …and sometimes… /dh/ …in… "this"" (7 clips, 4 of them fragments; C5-P 1:00); "This can be… /dh/ …but in this word, it's… /th/" (w5-3, w5-5, w5-6); the reading correction "If it was… [word] this would be… [sound] Is it? No! It's… [sound]" (7 clips); "That's… /s/ That sound stays the same. Listen… [word] [word]" (Swap). | |
| 8 | **Praise inflation** | 3.3 praise lines a minute in J-P, 4.0 in C5-P; 79 stacks of two or more within 5 s in J-P. End of a dojo: "Amazing!" → "Well done! You practised so hard!" → "You did it!" → "You won back some sounds!" → "More stickers for your Sticker Book!" (J-L w2-1 126 s). "Well done!" → "Well done! You practised so hard!" (C6-P 4:45). "Amazing! You're a ninja master!" after about three words of the first battle (the streak counts letter taps, and carries over from the level before). | |
| 9 | **Silences** | None of 10 s or more inside a level in any continuous run: the idle ladder and the held Next arrow work. (The 16–70 s gaps in J-P w4-8 are the bot not tapping Next on a story page.) Keep it that way. | |
| 10 | **Talk the child can't see** | Level introductions start on the map as the stone is tapped, before the level is on screen (10 of 12 stones in C-P, 11 of 13 in C6-P: "Every word starts with a sound…", "This is our dojo…", "This word has three sounds!", "Baron Muddle has mixed up these words!"), and cuts the map's hint. Sounds said as sounds with **no petal on screen**: every warm-up ("Tap all the pictures that start with… /s/", "They all have the sound… /a/"; `Warmup.tsx` has no `SoundBadge`), Placement, Sound Swap's "That's /s/…", Battle's "Look! I'll show you. /s/". | C-P 14:35 "This word has three sounds!" said over the map |

### 1.2 Where each problem comes from

| # | Composed by |
|---|---|
| 1 | `Sort.tsx:428-431` says the sound and `lettersSay()` for **every chest**. `Dojo.tsx` `Learn` (`letters` 412, `about` 413-418, `spellIt` 463) always adds the full letters sentence, with no idea of the spelling taught 15 s before. `teach.ts` `introGem()` (`factsSay` 150-154) adds it again on the World Flower trip a minute later, and `foundScript()` 261 adds `same_sound_new` again. The read-back reminders (`narrate.tsx` `lettersReminder` 77-85) are spaced in **levels** (`narrative.ts` `SPACING.concept` 21), so one session of five levels can say a spelling's reminder three times, and the per-level cap (`LETTERS`, 45) is 2. The map line is `App.tsx:548` (`world_N` on every arrival). "You did it!" is the reward's fixed lead (`App.tsx`, `Reward`, the `seq` that starts with `yay_7`). The jump offer is `shouldOfferJump()` (`engine/gems.ts:228`), true after any three perfect levels, with no memory of having offered. |
| 2 | `Intros.tsx:58, 89` (`/a/` petal). `Dojo.tsx:416` puts `same_sound_new` inside `about`, after the reveal. `Early.tsx:1540` says `two_sounds`/`three_sounds` before the first word. `Swap.tsx:294` puts `what_changed` after both stretched words. `Warmup.tsx:1201` says the sounds straight after `nameCards()`. `Early.tsx` `ReadOne` says `read_intro` (1896) and then `read_who` (1954) before the readers read. |
| 3 | `Intros.tsx` `FlowerIntro` (six steps, 58). `App.tsx` `Reward` (`jump_offer`). `narrate.tsx` `readThisWay()` (once per world, 218). |
| 4 | `Early.tsx:1319` (`!introduced.current.has(g) || mode !== "youdo"`: every I do and we do item says "This is how we spell…"). `engine/feedback.ts` `correction()` (no two-letter case). `Dojo.tsx:590-595`: the speaker tip comes after the question, so the answer cuts it, `explain()` never records it, and it is due again next item. |
| 5 | Fixed stems: `Early.tsx:1307` (`first_q`), `Dojo.tsx:575` (`dojo_find`), `Swap.tsx:294`, `Early.tsx` `BuildOne` slot questions. `pickPraise()` after every right answer (`Dojo.tsx:225, 534, 846`, `Swap.tsx:513, 522`, `Early.tsx:1047, 1677, 2043`, `Battle.tsx:943`, `Run.tsx:832`). |
| 6 | The level's first `say()` runs during the route change (App's fade), while `WorldMap`'s arrival line is still playing. `Swap.tsx:346` says the place line with the new tiles already tappable. `Dojo.tsx` `Build` locks taps during the first word's introduction only for adjacent consonants (`introLock`, 726). |
| 7 | `teach.ts` `sameSpelling()` 193-200, `canBe()` 203-205; `Early.tsx:2036`; `Swap.tsx:407`. |
| 8 | Praise call sites above; `Reward` lead; every level's closing line (`dojo_done`, `swap_done`, `battle_win`, `sort_done`) said and then followed by "You did it!". |
| 10 | Scene introductions in `useEffect` on mount; `Warmup.tsx`, `Placement.tsx`, `Swap.tsx:407`, `Battle.tsx:1107` say a sound with no `SoundBadge`. |

---

## 2. Who Sensei is

- A warm, calm, clever Reception teacher. She uses the Sounds~Write words exactly, because the child hears the same words at school (SW: "What the Reception or Prep teacher is saying should be the same as that of the Year 6 teacher").
- She talks to **one** child, about what that child is looking at.
- British English. Short whole sentences: one idea each, about 4–12 words.
- **Always**: pure sounds (/m/, never "muh"); spellings *spell* sounds ("This is the way we spell /k/ in cat."); "It's two letters, but it's one sound."; "This is /k/. Say /k/ here."; "This can be /a/, but in this word, it's /ae/."; "Say the sounds and read the word."; "Same sound, different spellings."
- **Never**: letter names; letters that "say" or "make" sounds; "magic e", "silent letters", "tricky words", "hard/soft", "long/short", "blends" as a noun; digraph or grapheme to a child; rules.

---

## 3. The eight rules

1. **Once, at its moment.** An explanation is said when the child first needs it, again on a later day, and then only when the child shows they need it (an error). Never twice on one screen. (§4)
2. **Every fact has a reason the child can see.** If the child can't use it in the next minute, don't say it yet. (§6)
3. **Say what the child is looking at; show what you say.** The thing named is on screen, lit, before or as it is named. A sound is shown as its petal; a spelling as its letters. (§6)
4. **Whole sentences.** Splice only a pure sound or one word into the slot of a whole sentence. (§7)
5. **Fade.** The second time is shorter than the first; by the fourth, the child's taps and the pictures carry it. (§5)
6. **Praise is rare, specific and never stacked.** (§8)
7. **Never talk over, never get cut off.** Explanations are protected; the child can always answer a question early. (§9)
8. **Correct the error, end on the target.** The last thing the child hears before trying again is the right sound or word. (§10)

---

## 4. Dosage

### 4.1 The rule for every explanation

An explanation has a **full form** (the teaching sentence), a **short form** (a reminder, a few words), and a **mention** (the idea used without explaining it). Which one is said is decided from the child's ledger, never from the scene alone:

- **Full form**: at the first meeting (before the child has to use it); again at the first meeting in each of the next sessions until the notion has its full explanations (ARCHITECTURE §6.2 gives the counts per kind); and on an error that shows the idea is missing.
- **Short form**: at a teach moment when the full form was said less than two minutes ago (the second spelling in a row), and as the spaced reminder once the full explanations are done.
- **Nothing**: everywhere else. Sorting, battles, runs, rewards and trips *use* an idea; they don't re-teach it.
- **Spacing is counted in sessions, not levels.** A child plays four or five levels in a sitting; "the next level" is two minutes later, not "another day". Today's `narrative.ts` `SPACING` counts levels, which is why the reminders cluster.
- **Only a completed explanation counts** (ARCHITECTURE §3: log what was heard). An explanation that keeps getting cut off is a layout bug: move it before the question, or protect it. Never re-queue it on every item.
- **Caps**: at most one reminder of any one idea per level; at most two full explanations of different ideas before the child's first tap in a level.

### 4.2 The table

| Moment | Full form (whole sentence) | When full | Then | Never |
|---|---|---|---|---|
| **Two letters, one sound** (per spelling: `letters:sh`; the idea is `idea:two-letters-one-sound`) | "It's two letters, but it's one sound." (`t_two_letters`); three and four letters: `t_three_letters`, `t_four_letters` | at the spelling's **teach moment** (the Dojo's Learn, or the first word containing it for a child who skipped its teach moment); again at the **first word containing it in each of the next two sessions** (the read-back reminder, with the spelling lit) | only on an **error** that splits it or uses one of its letters: "That's /s/. We need /sh/. It's two letters, but it's one sound." | in a sort's chest list; on a World Flower trip right after its teach moment; twice in one level; for the second spelling of a series within two minutes (that one gets the short "too" form: "This one's two letters too, but it's just one sound.") |
| **Same sound, different spellings** (concept 3) | the Learn of a new spelling of a known sound: "Ooh, you already know this sound!" (as the petal plays, **before** the spell) then "This is another way to spell the sound… /ae/" (SW, official) | first new spelling of each known sound | the sort's lead once per sort: "Sorting time! Same sound, different spellings."; the trip counts the ways ("Now you know two ways to spell… /ae/") | after the new spelling is already shown; again on the trip a minute later |
| **One spelling, two sounds** (concept 4) | "The same spelling can sometimes be /th/, in moth, and sometimes /dh/, in this." (one whole recording per pair) | teach moment of the second sound | read-back reminder in the next two sessions: "This can be /th/, but in this word, it's /dh/." | a seven-clip splice |
| **A new spelling** (`gpc:`) | "This is the way we spell /m/ in mat." | teach moment | first-sound games: say "This is how we spell /m/" at the **first** reveal of each spelling in a level; later reveals are silent (the letters appear with the spell) | on every I do and we do item |
| **The Hear it again speaker** | "Tap the speaker to hear the sound again." | once, **before** the first question it helps with, while the speaker pulses | Help's second press | after a question the child is already answering |
| **Gem energy** | "Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up." | the first time a gem fills (once per save) | "Look, this gem has filled a little more." when a gem crosses half full; "A gem is glowing!…" when one is ready | in the first World Flower visit before any gem has filled |
| **Gem battles** | "When a gem is full, it glows. Then you can win it in a gem battle!" (`flower_i5`) | the first time a gem is ready (in place of `gem_ready`) | `gem_ready` | at the first flower visit |
| **Reading left to right** | "Ninjas read this way!" with the arrow | W2, W4, and the first read-back in lands 1 and 2 | nothing (from land 3 the child reads fluently) | in every land |
| **World welcome** | "Welcome to the Sky Temple!…" | the first map arrival in a land | nothing, or a new land's line when the child moves on | after every level |
| **Tap the glowing stone** | `map_hint` | the first two map arrivals of a save | as the map's idle nudge (8 s without a tap) | cut off by the next level's introduction |
| **Jump ahead** | `jump_offer` | at most once per session, never in the first two sessions, and not again for two sessions after the child goes on without jumping | nothing | after every perfect level |

---

## 5. Variety and fading

- **Any line at most twice in 60 seconds**, except a Sounds~Write routine phrase (§5.1).
- **A per-item composition must have a "first" and a "next" form.** Anything said once per tile, chest, gem, picture or word needs a shorter second form, or it becomes "/ae/, two letters one sound, /ae/, two letters one sound". The pure helpers in SCRIPT_FIXES §A decide which.
- **Question stems rotate or drop.** The same stem at most three times running; after that rotate through recorded variants ("Which one starts with…", "Which picture starts with…", "Find the one that starts with…"), or drop the stem and let the petal pulse with its sound.
- **Instructions fade with success.** Say the full instruction for the first item; after two first-try successes on the same kind of item, give only the stimulus (the word, the sounds); bring the full instruction back after a miss.
- **Series announce their shape.** When the Dojo teaches four sounds, the first is taught in full; the next ones are shorter ("Your turn!" in place of "Tap it, and say it with me!").
- **Closing lines vary by what happened**, not by a random pick: a level that taught a new sound closes on the sound; a battle on the monster; a sort on the chests.

### 5.1 Routine phrases that may repeat

Sounds~Write relies on a few routines said exactly the same way every time. These may repeat, but they still fade within a level:

| Phrase | Keep saying | Fade to |
|---|---|---|
| "Say the sounds… and read the word!" | the first two read-backs of a level, and after any miss | the sound buttons lighting in turn while Sensei says the sounds and the word |
| "What's the first sound?" / next / last | "we do" items and the first "you do" word | the stretched word with the slot lit, no stem |
| "Listen…" before a stretched word | always (it is short and it points the ear) | – |

---

## 6. Context: say what the child is looking at

- **The referent comes first.** The thing is on screen, lit or glowing, before or as it is named. "This word has three sounds!" needs a word; say "I can hear three sounds!" after the slow word instead.
- **A sound is a petal.** Whenever Sensei says a sound *as a sound* (the thing to listen for, find or remember: "Which one starts with… /m/", "They all have the sound… /a/", "That's /s/"), that sound's petal is on screen in its chart colour with its chart picture (kite for /k/, and so on), and it swells as the sound plays (`SoundBadge`). A sound is never shown as letters. Spellings (tiles, gems, chests, word cards) are letters. "This sound" always points at a petal; "this spelling" always points at letters. (Jonas, 26 Sep.)
- **Use what the child knows.** Examples come from the child's own petals and met words: the first flower visit shows the child's first petal, not /a/.
- **One example word per spelling, never the same word for two spellings in one breath** ("/a/ in mat… /t/ in mat").
- **Name, then pause, then ask.** Picture naming and the question about a different word are separated by "Listen…" and a beat.
- **Don't greet a child where they already are.** "Welcome to Bamboo Village!" is for arriving.
- **Speak when the screen is there.** A level's first line starts after the level is on screen (after the fade), not over the map.

---

## 7. Sentence shapes

| Shape | When | Example |
|---|---|---|
| **Whole recorded sentence** | the default; any sentence with a word in it (Round 13) | "This is a mop." "Mop starts with…" |
| **Lead-in + one slot** | a pure sound or one word, stretched word or held onset, at the end of a sentence | "Which one starts with…" /m/ · "Build the word…" "mat" |
| **Lead-in + slot + tail** (3 clips at most) | the Sounds~Write "the way we spell /X/ in *word*" pattern, where the tail is a whole-sentence clip | "This is the way we spell…" /ae/ "…in rain." |
| **Never** | four or more clips with two or more fragments; a sentence starting "Or", "And" or "…but" without its first half right before it; two independent sentences about different things glued within 400 ms | "The same spelling can sometimes be… /th/ …in… moth …and sometimes… /dh/ …in… this" · "mug" "Or I can say it slowly…" |

- **Questions go last**, after the thing they ask about: "Listen: mmmat… sssat. What do we need to change?" not "…What changed? Listen here." after the words.
- **Record whole sentences for the common compositions** (the pair lines for concept 4, "This one's two letters too…") rather than splicing them.
- New lines go in `src/content/lines.ts` in one owned block and are recorded with the usual audio script; a line id that doesn't exist yet is skipped by `L()`/`HAS` guards, so wording can ship before its audio.

---

## 8. Praise

- **After a right answer, the model is the feedback.** "Mop starts with /m/." "/s/ /a/ /t/, sat." A praise word is added at most every second right answer (warm-ups: every third, as now).
- **Never stack.** One celebratory line per moment. A level's closing line ("Well done! You practised so hard!", "Sorted! What a clever ninja.", "Hooray! The monster ran away!") *is* the level's praise: the reward then leads with its news (a new sound, new stickers, a gem), not "You did it!". The last item's praise is dropped when the closing line follows it.
- **A streak tier-up is the praise** for that answer (already so), and a gem's first-fill explanation replaces praise too.
- **Specific beats generic.** Sounds~Write praise is short and about the sound ("Good, you said that sound really well."). Prefer the modelled sound or word to another "Amazing!".
- **Big praise stays big.** "You're a ninja master!" should mean ten independent right answers, not ten letter taps (about three words), some of them errorless "say it with me" taps.

---

## 9. Flow: no talking over, no cut-offs

- **Explanations are protected; questions are not.** A child may answer a question early (the prompt is hushed; ARCHITECTURE §7 eager answers), but the explanation before it can't be cut: taps wait (the Dojo's Learn already does this).
- **Split a line that both explains and asks.** "Yes, the first sound changes!" (protected) then "Now pick the new sound." (the question). Today's single recording is cut after a second every time.
- **One voice at a time across screens.** A new screen's first line waits for the previous screen's line, or the previous line isn't started if the child is already moving on.
- **At most three utterances between two child actions** after a right answer (streak line, read-this-way, read-back, reminder, praise and the gem explanation all want the same gap: keep at most three, and drop praise first; a reminder that doesn't fit waits for the next word).
- **Talk before the first tap**: 12 s at age 3, 15 s at age 4 (ARCHITECTURE §6.4).
- **Silence is fine while the child thinks**; the idle ladder (8 s glow and ask again, 16 s paw) fills it. Nothing silent is waiting on the child without a visible cue.

---

## 10. Corrections

- **First miss: back to listening.** The stretched word, with the slot lit ("Listen again… What do you hear here?" and its rotating leads). Never segment a word the child is spelling.
- **Second miss: show.** "That's /s/. We need /m/." with the right tile glowing; end on the target.
- **Two-letter errors** get the two-letter explanation (this is the "then only on error" of §4): the child picks < s > or < h > for /sh/, or < a > for /ae/ spelt < ai >: "That's /s/. We need /sh/. It's two letters, but it's one sound." A reading error that splits a two-letter spelling: "This is /sh/. It's two letters, but it's one sound. Say /sh/ here." (SW).
- **The same spelling, another sound's word**: "Yes, that's a spelling of that sound too! But in this word, we spell it like this…" (as now).
- **"Keep going, ninja!"** only when a streak of three or more is lost (as now), and before the correction so the correction ends on the target.

---

## 11. How each explanation moment should read

Each moment below: what the child sees, the current transcript (bad), and the target (good). The fix list gives the code for each.

### 11.1 A new sound and its spelling (Dojo, Learn), one spelling

Sees: the petal for /b/ in the middle; then the spell, and the letters appear beside it.

Bad, the fourth of four in a row (J-L w2-1 34.5 s), identical to the three before it:
> Listen… /h/ /h/ · And this is how we spell it. /h/ · Tap it, and say it with me! · /h/ /h/ · Brilliant!

Good (first of the level in full, later ones shorter):
> **/b/**: Listen… /b/ /b/ · *(the spell)* We hear the sound. Now look: this is how we spell it. /b/ · Tap it, and say it with me! · /b/ /b/
> **/k/**: Listen… /k/ /k/ · *(the spell)* And this is how we spell it. /k/ · Your turn! · /k/ /k/ · Brilliant!
> **/h/** (last): Last one! Listen… /h/ /h/ · *(the spell)* And this is how we spell it. /h/ · Your turn! · /h/ /h/

### 11.2 A series of two-letter spellings (Dojo, Learn)

Sees: the petal, then two letters appear.

Bad (C5-P w5-1 0:10–0:53):
> Listen… /sh/ /sh/ · We hear the sound. Now look: this is how we spell it. /sh/ · It's two letters, but it's one sound. · Tap it, and say it with me! …
> Listen… /ch/ /ch/ · And this is how we spell it. /ch/ · It's two letters, but it's one sound. · Tap it, and say it with me! …
> Listen… /th/ /th/ · And this is how we spell it. /th/ · It's two letters, but it's one sound. · Tap it, and say it with me! …

Good:
> Listen… /sh/ /sh/ · *(the spell)* We hear the sound. Now look: this is how we spell it. /sh/ · **It's two letters, but it's one sound.** · Tap it, and say it with me! · /sh/ /sh/
> Listen… /ch/ /ch/ · *(the spell)* And this is how we spell it. /ch/ · **This one's two letters too, but it's just one sound.** · Your turn! · /ch/ /ch/ · Ace!
> Listen… /th/ /th/ · *(the spell)* And this is how we spell it. /th/ · Your turn! · /th/ /th/
> *(/th/ gets no letters line: the idea was said twice in the last 40 s, and the two letters are there to see.)*

### 11.3 A new spelling of a sound the child knows (Dojo, Learn)

Bad (C6-P w6-1 3:16–3:33): the news comes after the reveal, and the fact is said again as if new.
> Listen… /ae/ /ae/ · And this is how we spell it. /ae/ · Ooh! You already know this sound. Here's another way to spell it! Same sound, different spelling. · It's two letters, but it's one sound. · Tap it, and say it with me!

Good:
> Listen… /ae/ /ae/ · **Ooh, you already know this sound!** · *(the spell; < ay > appears beside the petal)* **This is another way to spell the sound… /ae/** · This one's two letters too, but it's just one sound. · Your turn! · /ae/ /ae/

### 11.4 The sort's introduction (Jonas's example)

Sees: the /ae/ petal, and two chests labelled < ai > and < ay >.

Bad (C6-P w6-2 5:50):
> Sorting time! Same sound, different spellings. · This sound can be spelt in two ways. · /ae/ · It's two letters, but it's one sound. · /ae/ · It's two letters, but it's one sound. · Tap the chest with the same spelling as the word.

Good (each chest lights and hops as it is named; the petal swells on /ae/):
> Sorting time! Same sound, different spellings. · This sound can be spelt in two ways. · **This is the way we spell /ae/ in rain…** *(< ai > chest)* · **…and like this, in tray.** *(< ay > chest)* · Tap the chest with the same spelling as the word.

For the Bridging sort, when the < ck > fact is due (the child hasn't had it in two earlier sessions), it is said once, on its chest: "…and like this, in duck. It's two letters, but it's one sound." (< ck > chest lit.)

### 11.5 The first-sound reveal (first-sound game)

Sees: two pictures; the right one is tapped; its first spelling is written under it by the ninja's spell.

Bad (C-P w1-2 7:46–8:14, the "watch me" and "together" items): "/m/" three times per item and "This is how we spell…" on both.
> Watch me first! This is a mop. This is a bus. Which one starts with… /m/ · Mop starts with… /m/ · We hear the sound. Now look: this is how we spell it. /m/
> Let's do it together! This is a pig. This is a mat. Which one starts with… · Mat starts with… /m/ · This is how we spell… /m/

Good:
> Watch me first! This is a mop. This is a bus. Which one starts with… /m/ · Mop starts with… /m/ · We hear the sound. Now look: this is how we spell it. /m/
> Let's do it together! This is a pig. This is a mat. **Which picture starts with…** /m/ · Mat starts with… /m/ *(the spelling appears; no line)*
> Now it's your turn! This is some milk. This is a cup. **Find the one that starts with…** /m/ · Milk starts with… /m/

### 11.6 The read-back reminder (Dojo build, battle, run, swap)

Bad (J-P w4-3 12.4 s): five things in a row after one word.
> Three right answers in a row! Your ninja is getting stronger. · Ninjas read this way! · /d/ /r/ /e/ /s/ "dress" · It's two letters, but it's one sound. · Super! · Look, a gem! Each gem holds a way to spell a sound…

Good (in a **later session**, the first word with < ss >; the < ss > tile lit):
> /d/ /r/ /e/ /s/ "dress" · It's two letters, but it's one sound. *(no praise: the reminder is the attention for this word; the gem explanation waits for the next word)*

### 11.7 The World Flower trip after a level

Bad (C6-P 5:00–5:39): everything the Learn said a minute earlier, again.
> You found a new sound! … · This is the way we spell… /ae/ …in rain. It's two letters, but it's one sound. We see this spelling in tail and nail. · Ooh! You already know this sound. Here's another way to spell it! Same sound, different spelling. · This is the way we spell… /ae/ …in tray. It's two letters, but it's one sound. We see this spelling in day and say. · Now you know two ways to spell… /ae/

Good (the trip shows where the gems live and counts the ways; it doesn't re-teach):
> You found a new sound! Look, here is its petal, shining through the mist. · This is the way we spell… /ae/ …in rain. We see this spelling in tail and nail. · You found a new gem! It's a spelling of the sound… /ae/ …like in tray, day and say. · Now you know two ways to spell… /ae/

Bad (C-P 12:00–12:11): two sounds, one example word.
> This is the way we spell… /a/ …in mat. We see this spelling in man and pan. · This is the way we spell… /t/ …in mat.

Good:
> You found two new sounds! … · This is the way we spell… /a/ …in mat. We see this spelling in man and pan. · **And here's another new sound!** · This is the way we spell… /t/ …in tap. We see this spelling in sit and tent.

### 11.8 The first World Flower visit

Bad (C-P 9:22–9:53): six facts in 31 s, about /a/.

Good (three facts, about the child's own petal; the others are said when they happen):
> This is the World Flower. Baron Muddle blew all its petals away! · Every petal is one sound. Listen! This is the petal for the sound… **/s/** · Inside each petal are shiny gems. Each gem is a way to spell the sound.
> *(Later: the first gem to fill says `audit_gem_first`; the first gem ready says `flower_i5`; the first petal home says `petal_complete`.)*

### 11.9 The reward and the map

Bad (C6-P 1:22–1:37, after w6-br1):
> Sorted! What a clever ninja. · You did it! · More stickers for your Sticker Book! · Look, this gem has filled a little more. · Wow! You got everything right. Is this too easy? You can jump ahead! · Welcome to the Sky Temple! Baron Muddle is hiding up here somewhere! · Tap the glowing stone…✂

Good:
> Sorted! What a clever ninja. · *(stickers fly into the book)* More stickers for your Sticker Book! · *(the < ck > gem lifts)* Look, this gem has filled a little more. · *(the map; the ninja walks to the next stone; no line)*

### 11.10 Sound Swap

Bad (C-P w1-8 20:44–20:57):
> Change it to make… "sat" · "mat" (slowly) "sat" (slowly) · What changed? Listen here. · Yes, the first sound changes! Now pick…✂ /s/

Good:
> Change it to make… "sat" · Listen… "mmmat"… "sssat". **What do we need to change?** · *(child taps m)* **Yes, the first sound changes!** · Now pick the new sound. · *(child taps s)* /s/ /a/ /t/ "sat"
> *(Third step on, after two first tries:)* Change it to make… "sit" · *(the stretched pair only after a miss)*

### 11.11 Listening for the word (W5)

Bad (C-L 10:58): "This is a mop. /m/ /a/ /p/ Which picture is it?"

Good: "This is a mop. · **Listen…** /m/ /a/ /p/. Which picture is it?"

### 11.12 The Hear it again speaker

Bad (C-P 1:32–1:36, the dojo welcome): "And when you tap the speaker, I'll say it again!" · *(tap)* "And when you tap the speaker, I'll say it again!"

Bad (C5-L w5-1 1:12–1:25, Find, three items running): "Can you find… /sh/ · Tap the speaker to hear the sound…✂"

Good (Find, first item, the speaker pulsing before the question): "Tap the speaker to hear the sound again. · Can you find… /sh/"

### 11.13 A two-letter error

Today, `correction()` treats it like any wrong tile: first miss "Listen again… What do you hear here?", second miss "That's /s/. We need /sh/." (as in J-L w5-11 at 77 s: "That's… /i/ We need… /ch/"). The two-letter idea is never connected to the mistake. (The learner bot never happened to split a two-letter spelling, so this is from the code, not a transcript.)

Good, second miss on /sh/ after tapping < s >: "That's /s/. We need /sh/. **It's two letters, but it's one sound.**" *(< sh > glows)*

---

## 12. Checks

Run after any change to what Sensei says:

```sh
bun scripts/treadmill/continuous.ts --base <a non-reloading server> --persona perfect,learner --levels 12 --out playtest/transcripts/<run>
bun scripts/treadmill/continuous.ts ... --from w6-br1 --levels 13
bun scripts/treadmill/script-audit.ts playtest/transcripts/<run>/continuous-*.json --out playtest/transcripts/<run>/script-audit.md
```

Targets (the fix list's acceptance numbers):

| Measure | Now | Target |
|---|---|---|
| Letters lines in the Sky Temple run (C6-P, 25 min) | 34 "It's two letters…" + 4 three-letter | about 10–12 in all; no spelling told twice in a session; the same sentence never twice within 60 s |
| The same composed utterance shape back to back | "/ae/ two letters · /ae/ two letters" in 5 sorts | 0 |
| World welcome lines per land | 11–13 | 1 |
| Jump offers per session | 8–12 | ≤ 1 |
| Praise lines a minute | 2.0–4.0 | ≤ 1.5; stacks within 5 s: 0 |
| Cut-off explanations (not prompts) | swap place lines 6/6, speaker tip 8/10, map hint most visits | 0 |
| Any line more than twice in 60 s (bar §5.1) | "Which one starts with…" 8× in 75 s | 0 |
| A sound said as a sound with no petal on screen | every warm-up, Placement, Swap corrections, Battle help | 0 (sweep invariant) |
