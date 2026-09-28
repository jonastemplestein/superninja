# Speech templates: the splice inventory

*For Jonas's request of 27 Sep: "templatize the recordings and thus create more natural speech … instead of 'say this sound: a' you can say 'say the sound a' … instead of 'say this word slowly: mat', you would say 'say mat slowly'."*

Written 27 Sep 2026 by the inventory lane of the speech-templates workflow. It lists every place where Sensei says a sentence built from more than one clip, or a carrier plus a variable. For each one it gives how often a child hears it, how awkward it sounds today, and how many different sentences it would take to record every case whole. Prior art and the approaches are in [prior-art.md](prior-art.md). The scripts and raw data behind every number are in [`playtest/speech-templates/`](../../playtest/speech-templates/) (see "How it was measured").

---

## The short version

- **About a third of Sensei's lines lead straight into a slot.** On the preschool path, 37% of lines run straight into a pure sound, a word, a stretched word or a held first sound: 59 joins per 10 minutes. Over the whole journey it is 31% for a learner (38 joins per 10 minutes) and 25% for a perfect child. About 125 slot clips play per 10 minutes, and Sensei says 100–160 lines.
- **The four compositions heard most, weighted by how awkward they sound**, are all about words:
  - "What's the first sound?" … *mmmaaat*: the word is never named in the question.
  - The dictation word said bare, or after "Spell…": 13–17 times per 10 minutes.
  - The first-miss correction, "Listen again… What do you hear here?" … *mmmaaat*: up to 9 times per 10 minutes for a learner.
  - Sound Swap's "Change it to make… sat. *mmmaaat… sssaaat.* What changed? Listen here.": 3–4 times per 10 minutes, with four joins.
- **The official Sounds~Write wording puts the slot in the middle all the time.** "What's the first sound you hear in 'sat'?", "Yes, you can hear /s/. Everyone say that sound.", "This is the way we spell /k/ in this word. Say /k/ here.", "Mat to sat. What do you think we need to change?", "This can be /a/, but in this word, it's /ae/.", "Does this word have the /o/ sound or the /oe/ sound in it?" (research: `assets-src/sw-sources/research/sections/teacher-language.md` §10.7).
- **The teacher script's rule forbids exactly that.** Its rule is "a slot only at the end of a sentence, after a '…' lead-in". [TEACHER_SCRIPT.md](../TEACHER_SCRIPT.md) has **46 places (58 line ids) whose natural wording puts a variable in the middle** (§4 below).
  - 15 are already natural, as whole-sentence families (`tv_your_word_<w>` and the like).
  - 30 still bend the English: 26 workarounds ("it", "this sound", a "…" pause or a second sentence), and 4 families that still work around a sound.
  - One is a fixed line.
- **Sound slots can never be recorded whole,** because pure sounds are never re-synthesised inside a sentence. **36 of the 58 templates have a sound slot,** and 19 of those want the sound in the middle or at the start. Those 19 need a carrier recorded in two halves around the QA'd pure sound, whatever else we do.
- **Recording every word template whole** (see §7):

  | Tier | Full set | Lean set: top templates, one phrasing each |
  |---|---|---|
  | Year R | ≈ 6,600 clips | ≈ 3,900 |
  | To the end of Year 1 | ≈ 14,200 | ≈ 8,500 |
  | Whole programme, at the planned 2,100 words and 800 pictures | ≈ 36,400 | ≈ 21,100 |

  Today `public/a/` has 4,087 files (27 Sep, and growing: the other workflow is adding stretched words). A Workers version allows 20,000 files on Free and 100,000 on Paid. The whole programme's full set is also about 0.8 GB of MP3. So a whole-programme full set needs the Paid plan, or per-unit sprites, and per-unit caching in the service worker.

---

## How it was measured

**Code.** An AST scan found every `Say[]` array in `src/scenes/*.tsx`, `src/content/teach.ts`, `src/engine/feedback.ts`, `src/scenes/narrate.tsx`, `src/ui/nav.tsx` and `src/App.tsx` that mixes a line with a slot, a dynamic line id or a second line (`scan-splices.ts` → `splices.tsv`, 197 sites). Grep then found the splices that run across separate `say()` calls, such as the read-back in `Early.tsx` `BuildOne.readBack` and the demo in `runDemo`. The teacher-voice lines (`tv_*`) are recorded (414 files in `public/a/l/`) and registered in `src/content/games.ts`. The scenes are being wired to them right now by the teacher-voice workflow. So each row names today's code site, and the teacher-script line that is replacing it.

**Frequency.** Every speech event in the newest transcripts was paired: a line followed by a slot clip within 0.7 s of its end is one join. The child's own taps (a card saying its own word, a tile saying its sound) were excluded (`freq.py`, `freq2.py`, `linerates.py`, `bare.py`). The sources:

| Source | What | Game time |
|---|---|---|
| run A | `playtest/runs/teacher-voice/run-a/events.json`: a brand-new preschool child, film → w2-1 (26 Sep 23:27, snapshot build) | 53 min |
| journey, learner | `playtest/transcripts/2026-09-26-script-editor/journey-learner.json`: every level once, a child who makes mistakes | 176 min |
| journey, perfect | the same, a child who never misses | 174 min |

`2026-09-27-05-14/continuous-*` was also read, but it lost its first 33 minutes of lines, so it is only a cross-check. **A session is 10 minutes of play**: PEDAGOGY.md has Sensei suggest a rest after 10–12 minutes, and the headless design uses 10-minute sessions. Frequencies are **per 10-minute session**, written *preschool path / whole journey*. The preschool figure is run A. The whole-journey figure is the learner journey, or the perfect one where that is higher. These transcripts were recorded on today's build, before the teacher voice was wired in. So a teacher-script template carries the frequency of the moment it replaces (the same place in the game).

**Awkwardness (1–5)**, judged on what the child hears today, and on the teacher-script version where that is what ships next:

| Score | What it means |
|---|---|
| 1 | One whole recording, no join (today's generated families). |
| 2 | The slot sits at the natural end of a complete phrase, or between two complete sentences. The only tell is a slightly long pause. |
| 3 | Stilted. The carrier hangs on "…" and the slot follows a pause (the "quiz voice" of "say this sound: a"). Or a question ends on a spliced clip, so the question's rise is lost. Or the sentence says "it" or "this sound" instead of naming the slot. |
| 4 | Unnatural. The slot is where English wouldn't put it (after the question: "What's the first sound? … mmmat"). Or the instruction names nothing ("Tap it, and say it with me!" after a sound said earlier). Or a bare "Listen…" bark comes before a sound. |
| 5 | Broken. The slot is spliced mid-sentence with joins on both sides, or several slots are chained. |

The audio judge's join scores from `playtest/**/joins.json` (311 judged joins) are quoted where they exist. The judge is lenient (TEACHER_SCRIPT §7.4). It hears acoustic joins, not phrasing: it scored the swap chain 9.0 while noting "a noticeable drop in pitch and acoustic energy".

**Combinations** are counted from the content (`spaces.ts`, `gpcs.ts` → `spaces.json`). They use the official units in `src/content/units/*.ts` and the spellings and sounds of `src/content/sw.ts`. The tiers are:

- **R**: IC1–IC11 plus the Bridging Unit.
- **→Y1**: up to EC26.
- **all**: up to EC49.

Each count is written *data today → planned*. The planned figures are the brief's ~850 words for R–1 and DECISIONS.md's ~2,100 words and ~800 pictures for EC49, scaled in proportion. The EC27–49 unit files hold only 143 new words so far. "Per unit" is the median new values in an Initial Code unit · an Extended Code (Year 1) unit. The game that ships today still runs on `phonics.ts`: 411 words, 154 pictures, and 17 picture-only words.

---

## 1. The top 30, by frequency × awkwardness

Template ids are proposals. The prefix names the slot types:

| Prefix | Slots |
|---|---|
| `W.` | a word or picture |
| `S.` | a pure sound |
| `WS.` | a word and a sound |
| `WW.` | two words |
| `SS.` | two sounds |
| `N.` | a name or a number |

`{word~slow}` is the stretched word, `{word~first}` the held first sound, and `{sounds}` a word's sounds one by one. In the slot column, **I, M or F** marks where the slot falls in its phrase (initial, medial, final), the prosodic position the prior art says a filler must be recorded in.

| # | template id | natural text | slots (position) | where used (file:function) | per 10 min: pre-school / whole journey | today's implementation | awk | combinations: per unit · R / →Y1 / all |
|---|---|---|---|---|---|---|---|---|
| 1 | `W.position-q` | "What's the {first\|next\|last} sound in {word}?" … {word~slow} (official: "What's the first sound you hear in 'sat'?") | word M/F, then word~slow F | `Early.tsx` `BuildOne.ask` 1629, `BuildOne.again` 1639 (`slotQ` 1614); `Dojo.tsx` `Build` idle (`which_sound` + word); TS §3.16–3.17 `first_sound_q`, `tv_last_first`, `tv_next_middle` | 7.5 / 3.5 | `first_sound_q` / `next_sound_q` / `last_sound_q`, 200 ms, `{stretch: word}`. `audit_last_place` goes in front once. The question never names the word; the stretched word hangs after the question mark. | 4 | 89 · 35 per unit; 1,106 / 2,287 → 2,461 / 2,674 → 6,019 (word × question kind) |
| 2 | `W.your-word` | "Your word is {word}." · "Your next word is {word}." (official: "Can you build the word {word}?") | word F | `Battle.tsx` `question` 487; `Dojo.tsx` `Build.prompt` 740; `Early.tsx` `BuildOne` effect (bare word); `Sort.tsx` (the falling word); `Placement.tsx` `question` 159 (`place_spell`); `Run.tsx` 1515 (`run_catch`); TS `tv_your_word`, `tv_next_word`, `tv_our_word`, `tv_sort_ido` | 14.5 / 17.4 (every dictation prompt) | Mostly the **bare word** with no sentence at all: 13–17 per 10 min. The first word gets "Spell…" (`battle_spell`) or "Build the word…" + 500 ms + word. TS: "Your word is…" + [am], "Here's your next word…" + [sat], then bare from the third word. | 2 | 30 · 12; 372 / 790 → 850 / 933 → 2,100; × 2 phrasings |
| 3 | `W.listen-again` | "Let's listen to {word} again: {word~slow}." · "What can you hear here? {word~slow}" · "What sound comes next in {word}?" | word M, word~slow F | `feedback.ts` `correction` 44 (`listenLead` rotation, `narrative.ts` `LISTEN_AGAIN`); `narrate.tsx` `spellingHelp` 199; `Battle.tsx` `monsterAttack` 649 (`listen_again` + word); TS §5.4 `tv_listen_here`, `audit_listen_next`, `audit_listen_slowly` | 4.2 / 9.2 (learner) | A rotating lead ("Let's listen again. What can you hear here?" / "…What sound comes next?" / "Let's listen to the word again, slowly."), 150 ms, `{stretch: word}`, or the plain word where no stretch exists (44 of 94 in the learner journey). The word is never named. | 3 | as `W.your-word` (one or two phrasings per word) |
| 4 | `WW.change` | "Now let's change {word_a} to {word_b}." · official: "{Mat} to {sat}. What do you think we need to change?" | word M + word F | `Swap.tsx` `ask` 290–296, `hear` 304, help 566; TS §3.20 `tv_swap_change_to`, `tv_swap_now_change` · `tv_swap_both` · `st_what_change` | 3.6 / 2.8 | "Change it to make…" + [sat] + *mmmaaat* + *sssaaat* + "What changed? Listen here.": four joins, two words never named in a sentence. Judge 9.0 (n = 18), with "a noticeable drop in pitch and acoustic energy". TS: "Now let's change it to…" [sit] · "Listen to them both…" [sat~] [sit~] · "What do we need to change?" | 5 | 10 · 4 swap steps; 137 / 209 → 225 / 289 → 650 |
| 5 | `S.which-starts` | "Which one starts with {sound}?" · "Which picture starts with {sound}?" · "Find the one that starts with {sound}." | sound F (question) | `Early.tsx` `FirstSoundLevel.mk` 1319 (prompt), 1320 (`listenAgain`: `listen_again` + word + `first_q` + sound); TS §3.13 `first_q`, `st_first_q2`, `st_first_q3`, `tv_which_starts_it` | 5.1 / 1.5 | `first_q` "Which one starts with…" + 300 ms + /m/. The question's rise can't land on a spliced pure sound. `listenAgain` puts a word *before* the carrier. The older "Which one starts with…" [mat] "…starts with" /m/ splice scored 6.7 (n = 9): "'with' is clipped abruptly into 'mat'". | 3 | 3 · 1 new sounds; 29 / 42 / 44. Sound slot: a carrier only, 3 phrasings |
| 6 | `W.name` | "This is a {picture}." | word F | `Early.tsx` `usePickGame.present` 998; `Warmup.tsx` `nameCards` 430; TS every picture game | 13.8 / 5.8 | **Whole sentence per picture** (`fm_name_<w>`, 56 recorded). Fallback for a picture without one: `this_is_a` / `this_is_an` + 80 ms + word (FIRST_MINUTES §12 retired it; `Early.tsx` still has it). | 1 (fallback 4) | 9 · 2; 128 / 228 → 245 / 249 → 800 pictures |
| 7 | `S.which-write` | "Which of these is the way we write {sound}?" (official: "Can you tell me which of these is the way we write /s/?") · "Find how we write {sound}." | sound F (question) | `Early.tsx` Ninja Eyes items 1377 (`find_q`); `Dojo.tsx` `Find.prompt` 582, `Find` help 611; `Placement.tsx` `question` 154 (`place_sound`); TS §3.13 B `tv_which_write`, `tv_find_write`, `tv_now_find` | 3.0 / 2.7 | "Find this sound…" or "Can you find…" + 300–450 ms + /b/ (find a *sound*?). TS: "Which of these is the way we write…" + /m/, the question ending on the spliced sound. | 4 (TS 3) | 3 · 1; 29 / 42 / 44 sounds (41 / 114 / 172 spellings in play). Carrier only |
| 8 | `S.say-read` | "Now let's say the sounds, {sounds}, and read the word: {word}." (official: "Now let's say the sounds and read the word.") | sounds M, word F | `Early.tsx` `BuildOne.readBack` 1657 (the line, then each sound as its own `say()`); the read-backs in `Dojo.tsx`, `Battle.tsx` and `Swap.tsx`; TS `tv_lets_say_read`, `say_sounds_read` ↻, `tv_lets_check` | 4.0 / 1.7 | The instruction, then the tile sounds one by one, then (TS) the word. TS: "Now let's say the sounds… and read the word." /a/ /m/ [am]: a "…" mid-instruction, and the sounds after both clauses. | 3 | the closing "…read the word: {word}" per word: 372 / 850 / 2,100 |
| 9 | `S.how-write` | "This is how we write {sound}." · "And this is how we write {sound}." | sound F | `Early.tsx` `FirstSoundLevel` `onRight` 1338, `SoundHuntLevel` 1456; `Warmup.tsx` `tapall.spellOn` 731, 863; `Dojo.tsx` `Learn` 469 (`audit_spell_it`, `audit_hear_see`); TS `tv_how_we_write`, `tv_and_how_we_write` | 3.8 / 3.1 | "This is how we spell…" / "And this is how we spell it." + 150 ms + /m/ (judge 9.9, n = 11). | 3 | one per teach moment: 41 / 114 / 172 spellings. Carrier only |
| 10 | `S.here-is` | "Here's the sound {sound}." · "Our first sound is {sound}." · "Here's the next new sound: {sound}." · "Here's a sound you learnt: {sound}." | sound F | `Dojo.tsx` `Learn` 449 (`listen` + /b/ + 500 ms + /b/), help 502, `Find.tap` 639; TS §3.9, §3.13, §3.26, §5.9: `tv_here_sound`, `tv_first_sound`, `tv_next_sound(_known)`, `tv_learn_first/next/another/last`, `tv_here_it_comes`, `tv_dojo_help_sound`, `tv_flower_recap`, `tv_another_sound`, `tv_listen_sound_again` | 1.1 / 2.7 (+ every new sound in TS) | Today, the bare "Listen…" and the sound twice (Jonas: "weird shouted, listen"). TS: about 12 suspended lead-ins, each + sound. | 4 (TS 3) | 3 · 1; 29 / 42 / 44 × ~12 lead-ins. Carrier only |
| 11 | `WS.way-we-spell` | "This is the way we spell {sound} in {word}." (the official formula, verbatim) | sound **M**, word F | `teach.ts` `wayWeSpell` 163 (via `introGem`, `newGem`, `foundScript`, `victoryScript` → `Tree.tsx`, `Intros.tsx`); TS §3.14 T11 `tv_here_sound` · `tg_<g>_<p>_way` | 2.3 / – (World Flower trips) | TS: "Here's the sound…" /m/ · "This is the way we spell **it** in mat." (two sentences, 47 `_way` clips). Fallback when the example word is taken: "This is the way we spell…" /m/ "…in…" [mat]: a sound mid-sentence, two joins. | 4 (fallback 5, TS 3) | 4 · 3 new spellings; canonical 41 / 114 / 172; any word: 1,303 / 2,584 → 2,780 / 3,009 → 6,773 (word × spelling) |
| 12 | `WS.starts-with` | "{Picture} starts with {sound}." | word I, sound F | `Early.tsx` `FirstSoundLevel` `onRight` 1329; `feedback.ts` `pictureCorrection` (the model after `tv_fix_together`); TS `fs_<w>` | 4.5 / 1.4 | **Whole sentence per picture up to the sound** (`fs_<w>`, 26 recorded) + 120 ms + /m/ (judge 8–10). Fallback: [word] + "starts with…" + /m/. | 2 (fallback 5) | 9 · 2; 128 / 228 → 245 / 249 → 800 pictures |
| 13 | `S.say-with-me` | "Tap the petal, and say {sound} with me." · "Now you tap it, and say {sound}." · "Tap the letter, and say {sound} with me." · official: "Yes, you can hear {sound}. Everyone say that sound." | sound **M** or F | `Dojo.tsx` `Learn` 426 (the recap: /b/ + letters + `dojo_tap_say`), idle; `Warmup.tsx` `noticeShow` 1427; `teach.ts` `introPetal` 146, `introGem` 187 (`t_everyone_say`); TS `tv_petal_say`, `tv_petal_first`, `tv_new_petal_say`, `tv_tap_it_say(_short)`, `tv_tap_letter_say`, `tv_petal_say_short`, `tv_once_more`, `tv_dojo_idle_say`, `tv_rw2_tap_petal`, `tv_flower_tap` | 0.9 / 2.2 (+ each new sound in TS) | The sound first, then "Tap it, and say it with me!", or "Say that sound with me!" + /s/. In TS the instruction never names the sound ("…and say it with me."), apart from `tv_dojo_idle_say`, "Tap the letter, and say the sound with me…" /b/. Jonas's "say the sound a". | 4 | 3 · 1; 29 / 42 / 44 × ~10 phrasings. Carrier halves |
| 14 | `W.say-slowly` | "Now tap the tortoise, and say {word} slowly with me." · "I'll say {word} slowly: {word~slow}." · "The tortoise says {word} slowly: {word~slow}." | word **M**, word~slow F | `Warmup.tsx` `fastslow` 593–596, 1365 (`fm_slow`, `fm_tap_tortoise`); `Early.tsx` `BuildOne.runDemo` 1701 (`build_ido_1` + word + `build_ido_2` + stretch); TS `tv_ts_slow`, `tv_ts_slow_one`, `tv_i_say_slowly`, `fm_tap_tortoise` ↻, `fm_tap_rabbit` ↻ | 1.9 / 0.5 | "I say it slowly…" + *aaammm*; "Or I can say it slowly…" + stretch; "…say it slowly with me." with no word. Jonas's "say mat slowly". | 4 | 30 · 12; 372 / 850 / 2,100 × 2 |
| 15 | `S.letters` | "It's two letters, but it's one sound: {sound}." | sound F | `narrate.tsx` `lettersSay` 104, `lettersReminder` 153 (read-backs in `Dojo`, `Battle`, `Run`, `Swap`, `Story`); `Sort.tsx` chests 460; `feedback.ts` split correction 42 | – / 3.3 | `t_two_letters` (+ /k/ /s/ for < x >), 250 ms, the sound as a petal. | 2 | 13 / 71 / 124 multi-letter spellings. Carrier only |
| 16 | `S.listen-for-word` | "Listen for the word: {sounds}." · "My sounds are {sounds}." | sounds F | `Run.tsx` cue 683–688, help 1008, loop 1515; `Warmup.tsx` `sounds` 1201, 1214; `feedback.ts` `pictureCorrection` 88, 100; TS `tv_guess_q`, `tv_my_sounds`, `tv_guess_again`, `tv_run_fix` | 2.6 / 2.0 | A cue line + the sounds (neutral dots). W5 today: [sounds] then "Which picture is it?". | 2 | carriers only (the sounds are the question) |
| 17 | `S.thats-we-need` | "That's {sound_a}. We need {sound_b}." · "That's how we write {sound_a}, but we need {sound_b}." · official: "It's this one. Say {sound} as you put it on the line." | sound F + sound F; sound **M** | `feedback.ts` `correction` 42, 45, `pictureCorrection` 98; `Dojo.tsx` `Find.tap` 639; `Run.tsx` `catchLantern` 901 (`that_says` + sounds + word + `listen` + sounds) | 0.4 / 1.1 | "That's…" /s/ · "We need…" /m/ · "It's this one. Say the sound as you put it on the line." (the sound isn't named where it is asked for). | 4 | sound pairs from the tiles on screen. Carriers only |
| 18 | `N.reader-says` | "{Kai} says {word}." · "Yes! {Suki} read it right: {sounds}, {word}." | name I, word F | `Early.tsx` `ReadOne.readersRead` 1990; TS §3.16 B `kai_says`, `suki_says`, `tv_yes_<reader>`, `tv_right_<reader>`, `tv_lets_check` | 2.3 / 1.1 | "Kai says…" + 100 ms + [at] (judge 10, n = 13). The names are whole-sentence families. | 2 | 2 readers × read words: R 372 (×2) |
| 19 | `S.which-middle` | "Which one has {sound} in the middle?" … {word_a~slow}, {word_b~slow} | sound **M** | `Early.tsx` `SoundHuntLevel` 1443; TS §3.19 `tv_hunt_q` · `tv_swap_both` | 1.1 / 0.5 | "Which one has this sound in it?" + /i/ + two stretched words. TS: "Which one has this sound in the middle…" /i/. | 4 | vowels: 5 / 20 / 24. Carrier halves |
| 20 | `W.example-list` | "You can hear it in {w1}, {w2} and {w3}." · "We see this spelling in {w1} and {w2}." | words, a list | `teach.ts` `hearIn` 137, `weSeeIt` 174, `introGem` 187, `foundScript` 319 | 1.9 / – | **Whole sentences** `tp_<p>_hear` (32), `tg_<g>_<p>_see` and `_like` (47 each). Fallback when a word is already used on screen: `t_you_can_hear_it_in` / `t_we_see_it_in` / `t_like_in` + word clips 260 ms apart + "…and…" (`list()` 63). | 2 (fallback 5) | 111 / 270 / 388 (sounds + 2 × spellings) |
| 21 | `WS.has-middle` | "{Picture} has {sound} in the middle." | word I, sound **M** | `Early.tsx` `SoundHuntLevel` `onRight` 1451 | 1.1 / 0.5 | `mid_<w>` "Pin has this sound in the middle…" (14 recorded) + /i/. Fallback [word] + "has this sound in the middle…" + /i/. | 3 | 6 · 1; 79 / 147 → 158 / 156 → 501 three-sound pictures |
| 22 | `N.won-back` | "You won back {n} sounds: {s1} and {s2}!" | number M, sounds F (a list with "and") | `App.tsx` `Reward.talk` 865; TS §5.7 `tv_won_one` … `tv_won_four` | 1.1 / 0.9 | Today `petal_got` / `petals_got` name no sound. TS: "You won back two sounds…" /m/ /s/. | 3 | 4 counts × sound lists. Carriers only |
| 23 | `S.find-with` | "Find every picture with {sound} in it." · "Find the pictures that start with {sound}." | sound **M** or F | `Warmup.tsx` `tapall` 716; `Placement.tsx` `question` 161; TS `tv_pocket_more_<p>`, `tv_pocket_middle_more_<p>`, `tv_find_words_in`, `tv_place_findall_round` | 0.9 / 0.1 | "Tap all the pictures with this sound in them…" + /a/; "Find every word with this sound in it…" + /ae/. | 3.5 | ~4 phrasings × sounds. Carrier halves |
| 24 | `WS.first-is` | "The first sound in {word} is {sound}." | word M, sound F | `Early.tsx` `BuildOne.runDemo` 1701–1720; TS §3.16 A, §3.18 `tv_first_is` | 0.9 / 0.3 | Today: "Now I find each sound, one at a time." then [word~slow] + /a/ per slot, as separate calls. TS: "The first sound is…" /a/. | 3 | demo words (one per building level) up to all words |
| 25 | `W.this-is` | "This is {word}." · "This word is {word}." | word F | `Swap.tsx` effect 272, `ask` 290; `Early.tsx` `present` 998 (fallback) | 0.6 / 0.5 | "This is…" + [mat] (judge 9.2: "isolated downward intonation on 'mat' reveals it"). TS retires it in Swap. | 4 | swap start words ≈ chains: 20 / 45 / 70 |
| 26 | `S.stays-same` | "{sound} stays the same." | sound **I** | `Swap.tsx` `tapPos` 407 | 0.2 / 0.4 | "That's…" /t/ · "That sound stays the same." · "Listen…" [pat] [mat]. | 4 | sounds. Carrier (sound-initial!) |
| 27 | `S.another-way` | "This is another way to spell {sound}." (official, verbatim) · "You found a new gem! It's a spelling of {sound}." | sound F | `teach.ts` `introGem` 187 (`another`), `foundScript` 319 (`wf_found_gem`); `Dojo.tsx` `Learn` (`same_sound_new`); TS §4.6 `tv_and_another_way` | – / 0.5 (Year One, every new spelling) | "This is another way to spell the sound…" + /ae/. | 3 | second and later spellings: 12 / 72 / 129 |
| 28 | `S.they-all` | "They all start with {sound}." · "They all have {sound} in them." · "Look! This one starts with {sound}." | sound F / **M** | `Warmup.tsx` `tapall` 813, 851–853; `Stickers.tsx` (`fm_rw2_s`) | 0.8 / 0.2 | `fm_found_both`, `fm_all_start`, `t_they_all_have`, `fm_look_this` + /s/ (judge 10). | 2 | sounds × 4 phrasings |
| 29 | `SS.can-be` | "This can be {sound_a}, but in this word, it's {sound_b}. Say {sound_b} here." (official, verbatim) | sound **M**, sound F | `narrate.tsx` `twoSoundsReminder` 167 → `teach.ts` `canBe` 260; `teach.ts` `twoSounds` (Tree) | – / 0.2 (rises sharply in the Extended Code) | "This can be…" /a/ "…but in this word, it's…" /ae/: a sound mid-sentence, joins on both sides. The judge scored the first join 9.0 (n = 3) and the second 5.5 (n = 2, a bad /th/ take). | 5 | spellings with more than one sound: 3 / 22 / 37 (sound pairs 3 / 49 / 84). Carrier halves |
| 30 | `W.slow-word` | "Here's my slow word: {word~slow}." · "Here's your slow word: {word~slow}." | word~slow F | `Warmup.tsx` `slowpick` 634, 656; `feedback.ts` `pictureCorrection` 86; TS `tv_slow_demo`, `tv_slow_yours`, `tv_slow_again` | 0.4 / 0.1 | Lead-in "…" + the stretched word (judge 10). | 3 | Slow Words pictures, about 10 |

The scores behind the order are as follows. Where the preschool and whole-journey rates differ, the higher one is used.

| # | template id | frequency × awkwardness |
|---|---|---|
| 1 | `W.position-q` | 30 |
| 2 | `W.your-word` | 30 |
| 3 | `W.listen-again` | 27.6 |
| 4 | `WW.change` | 18 |
| 5 | `S.which-starts` | 15.2 |
| 6 | `W.name` | 13.8 |
| 7 | `S.which-write` | 12 |
| 8 | `S.say-read` | 11.9 |
| 9 | `S.how-write` | 11.4 |
| 10 | `S.here-is` | 10.9 |
| 11 | `WS.way-we-spell` | 9 |
| 12 | `WS.starts-with` | 9 |
| 13 | `S.say-with-me` | 8.6 |
| 14 | `W.say-slowly` | 7.5 |
| 15 | `S.letters` | 6.6 |
| 16 | `S.listen-for-word` | 5.2 |
| 17 | `S.thats-we-need` | 4.6 |
| 18 | `N.reader-says` | 4.5 |
| 19 | `S.which-middle` | 4.5 |
| 20 | `W.example-list` | 3.8 |
| 21 | `WS.has-middle` | 3.4 |
| 22 | `N.won-back` | 3.4 |
| 23 | `S.find-with` | 3.3 |
| 24 | `WS.first-is` | 2.8 |
| 25 | `W.this-is` | 2.2 |
| 26 | `S.stays-same` | 1.6 |
| 27 | `S.another-way` | 1.5 |
| 28 | `S.they-all` | 1.5 |
| 29 | `SS.can-be` | 1.2 |
| 30 | `W.slow-word` | 1.2 |

---

## 2. The rest of the inventory

| # | template id | natural text | slots | where used | per 10 min | today | awk | combinations |
|---|---|---|---|---|---|---|---|---|
| 31 | `W.sort-where` | "Where does {word} go?" · "Tap the chest with the same spelling as {word}." | word M/F | `Sort.tsx` the falling word, `wrongChest` 689 (`listen` + word + blend), help 799, idle 829; TS §4.3 | – / 0.5 (sorting levels) | a bare word; [word] + "Tap the chest with the same spelling as the word." | 3 | Bridging Unit 90 words, then every Extended Code sound unit's words |
| 32 | `SS.same-spelling` | "The same spelling can sometimes be {sound_a}, like in {word_a}, and sometimes {sound_b}, like in {word_b}." (official) | sound M, word M, sound M, word F | `teach.ts` `sameSpelling` 245 (`Dojo.tsx` `Learn` 420, `Tree.tsx`) | < 0.1 (Lesson 10 in every Extended Code spelling unit) | five clips: `t_same_spelling_sometimes` + /th/ + `st_th_moth_sometimes` + /dh/ + `tg_th_dh_in` | 5 | sound pairs 3 / 49 / 84 × an example word each |
| 33 | `S.diff-spellings` | "{sound}: different spellings, but the same sound." · "Let's remember the ways to spell {sound}: {w1}, {w2} and {w3}." | sound M / F, words | `teach.ts` `sameSound` 231 (`worldScript`, the petal tap in `Tree.tsx`) | < 0.1 | "Different spellings of…" /ae/ "…but it's the same sound!" + a spliced list | 5 | sounds with more than one spelling: 9 / 25 / 35 |
| 34 | `N.ways` | "Now you know {n} ways to spell {sound}." | number M, sound F | `teach.ts` `waysLine` 226 | – / 0.2 (Year One trips) | `t_ways_<n>` (9, a family) + /ae/ | 2 | 9 counts. Carrier family |
| 35 | `S.petal-for` | "This is the petal for {sound}." | sound F | `Stickers.tsx` 468 (`audit_petal_means`); `Intros.tsx` `FlowerIntro` 58 (`flower_i2`); TS `tv_flower_petal` | once per save | lead-in + /s/ | 3 | sounds |
| 36 | `SS.swap-sounds` | "Take out {sound_a}, and put in {sound_b}." (the official narrator: "take out the sound mmm … and replace it with the sound ss") · "And in goes {sound}." | sound M, sound F | `Swap.tsx` (knock and pick, `sayPick` 337); TS `tv_swap_kick`, `tv_swap_in` | 0.3 / – (the Sound Swap demo) | "The first sound changes. Can you tap it, and kick it out?" · "And in goes…" /s/ | 3 | swap steps × 2 sounds. Carrier halves |
| 37 | `S.build-with` | "Next, let's build some words with {sound}." | sound F | TS `tv_next_build` | ~0.2 | lead-in + /i/ | 3 | sounds |
| 38 | `WS.if-it-was` | "If it was {word}, this would be {sound_a}. Is it? No, it's {sound_b}." (official: "If this were 'bat', this would be a … /b/. Is this /b/?") | word M, sound F, sound F | `Early.tsx` `ReadOne.pickReader` 2087 | < 0.1 | five joins: `if_it_was` + [word] + `this_would_be` + /x/ + `is_it_no` + /y/ | 5 | read-check pairs (words) |
| 39 | `WS.gap` | "Which spelling of {sound} is in {word}?" | sound **M**, word F | `Placement.tsx` `question` 160 | 0.2 (placement only) | `place_gap` + /ae/ + `place_gap_in` + [word]: a sound mid-sentence | 5 | spellings × words |
| 40 | `W.find-pic` | "Your word is {picture}. Can you find the {picture}?" · "Can you find the {picture}?" · "Where's the {picture}?" · "Which one is {word}?" | word **M**/F | `Warmup.tsx` `tap` 529, 539; `Early.tsx` `ListenLevel.mk` 1242 (`listen_tap` + word); `Placement.tsx` 157 (`place_tap` + word); TS `tv_your_word_<w>`, `tv_find_again_<w>`, `tv_idle_look_<w>` | 0.4 / 0.2 | **Families** (TS, one recording per word: sock only so far). `listen_tap` / `place_tap` + word splices remain. | 1 (splices 4) | pictures × 3: 384 / 735 / 2,400 |
| 41 | `W.i-hear` | "I can hear {picture}!" · "I can hear {picture}. So I tap the {picture}." · "I can hear it in {word}." | word F / **M** | `Early.tsx` `ListenLevel` 1245 (`i_can_hear` + word); TS `tv_i_hear_<w>`, `tv_guess_so_<w>`, `tv_hear_in_<w>` | 0.2 | families + one splice | 1 (splice 3) | demo pictures: under 20 |
| 42 | `W.different-start` | "{Picture} starts with a different sound." | word I | `feedback.ts` `pictureCorrection` 91 (`fm_diff_<w>`); `Warmup.tsx` `tapall.onWrong` 807 | 0.3 | a family (5 recorded) + `tv_fix_start` + /s/ | 1 | pictures |
| 43 | `WS.not-in` | "{Picture} doesn't have {sound} in it." | word I, sound **M** | `feedback.ts` `pictureCorrection` 93 (`fm_not_in_<w>`) | 0.1 | "Dog doesn't have that sound in it." (the family avoids the sound) + "Listen for the middle…" /a/ | 3 | three-sound pictures |
| 44 | `W.spelt-like-this` | "In {word}, it's spelt like this." | word I–M | TS §4.3 `tv_spelt_like_this_<w>` (the first sort) | once per save | a family (14 recorded) | 1 | the chest example per spelling: 12 / 72 / 129 |
| 45 | `W.tap-hear` | "Tap the {picture}, and listen to how it starts." | word **M** | TS §3.5 C `tv_tap_hear_<w>`, `tv_now_tap_hear_<w>` | once per save | a family | 1 | 2 today |
| 46 | `WW.pair` | "I'll go first. Here's a {w1} and a {w2}." · "Here I go. {w1}… {w2}. Which row did I read?" · "{W1} {w2}!" | words M | TS `tv_ido_pair_<pair>`, `tv_which_q_<pair>`, `tv_which_fix_<pair>`; `fm_read_<pair>`, `fm_pair_<pair>`, `fm_triple_<three>` | 0.6 / 0.2 | families (8 + 4 + …) | 1 | fixed demo pairs, about 20 |
| 47 | `WW.notice` | "{W1} and {w2} both start with {sound}." | words I, sound F | `Warmup.tsx` `noticeShow` 1419 (`fm_notice_sun_sock`) | once | whole sentence + /s/ | 2 | 1 |
| 48 | `S.help-look` | "Let me show you: {sound}." · "Listen for {sound}." | sound F | `Dojo.tsx` 611, 775; `Battle.tsx` 1180; `Swap.tsx` 567 (`help_look` + sound); `Dojo.tsx` `Find` help (`dojo_find` + sound + `help_listen`) | Help only | lead-in + sound, or a sound followed by an instruction | 3 | sounds |
| 49 | `W.help-word` | "{word}. Tap the sound tiles, one sound at a time." · "Which sound comes next in {word}?" | word I / F | `Dojo.tsx` `Build` idle 764 (`which_sound` + word), help 771; `Battle.tsx` 1170, 1177 | Help and idle | a word before or after an instruction | 3 | words |
| 50 | `W.catch` | "Catch the word {word}." · "Read the word, and catch its picture." | word F | `Run.tsx` 1515 (`run_catch` + word); TS §4.5 | < 0.2 | lead-in + word | 3 | Ninja Run's reading words |
| 51 | `W.story-title` | "This story is called {title}." | title F | `Story.tsx` `TitleStep` 418 (`story_start` + title clip); TS `tv_story_title` | 0.3 | lead-in + the title recording | 2 | stories: 6 today, about 60 in the official Initial and Extended Code readers |
| 52 | `W.story-q` | "Now a question about the story: {question}" | question F | `Story.tsx` `QuestionPage` 907, `ChoicePage` 803 (page + `audit_story_choice`) | 0.3 | two whole sentences joined | 2 | one per story question |
| 53 | `W.special` | "This is '{word}'. Just say '{word}' here." (official) | word **M** ×2 | `Story.tsx` (`SPECIAL_LINE`, `audit_special_<w>`) | 0.7 | a family (9 recorded) | 1 | special words: about 30 (`SPECIAL_WORDS`) |
| 54 | `S.say-here` | "This is {sound}. Say {sound} here." (the official correction for an untaught spelling) | sound M ×2 | `teach.ts` `sayHere` 265 (**exported, never called**) | 0 | `this_is` + sound + `t_say_it_here` | 5 | sounds |
| 55 | `SS.does-it-have` | "Does this word have {sound_a} or {sound_b}?" (official, Lesson 10) | sound M, sound F | `teach.ts` `whichSound` 271 (**exported, never called**) | 0 | `t_does_it_have` + /o/ + `t_or` + /oe/ | 5 | sound pairs 3 / 49 / 84 |
| 56 | `W.run-wrong` | "That's {word_a}: {sounds}. Listen: {sounds}." | sounds M, word M | `Run.tsx` `catchLantern` 901; TS `tv_run_fix` | 0.2 | `that_says` + sounds + [word] + `listen` + sounds | 4 | Ninja Run's lantern words |
| 57 | `N.families` | "Welcome to {land}!" · "Next is a new game, called {game}." · "Today in the dojo, I'm going to teach you {n} new sounds." · "Now you find the other {n}." · "{Suki} read it right." | name / number **M** | `App.tsx` `WorldMap` 577 (`world_<n>`); `narrate.tsx` `mapPreview`; `games.ts` `fillLine` 279 (`<n>`, `<game>`, `<reader>`, `<pair>`, `<p>`, `<w>`) | `world_<n>` 3.6 / 0.1; the rest < 1 | whole families: 6 + 12 + 4 × 3 + 2 + 2 + … | 1 | about 60 / 80 / 110 |
| 58 | `S.pocket-frame` | "In Pocket Hunt, we find pictures that start with {sound}." | sound F | TS `tv_pocket_frame`, `tv_pocket_recap` | once per save, then recaps | "…that start with this sound." (the petal on screen) | 2 | sounds |
| 59 | `C.caption` | the caption of any composed sentence | all | `audio.ts` `sayNow` caption parts, `captionParts`; `ui/nav.tsx` "last instruction" register (`onSay`) | every join, when grown-ups turn captions on | line texts joined with their "…", 🔊 for a hidden sound, a petal picture for a shown sound, “word” once revealed | 2–3 (visual) | follows the templates |

---

## 3. Whole-sentence families that exist today (approach b)

These already avoid the splice by recording one sentence per member. Recorded counts are files in `public/a/l/` (some families also carry `.words.json`).

| Family | Text | Recorded | Value space | Needed: R / →Y1 / all |
|---|---|---|---|---|
| `fm_name_<w>` | "This is a sock." | 56 | pictures | 128 / 245 / 800 |
| `fs_<w>` | "Mop starts with…" + /m/ | 26 | first-sound pictures | 128 / 245 / 800 |
| `mid_<w>` | "Pin has this sound in the middle…" + /i/ | 14 | three-sound pictures | 79 / 158 / 501 |
| `fm_diff_<w>`, `fm_not_in_<w>`, `fm_tap_<w>` | "Moon starts with a different sound." … | 5, 2, 7 | pictures | 128 each / 245 / 800 |
| `tv_your_word_<w>`, `tv_find_again_<w>`, `tv_idle_look_<w>` | "Your word is sock. Can you find the sock?" … | 1 each | find-the-picture pictures | 128 each / 245 / 800 |
| `tv_tap_hear_<w>`, `tv_i_hear_<w>`, `tv_guess_so_<w>`, `tv_hear_in_<w>` | "Tap the sun, and listen to how it starts." … | 1–2 each | demo pictures | small |
| `tv_spelt_like_this_<w>` | "In kit, it's spelt like this." | 14 | a chest example per spelling | 12 / 72 / 129 |
| `tg_<g>_<p>_way` / `_in` / `_see` / `_like` | "This is the way we spell it in rain." … | 47 each (`_in` retiring) | spellings | 41 / 114 / 172 each |
| `tp_<p>_hear` / `_list` | "You can hear it in rain, tail and nail." | 32 each | sounds | 29 / 42 / 44 |
| `tv_ido_pair_<pair>`, `tv_which_q/fix_<pair>`, `fm_read/pair/triple_*` | "I'll go first. Here's a map and a hat." … | 8, 4, 10 | demo pairs | fixed |
| `tv_yes_<reader>`, `tv_right_<reader>` | "Yes! Suki read it right." | 2, 2 | readers | 2 each |
| `tv_learn_frame/all/recap/short_<n>`, `tv_won_<n>`, `tv_pocket_ready_<n>`, `t_ways_<n>` | "Today in the dojo, I'm going to teach you four new sounds." … | 3 × 4, 4, 2, 9 | counts | fixed |
| `world_<n>`, `tv_map_next_<game>` | "Welcome to Bamboo Village!" … | 6, 12 | lands, games | fixed |
| `audit_special_<w>` | "This is 'the'. Just say 'the' here." | 9 | special words | about 30 |

`scripts/gen-teach-lines.ts` (→ `teach-lines.gen.ts`, 252 clips) and `playtest/voice/make-block.py` (the teacher-voice block) make these today. `gen-first-lines.ts` is named in FIRST_MINUTES §12 as the maker of the `fm_*_<w>` families.

---

## 4. Teacher-script lines whose natural wording puts a variable in the middle

TEACHER_SCRIPT §1 rule: "Each slot is its own clip, placed at the end of a sentence or alone between two sentences, never inside one." These are the lines where that rule bends the English. The "today" column says whether the middle slot is already solved by a whole-sentence family (fam), or worked around (wa). A workaround is a pronoun, "this sound", a "…" pause, or a second sentence.

| TS line (§) | TS text | natural wording | slot (position) | today | template |
|---|---|---|---|---|---|
| `tv_petal_say` (3.13), `tv_petal_first` (3.5 C), `tv_new_petal_say` (3.9), `tv_petal_say_short` (3.26), `tv_rw2_tap_petal` (3.8), `tv_flower_tap` (3.14) | "Tap the petal, and say it with me." | "Tap the petal, and say {s} with me." | sound M | wa ("it") | `S.say-with-me` |
| `tv_dojo_idle_say` (3.26) | "Tap the letter, and say the sound with me… /b/" | "Tap the letter, and say {b} with me." | sound M | wa ("…" + sound) | `S.say-with-me` |
| `tv_once_more` (3.26) | "Tap it once more, and say it again." | "Tap it once more, and say {b} again." | sound M | wa | `S.say-with-me` |
| `its_this_one` ↻ (5.4) | "It's this one. Say the sound as you put it on the line." | "It's this one. Say {m} as you put it on the line." (official) | sound M | wa | `S.thats-we-need` |
| `tv_here_sound` · `tg_<g>_<p>_way` (3.14, T11) | "Here's the sound… /m/ · This is the way we spell it in mat." | "This is the way we spell {m} in {mat}." (official, verbatim) | sound M, word F | wa (split, "it") | `WS.way-we-spell` |
| `mid_<w>` (3.19) | "Pin has this sound in the middle… /i/" | "{Pin} has {i} in the middle." | word I, sound M | fam + wa | `WS.has-middle` |
| `tv_hunt_q` (3.19) | "Which one has this sound in the middle… /i/" | "Which one has {i} in the middle?" | sound M | wa | `S.which-middle` |
| `tv_pocket_middle_more_<p>` (4.1) | "…Find the pictures with this sound in the middle… /o/" | "Find the pictures with {o} in the middle." | sound M | wa | `S.find-with` |
| `tv_find_words_in` (4.7), `tv_place_findall_round` (4.9) | "Find every word with this sound in it… /ae/" | "Find every word with {ae} in it." | sound M | wa | `S.find-with` |
| `t_they_all_have` (3.9 C) | "They all have the sound… /a/" | "They all have {a} in them." | sound M | wa | `S.they-all` |
| `fm_not_in_<w>` (3.9 C, 5.4) | "Dog doesn't have that sound in it." · "Listen for the middle…" /a/ | "{Dog} doesn't have {a} in it." | word I, sound M | fam + wa | `WS.not-in` |
| `tv_not_in_middle` (3.19) | "That one has a different sound in the middle." | "{Mat} has {a} in the middle, not {i}." | word I, sound M, sound F | wa | `WS.has-middle` |
| `tv_i_say_slowly` (3.16) | "I say it slowly… [am, slowly]" | "I'll say {am} slowly: {am~slow}." | word M | wa ("it") | `W.say-slowly` |
| `fm_tap_tortoise` ↻ (3.5 B, 3.9) | "Now you tap the tortoise, and say it slowly with me." | "Now tap the tortoise, and say {sun} slowly with me." | word M | wa | `W.say-slowly` |
| `fm_tap_rabbit` ↻ (3.5 B) | "Now tap the rabbit, and say it fast." | "Now tap the rabbit, and say {sun} fast." | word M | wa | `W.say-slowly` |
| `tv_ts_fast`, `tv_ts_slow`, `tv_ts_slow_one` (3.5 B, 3.9) | "The rabbit says words fast… [sun]" | "The rabbit says {sun} fast: {sun}!" · "The tortoise says {sun} slowly: {sun~slow}." | word M | wa | `W.say-slowly` |
| `first_sound_q`, `last_sound_q` (3.16) | "What's the first sound?" | "What's the first sound in {mat}?" (official) | word F-question | wa (the word hangs after) | `W.position-q` |
| `tv_last_first` (3.16) | "Now the last sound. Listen right to the end… [at, slowly]" | "What's the last sound in {at}? Listen right to the end: {at~slow}." | word M | wa | `W.position-q` |
| `tv_next_middle` (3.17) | "Now the next sound. It's in the middle… [mat, slowly]" | "What's the next sound in {mat}? It's in the middle." | word M | wa | `W.position-q` |
| `tv_first_is` (3.16, 3.18) | "The first sound is… /a/" | "The first sound in {am} is {a}." | word M, sound F | wa | `WS.first-is` |
| `tv_lets_say_read` (3.16) | "Now let's say the sounds… and read the word. /a/ /m/ [am]" | "Now let's say the sounds, {a} {m}, and read the word: {am}." | sounds M, word F | wa | `S.say-read` |
| `tv_yes_<reader>` (3.16 B) | "Yes! Suki read it right. /a/ /m/ [am]" | "Yes! {Suki} read it right: {a} {m}, {am}." | name I, sounds and word F | fam + wa | `N.reader-says` |
| `kai_says`, `suki_says` (3.16 B) | "Kai says… [at]" | "{Kai} says {at}." | name I, word F | fam-like (one per reader) | `N.reader-says` |
| `tv_swap_change_to` (3.20) | "I'll change it to… [sat]" | "I'll change {mat} to {sat}." | word M, word F | wa ("it") | `WW.change` |
| `tv_swap_now_change` (3.20) | "Now let's change it to… [sit]" | "Now let's change {sat} to {sit}." | word M, word F | wa | `WW.change` |
| `st_what_change` (3.20) | "What do we need to change?" | "{Sat} to {sit}. What do we need to change?" (official) | words I | wa (words said before, stretched) | `WW.change` |
| `tv_swap_kick` (3.20) | "The first sound changes. Can you tap it, and kick it out?" | "{m} changes. Can you kick {m} out?" · "Take out {m}, and put in {s}." (official narrator) | sound I/M | wa | `SS.swap-sounds` |
| `thats` · `stays_same` (5.4) | "That's… /t/ · That sound stays the same." | "{t} stays the same." | sound I | wa | `S.stays-same` |
| `tv_thats_write` · `we_need` (3.13 B, 5.4) | "That's how we write… /s/ · We need… /m/" | "That's how we write {s}, but we need {m}." | sound M, sound F | wa | `S.thats-we-need` |
| `tv_won_<n>` (3.14, 5.7) | "You won back two sounds… /m/ /s/" | "You won back two sounds: {m} and {s}!" | number M (fam), sounds in a list M | fam + wa | `N.won-back` |
| `tv_x_two_sounds` (3.26) | "This spelling is two sounds together. /k/ /s/" | "This spelling is two sounds together: {k} and {s}." | sounds in a list M | wa | `S.letters` |
| `t_ways_<n>` (3.14) | "Now you know three ways to spell…" /ae/ | "Now you know {three} ways to spell {ae}." | number M, sound F | fam | `N.ways` |
| `tv_pocket_ready_<n>` (3.5 D) | "Now you find the other two. Are you ready?" | as written | number M | fam | `N.families` |
| `tv_learn_frame_<n>` and siblings (3.26, 4.1) | "Today in the dojo, I'm going to teach you four new sounds." | as written | number M | fam | `N.families` |
| `tv_map_next_<game>` (5.8), `world_<n>` | "Next is a new game, called Word Building." | as written | name M | fam | `N.families` |
| `tv_ido_pair_<pair>` (3.13) | "I'll go first. Here's a map and a hat." | as written | words M | fam | `WW.pair` |
| `tv_which_q_<pair>`, `tv_which_fix_<pair>` (3.7 C, 3.10) | "Let's listen again. Cat… dog. Which row has the cat first?" | as written | words M | fam | `WW.pair` |
| `tv_your_word_<w>`, `tv_find_again_<w>`, `tv_idle_look_<w>` (3.5 A) | "Your word is sock. Can you find the sock?" | as written | word M | fam | `W.find-pic` |
| `tv_tap_hear_<w>`, `tv_now_tap_hear_<w>` (3.5 C) | "Tap the sun, and listen to how it starts." | as written | word M | fam | `W.tap-hear` |
| `tv_guess_so_<w>` (3.11) | "I can hear sun. So I tap the sun." | as written | word M | fam | `W.i-hear` |
| `tv_spelt_like_this_<w>` (4.3) | "In kit, it's spelt like this." | as written | word I | fam | `W.spelt-like-this` |
| `fs_<w>` (3.5 D, 3.13) | "Mop starts with… /m/" | "{Mop} starts with {m}." | word I, sound F | fam | `WS.starts-with` |
| `fm_diff_<w>` (3.5 D, 5.4) | "Moon starts with a different sound." | as written | word I | fam | `W.different-start` |
| `fm_notice_sun_sock` ↻ (3.5 C) | "Sun and sock start with the same sound… /s/" | "{Sun} and {sock} both start with {s}." | words I, sound F | fam (one line) | `WW.notice` |
| `audit_special_<w>` (Story) | "This is 'the'. Just say 'the' here." | as written | word M ×2 | fam | `W.special` |
| `tv_rc_q` / `tv_choose_q` | "Who read it right? Tap Kai, or tap Suki." | as written | names M | fixed | – |

**46 rows (58 line ids).**

| Kind | Rows | What it means |
|---|---|---|
| fam | 15 | Whole-sentence families (counting `kai_says` / `suki_says`). The middle is already natural, at the cost of one clip per member. |
| wa | 26 | Workarounds, spoken with "it", "this sound", a "…" pause or an extra sentence. |
| fam + wa | 4 | Families that still defer a sound: `mid_<w>`, `fm_not_in_<w>`, `tv_yes_<reader>`, `tv_won_<n>`. |
| fixed | 1 | A fixed line. |

Of the 30 rows that still bend the English:

- **18 put a pure sound in the middle or at the start.** They can only be fixed by a carrier cut around the QA'd sound.
- **12 have word or name slots, or a word in the middle and a sound at the end.** Whole-sentence rendering can fix these: `tv_i_say_slowly`, `fm_tap_tortoise`, `fm_tap_rabbit`, `tv_ts_*`, the position questions, `tv_last_first`, `tv_next_middle`, `tv_first_is`, `tv_yes_<reader>`, and the three swap lines.

---

## 5. Consumers of composed sentences (whatever renders them must keep these working)

- **Captions.** `audio.ts` `sayNow` builds one caption per `say()`. The parts are the line texts, "🔊" for a hidden sound, a petal picture for a shown sound, and “word” once revealed. A trailing "..." is dropped. A templated sentence needs its full text with the slot, and the slot's part (a petal for a sound) at its place in the sentence.
- **Hear it again and the nav register.** `ui/nav.tsx` keeps the last `say()` item list (`onSay`), and many scenes keep their own `bundle` or `told` arrays (`Early.tsx` `bundle`, `Swap.tsx` `told`, `Dojo.tsx` `full`). A template must stay one replayable `Say` item, or a short list of them.
- **Clip-timed pictures.** `onClip`, `onSoundCue` (a petal rises up to 250 ms before its sound) and `wordTimes` (spotlights on the words of a list clip, `word-times.ts`) all follow clips. A whole-sentence render needs word timings, so the card can light on "sock". A sound slot needs its cue at the sound's start inside the sentence.
- **The transcript and QA tooling.** The bot logs clip ids (`line id`, `word:`, `stretch:`, `sound:`). `jev-lint-lines`, the treadmill's "one take, or joined?" stage (FIRST_MINUTES §12 rule 5) and `playtest/**/joins.json` all read those ids. New template ids need the same logging.
- **Preload, the service worker and memory.** `Swap.tsx` and `Sort.tsx` preload their words' clips. The service worker cache is versioned by a hash of `public/a`. Decoded audio has a 64 MB budget, kept by the LRU (PERF.md). Per-word sentence clips multiply what a level preloads, by about 3–10 times per word.

---

## 6. The value spaces (from the content)

New values per unit are shown as the median [range]. "Data today" is `src/content/units/*.ts`; "planned" follows the brief and DECISIONS.md.

| Space | per IC unit (R) | per EC unit (Y1) | R | → Y1: data → planned | all: data → planned |
|---|---|---|---|---|---|
| words | 30 [6–90] | 12 [1–40] | 372 | 790 → 850 | 933 → 2,100 |
| pictures (+17 picture-only words) | 9 [2–24] | 2 [0–14] | 128 | 228 → 245 | 249 → 800 |
| three-sound pictures | 6 [0–17] | 1 [0–13] | 79 | 147 → 158 | 156 → 501 |
| word × question kind (first / next / last) | 89 [15–269] | 35 [3–114] | 1,106 | 2,287 → 2,461 | 2,674 → 6,019 |
| word × spelling | 89 [15–302] | 37 [3–122] | 1,303 | 2,584 → 2,780 | 3,009 → 6,773 |
| swap steps (chains) | 10 [0–21] | 4 [0–4] | 137 | 209 → 225 | 289 → 650 |
| sounds | 3 [0–5] | 1 [0–1] | 29 | 42 | 44 |
| spellings (spelling→sound) | 4 [0–12] | 3 [0–7] | 41 | 114 | 172 |
| multi-letter spellings | – | – | 13 | 71 | 124 |
| spellings with more than one sound (sound pairs) | – | – | 3 (3) | 22 (49) | 37 (84) |
| sounds with more than one spelling (second and later spellings) | – | – | 9 (12) | 25 (72) | 35 (129) |
| sentences in the unit files | 8 [0–8] | 8 [6–8] | 72 | 264 | 442 |

The game as shipped today (`phonics.ts`, units 1–12) has 411 words, 154 pictures, 109 three-sound pictures and 1,371 word × spelling pairs.

---

## 7. Whole-sentence rendering: clips needed per tier

`estimate.py` (→ `estimate.json`) records every template that has a word, name or number slot as whole sentences, one clip per value and phrasing. Sound slots can't be recorded whole. They count as carrier pieces: about 35 sound templates × about 2 phrasings × up to 2 halves (before and after the pure sound), about 150 clips at every tier.

| Tier | Values used | Full set | Lean set | MB (full, about 22 KB a clip) |
|---|---|---|---|---|
| **Year R** (IC1–11 + Bridging) | 372 words, 128 pictures, 1,106 questions, 137 swap steps | **≈ 6,600** | **≈ 3,900** | ≈ 140 |
| **to the end of Year 1** (EC26) | 850 words, 245 pictures, 2,461 questions, 225 swap steps | **≈ 14,200** | **≈ 8,500** | ≈ 310 |
| **whole programme** (EC49) | 2,100 words, 800 pictures, 6,019 questions, 650 swap steps | **≈ 36,400** | **≈ 21,100** | ≈ 780 |

- **Full set.** It has:
  - 8 sentences per picture: name, find ×3, starts with, starts with a different sound, tap and hear, I can hear.
  - 2 prefixes per three-sound picture: has…, doesn't have….
  - 10 sentences per word: your word ×2, listen again, say slowly ×2, Kai says, Suki says, the "…in {word}." suffix, spelt like this, if it was.
  - One clip per word × question kind.
  - Two per swap step.
  - The example lists, special words, families and sound carriers.
- **Lean set.** It covers the top templates only, with one phrasing each:
  - name and starts with, per picture;
  - your word, listen again, say slowly, Kai says, Suki says and the "in {word}" suffix, per word;
  - the position questions and the swap steps;
  - the carriers and families.
- **Where the clips go.** In the full set, the word sentences (10 per word) and the position questions make up about 75% of the whole-programme total. The pictures are about 20%.
- **Limits.**
  - Files: today's `public/a` has 4,087 files, and `dist` 3,296. Workers static assets allow **20,000 files per version (Free) or 100,000 (Paid, Wrangler ≥ 4.34)**, and 25 MiB a file (Cloudflare Workers limits page). **Year R fits either plan as loose files.** To the end of Year 1 (≈ 14,200 + 4,100 ≈ 18,300 files) is close to the Free limit. The whole programme needs Paid, or per-unit sprites (about 60 units × a few files each).
  - Bytes: at about 0.8 GB, the whole programme can't be one service-worker cache. It needs per-unit caching.
  - Memory: decode is not the limit, because only the clips in play are decoded, under the 64 MB LRU. A sprite, though, decodes whole, so keep sprites per unit and per template.
- **Cost.** At about $0.00045 a two-second render (prior-art.md §6), the full whole-programme set is about $16 of TTS. The limits are QA time (blind transcription, and the "one take, or joined?" judge), file count and bytes.

---

## 8. Notes for the other lanes

1. **The official wording is the target.** §10.7 of the Sounds~Write research lists the phrases. Several of them are templates with the slot in the middle that the game either says in a stilted form or doesn't say at all:
   - "What is the first sound you hear in {word}?" is today's `W.position-q`, stilted.
   - "Yes, you can hear {s}. Everyone say that sound." and "Say {s} as you pull it onto the line." are today's `S.say-with-me`, stilted.
   - "This is {s}. Say {s} here." is `teach.ts` `sayHere`, which is written but never called.
   - "Does this word have the {s_a} sound or the {s_b} sound in it?" is `whichSound`, also never called.
   - "{Mat} to {sat}. What do you think we need to change?" is today's `WW.change`, broken.
2. **The biggest win is words, not sounds.** The three top templates and `WW.change` are all word slots, and those can be recorded whole. They cover 1,106 / 2,461 / 6,019 question clips and 372 / 850 / 2,100 words per phrasing.
3. **The sound-slot templates are fewer and carry less weight, but none can be recorded whole.** Of the 19 that want the sound in the middle or at the start, the first to try are `S.say-with-me` (Jonas's example), `WS.way-we-spell` (the official formula) and `SS.can-be` (the official correction). For these, record the carrier in one take around a placeholder, then cut it in two.
4. **The bare dictation word (13–17 per 10 minutes) is the single most frequent composition,** and the most hidden. It is a word card speaking on its own after praise ("Brilliant!" … "sat"). TEACHER_SCRIPT §3.18 keeps it deliberately from the third word on. Any sentence-per-word render for `W.your-word` should keep that fade.
5. **The fallbacks are the ugliest joins,** and they fire whenever a family member is missing:
   - `this_is_a` + word;
   - [word] + `starts_with` + sound;
   - [word] + `has_in_middle` + sound;
   - the spliced example lists with "…and…";
   - `t_way_we_spell` + sound + `t_in` + word.

   Pictures added faster than their families are recorded will hit these. The generator should run per content build.
6. **Measuring more precisely.** The transcripts log clips, not `say()` calls, so a composition is recovered by timing (a 0.7 s gap rule). A `say` group id in the bot's event log would make every count exact (see the request below).

---

## Requests for changes to files I may not edit

- **`src/engine/audio.ts`** (owned by the teacher-voice workflow): give each `sayNow` call an incrementing id, and pass it with every `onClip` and the bot's clip events. The transcript runners can then log `say: <id>` groups, and the next inventory counts compositions exactly instead of by timing.
- **`src/content/teach.ts`**: `sayHere()` and `whichSound()` are exported and never called, yet they are the official Sounds~Write correction ("This is /k/. Say /k/ here.") and the Lesson 10 question. Wire them in, or delete them, once the templates exist.
- **`src/scenes/Early.tsx` `usePickGame.present` 998**: the `this_is_a` / `this_is_an` + word fallback is still there, although FIRST_MINUTES §12 retired it. The same goes for [word] + `starts_with` (1329) and [word] + `has_in_middle` (1451). Pictures without a family member should fail the content check rather than splice.
- **`docs/DECISIONS.md`** (for integration to log):
  - "A session is 10 minutes of play for splice frequencies."
  - "Template ids are `W.`, `S.`, `WS.`, `WW.`, `SS.` and `N.` + a name, as in docs/speech-templates/inventory.md."
  - "The planned vocabulary (2,100 words and 800 pictures to EC49) sizes the whole-sentence estimates; the unit files hold 933 and 249 today."

---

## Evidence and scripts (`playtest/speech-templates/`)

| File | What |
|---|---|
| `scan-splices.ts` → `splices.tsv` | the AST scan of every mixed `Say[]` array (197 sites, file:line and enclosing function) |
| `freq.py`, `freq2.py` | transcript → line → slot joins (the gap rule, with the child's own taps excluded) |
| `linerates.py` → `linerates.json` | each line's rate per 10 minutes in run A and both journeys, with the slots that followed it |
| `bare.py` | the bare word prompts and slot clips per 10 minutes |
| `spaces.ts` → `spaces.json`, `gpcs.ts` | the value spaces per unit, from `src/content/units` and `sw.ts` |
| `estimate.py` → `estimate.json` | the whole-sentence clip estimates per tier |

To run them: `bun playtest/speech-templates/spaces.ts`, then `python3 playtest/speech-templates/linerates.py` and `python3 playtest/speech-templates/estimate.py`, from the repo root. `join-silence.py` and `experiments/` in the same folder belong to the prior-art lane.
