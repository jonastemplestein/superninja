# Speech templates: natural speech everywhere

*For Jonas's request of 27 Sep:*

> "Oh another huge thing: you gotta find an effective way to templatize the recordings and thus create more natural speech. So instead of saying 'say this sound: a' you can say 'say the sound a'. Or instead of 'say this word slowly: mat', you would say 'say mat slowly'. This needs to work super well and you need to research prior art and then work out how you can apply it everywhere in the game."

Written 27 Sep 2026 by the architect of the speech-templates workflow. It builds on the four lane reports in [speech-templates/](speech-templates/):

- [prior-art.md](speech-templates/prior-art.md): 62 sources on how other systems do it.
- [inventory.md](speech-templates/inventory.md): every spliced sentence in the game, in 59 rows.
- [experiments.md](speech-templates/experiments.md): 204 clips, blind-judged.
- [delivery.md](speech-templates/delivery.md): hosting, format, memory and the service worker.

There is working code behind this design. The reference implementation is in [`playtest/speech-templates/design/`](../playtest/speech-templates/design/): the parser, the grammar checks, `speak()`, the 122-template catalogue, 14 passing tests and the sizing script. [speech-templates/catalogue.md](speech-templates/catalogue.md) is generated from it and lists every template, its size, and what happens to each of the 297 lead-in lines in `lines.ts`.

> **(critic) Review, 27 Sep.** A critic pass re-read this design against the four lane reports, re-ran the tests, and ran 48 new TTS takes and 132 new judge calls. The scripts are in [`playtest/speech-templates/critic/`](../playtest/speech-templates/critic/), and the outputs are in `playtest/runs/speech-templates/critic/`.
>
> **What holds.** The tiers, the grammar and the delivery plan hold up. A whole take per value is still the only way the experiment found to put a word inside a sentence, and the file counts, bytes and decode memory are nowhere near a limit.
>
> **Where it would not have "worked super well":**
> 1. **Jonas's own example comes out choppy as a whole take.** Gemini puts a pause around a *mentioned* word: "Say… mat… slowly." In the experiment the whole take lost to today's shape on T1. In 48 new takes in four phrasings, the judge heard an odd pause around the word in a third of them. Every take whose longest pause inside the sentence was 250 ms or more scored worse. A fluency gate, and more takes for these templates, fix it (§3.3).
> 2. **The sound shape chosen here was never tested.** That shape is a "…" lead-in, then 250 ms, then the sound. Built from the experiment's takes, it lost to 150 ms, and it lost to both placeholder-cut carriers. The pilot now tests the lead-in style and the gap together (§6.1, §7.1).
> 3. **Picture sentences would come out ungrammatical.** They would say "This is a ear.", "This is a feet.", "This is a swim.", "This is a milk.", "Where's the feet?" and "Can you find the swim?". Whisper passes all of these. The content has no article, number or part-of-speech data, and the article rule misses /eer/ (R9, §9).
> 4. **Some word values are function words or homographs,** such as "to", "at", "it", "live", "read" and "tear". TTS reduces or misreads them, and Whisper can't tell (R10, §3.3).
> 5. **Smaller fixes:**
>    - Adopting old recordings adds a second code path for about 15 minutes of rendering saved, and it hides wording mismatches. For example, `tv_idle_look_sock` says "Have a look at each picture. Where's the sock?" but is adopted as "Where's the sock?". So nothing is adopted now (§1.5).
>    - The `word-after-lead` audit would flag the design's own sentence joins (§7.3).
>    - The render time is about 1.5× the estimate (§2.2).
>    - Offline play needs the fallback clips precached (§2.5).
>
> **Checked and fine:**
> - Numbers: number words inside the take, over small closed sets.
> - Names: Kai and Suki as whole takes.
> - The pure-sound rule: gain only, and the §1.6 placeholder is never shipped.
> - Decode memory: about 6 MiB a level.
> - File limits: about 27k of 100,000.
>
> Every change is marked **(critic)**. The risks still open are in §11.

---

## 0. The short version

1. **Two rules make templated speech sound natural.**
   - **A word, picture, name or number is said inside the sentence, in one take recorded for that value.** "Say mat slowly." is one clip per word. Words are never joined into a sentence at run time.
     - Evidence: whole-sentence takes won 72–92% of blind paired votes. A library word dropped into a carrier won 42%, and 28% after pitch and duration shaping.
     - **(critic) One take isn't automatically fluent.** On T1 ("Say {word} slowly."), today's "Say this word slowly… mat" beat the whole take in 61% of the fast judge's head-to-head votes and 67% of the Pro judge's.
       - Gemini said 5 of the 6 takes with a pause around the word ("Say, rain, slowly.").
       - The critic re-rendered 48 takes in four phrasings. The judge heard an odd pause around the word in 16 of them, and gave them a mean naturalness of 7.2–7.8 out of 10. "Can you find the {word}?" got 8.7, with an odd pause in 1 of 6.
       - Scores fell as the longest pause inside the sentence grew:
         - under 150 ms: 8.7, with an odd pause in 1 of 9 (3 takes of "Say {word} slowly." and the 6 of "Can you find the {word}?");
         - 150–250 ms: 7.6, with an odd pause in 7 of 23;
         - 250 ms or more: 7.0, with an odd pause in 14 of 28.
       - So the generator gates on fluency and picks the most fluent take (§3.3). Templates that talk *about* a word ("Say {word} slowly.", "Let's listen to {word} again.", "Where does {word} go?") need about 2 more takes each.
   - **A pure sound is always the checked clip from `/a/p/`.** It sits at the end of a phrase, after a lead-in recorded to end suspended: "Say the sound… /a/". Each phrase gets one sound, so two sounds need two lead-ins.
     - Evidence: "Change this sound… /s/ …to this sound… /m/" won 96% of its votes. "Change /s/ to /m/" as one sentence with gaps won 4%.
     - **(critic) The exact shape isn't settled.** The experiment never built a "…" lead-in with a 250 ms breath, and its two best T3 methods, C and D, both used a *placeholder-cut* carrier. That carrier is one take of "Say the sound ah.", cut before the placeholder, so the lead-in keeps the melody of a sentence that is still going.
       - The critic built the design's shape from the experiment's A takes and judged it blind, with 18 votes a pair:
         - it lost to 150 ms (6/18) and to both placeholder-cut carriers (C 6/18, D 6/18);
         - it beat 400 ms (12/18);
         - it was called spliced in 13–15 of 18 votes.
       - That's a direction, not a result. The pilot tests lead-in style × gap before anything is rendered at scale (§6.1).
   - **One exception to the word rule: a demonstration.** The slow way, the fast way or a blend can follow a lead-in the way a sound does ("And now the fast way… mat"). That's because the word there is being performed, not talked about.
2. **Jonas's two examples:**
   - "Say mat slowly." is template `w_say_slowly`: one take per word. That's 372 clips for Year R, 850 to the end of Year 1, and 2,100 for the whole programme.
   - "Say the sound /a/" is template `s_say_the_sound`: one lead-in clip, "Say the sound…", then the checked /a/ 250 ms after the speech ends. **(critic)** The pilot starts at 150 ms and also tries a placeholder-cut lead-in (§1.2, §1.6).
3. **122 templates cover all 59 inventory rows**, in four tiers (§2).

   | tier | what it is | templates | clips to render: Year R / to end of Year 1 / whole programme |
   |---|---|---:|---|
   | **whole** | one TTS take per value; words, pictures, names and numbers inside | 29 | 3,125 / 6,753 / 16,453 |
   | **sound** | speech pieces around the checked pure sound | 81 | 623 / 1,386 / 3,036 |
   | **sequence** | a whole sentence, then a clip standing alone | 12 | 16 / 16 / 16 |
   | **splice** | an offline prosody-matched join | 0 | reserved: for repairs, and for any future template whose value pairs outgrow the vocabulary |
   | **all** | | **122** | **3,764 / 8,155 / 19,505** (421 already recorded) |

4. **It's cheap, and it fits the hosting.**

   | tier | new clips | size at 24 kHz, 48 kbps | render time | TTS cost | files with today's ~4,200 |
   |---|---:|---:|---:|---:|---:|
   | Year R | 3,343 | 51 MB | 1.3 h | $2.39 | 8.0k |
   | to end of Year 1 | 7,734 | 108 MB | 3.0 h | $5.52 | 12.4k |
   | whole programme | 19,084 | 256 MB | 7.4 h | $13.63 | 23.7k |

   Workers Paid allows 100,000 files per version, so the whole programme uses 24% of it. Year R and Year 1 would fit even the Free plan's 20,000.

   **(critic) Realistic figures.**
   - **Takes.** `assets-src/audio-report.json` shows `gen-audio.ts` needs 2.7 takes for a full line (18% hit the 8-take cap) and 4.7 for a lead-in (up to 31). The fluency gate adds about 2 takes to each template that talks about a word, and the 421 clips once adopted are now rendered too (§1.5). So expect about 1.4–1.5× the render time and cost above:
     - Year R: about 2.0 h and $3.70;
     - to the end of Year 1: about 4.4 h and $8.00;
     - the whole programme: about 10.5 h and $19, doubling after 31 Dec.
   - **Files.** The ~4,200 today also grows with the vocabulary, because `/a/w/`, `/a/x/` and `/a/i/` add a file per word or picture. With that, the whole programme is about 27k files, 27% of the cap.
   - **Verdict.** Still no blow-up.
5. **The runtime stays small.**
   - `speak("w_say_slowly", { word: "mat" })` returns `Say[]` for `say()`.
   - `audio.ts` gets two new item kinds, `{ tpl }` and `{ join }`. It times joins on the audio clock, from each clip's measured speech edges. Today it waits for each clip's `onended`.
   - Captions and transcripts are built from the template's text. Every clip id, `t:<template>/<piece>-<key>`, maps back to its text.
   - The whole thing is pure data and pure functions, so the headless runner uses the same `speak()`.
6. **A clip is never missing.**
   - Every template over a large set of values has a fallback: a recorded whole sentence, then the clip on its own.
   - The build fails if any value the content can reach has no clip.
   - Fallbacks are counted in transcripts. The target is 0.
7. **Migration comes in four phases** (§6):
   - P0: the foundation (F1 `audio.ts`, F2 catalogue and core, the generator, F4 audits).
   - P1: a pilot. The top four offenders plus Jonas's two examples, Year R only, blind-tested by Jonas's ear before anything else is rendered.
     - **(critic)** Only the listening samples are rendered before the gate, not all 1,640 clips.
     - The pilot adds the lead-in-style × gap test for sounds, a question that ends on a sound (`s_which_starts`), and three 30-second stretches of real play.
   - P2: every lane in parallel.
   - P3: clean-up.
8. **Acceptance has four parts** (§7):
   - Listening targets for Jonas and the judge.
   - Machine gates on every clip.
   - Join timing within ±20 ms of the design.
   - Zero carrier-plus-colon constructions in the transcripts, plus file and decode budgets.

---

## 1. The template model

### 1.1 Syntax

A template is one sentence, or a short run of sentences, with slots in braces. The slot's type decides how it is made.

| slot | type | how it's said | example |
|---|---|---|---|
| `{word}`, `{word2}` | text | inside the TTS take | "Say {word} slowly." |
| `{picture}` | text | inside the take; `{picture~a}` adds its article ("a sock", "an ant", "the sun", with overrides from the content). **(critic)** The content has no such overrides today (the unit files carry `text, segs, unit, pic, tags` only), so the article and agreement come from a new noun sidecar (R9) | "This is {picture~a}." |
| `{name}` | text | inside the take (Kai, Suki) | "{name} says {word}." |
| `{n}`, `{count}` | text | a number word inside the take | "Now you know {n} ways to spell {sound}." |
| `{pos}` | text | first, next or last, inside the take | "What's the {pos} sound in {word}?" |
| `{title}`, `{examples}` | text | a story title or a canonical example list ("rain, tail and nail") | "You can hear it in {examples}." |
| `{sound}`, `{sound2}` | clip | the checked pure sound, `/a/p/<p>.mp3` | "Say the sound {sound}." |
| `{sounds}`, `{word~sounds}` | clip | pure sounds one by one, as tiles or dots | "My sounds are {word~sounds}." |
| `{word~slow}` | clip | the slow way, `/a/x/<w>.mp3` (pure sounds with gaps) | "Let's listen to {word} again. {word~slow}" |
| `{word~fast}` | clip | the word clip `/a/w/` as a performance: the rabbit's fast way, a model reading | "And now the fast way {word~fast}." |
| `{word~first}` | clip | the held first sound, `/a/o/` | – |
| `{word~bare}` | clip | the word clip on its own, between sentences (the dictation fade from the third word) | "{word~bare}" |
| `{spelling}`, `{sound}` as a key | key | never said aloud (a spelling said aloud would be letter names). It picks the value and the gem on screen | `ws_way_we_spell` is keyed by its spelling |

Punctuation carries the prosody:
- A clip slot that ends a sentence (`.`, `?`, `!`) or the text is at `end`.
- A clip slot followed by a comma or more words is at a `phrase` end. The words after it are recorded as a continuation starting with "…".
- A clip slot after a full stop stands `alone`.

### 1.2 How a template becomes clips

`parse()` cuts a template into three kinds of part:
- **speech pieces**: each is one TTS take. Where a piece has text slots, it is recorded once per value.
- **clip slots**.
- **joins** between them.

Pieces are numbered from 0 in speaking order. A piece's file is `/a/t/<template>/<piece>-<key>.mp3`, where the key is the piece's own text-slot values, or `_` when it has none.

| template | pieces, as recorded | files | joins |
|---|---|---|---|
| `w_say_slowly` "Say {word} slowly." | "Say mat slowly." | `w_say_slowly/0-mat.mp3` (one per word) | – |
| `s_say_the_sound` "Say the sound {sound}." | "Say the sound…" · /a/ | `s_say_the_sound/0-_.mp3` (one in all) | breath |
| `w_listen_again` "Let's listen to {word} again. {word~slow}" | "Let's listen to mat again." · /m/ · /a/ · /t/ | `w_listen_again/0-mat.mp3` | sentence |
| `ws_way_we_spell` "This is the way we spell {sound} in {word}." (the official formula, verbatim) | "This is the way we spell…" · /m/ · "…in mat." | piece 0 is `t_way_we_spell` (adopted); piece 1 is `tg_m_m_in` (adopted), or `ws_way_we_spell/1-mat.mp3` | breath, breath |
| `ss_can_be` "This can be {sound}, but in this word, it's {sound2}. Say it here." | "This can be…" · /a/ · "…but in this word, it's…" · /ae/ · "Say it here." | three adopted lines | breath, breath, sentence |
| `ws_starts_with` "{picture} starts with {sound}." | "Mop starts with…" · /m/ | `fs_mop` (adopted), or `ws_starts_with/0-mop.mp3` | breath |

**(critic)** Under §1.5's no-adoption rule, the "adopted" files in this table become their `/a/t/` pieces. For example, `ws_way_we_spell` is `0-_.mp3` and `1-mat.mp3`, and `ws_starts_with` is `0-mop.mp3`.

**Joins** are measured from where the speech ends to where the next clip's speech begins. They are not measured from file boundaries: clips carry 25–95 ms of edge silence, and WebKit adds 13–24 ms to the start of an MP3.

| join | length | where | why |
|---|---|---|---|
| `breath` | **250 ms** (a template may override it within 150–350 ms) | before a pure sound or a demonstration at a phrase end, and before the continuation after it | A pause over about 80 ms tells an English listener there's a boundary (7.6-fold odds; prior-art §7). That is what makes a pure sound a separate event. Today's pause before a slot is the scene's gap (150–500 ms), plus about 120 ms of silence baked into the clips' edges, plus the `onended` hop: about 270–620 ms, and different in every scene. The long end is the "quiz voice". Among the experiment's sound methods, D, with a 150 ms room-tone pause, scored best (59%). The differences there were under 20 points, so they don't settle it: Jonas's blind A/B of 150/250/400 ms picks the final value (§7.1). |
| `sentence` | **450 ms** | between two sentences, and before a clip that stands alone | Today's 350 ms beat gap plus the edge silence the clips carry now. Unchanged to the ear. |
| `tight` | 0–20 ms, 8 ms crossfade | only inside an offline splice (tier splice). Never at run time | The experiment's D joins inside a word both takes say. |

**(critic) Three changes to the `breath` join:**
- **Start the pilot at 150 ms, not 250.** 150 ms is D's value, the best of the experiment's sound methods. In the critic's blind run it also beat 250 ms, 12 votes to 6.
- **Fill the gap with the lead-in's own tail.** A lead-in keeps up to 300 ms of its take's trailing ambience, with no 60 ms trim or fade, so the gap isn't digital silence.
  - The judge named dead silence, room tone or background ambience in 10 of its 72 reasons.
  - D filled its pause with room tone.
  - The join is still timed from the speech edge.
- **Find speech edges relative to each clip's peak** (peak − 40 dB), not at a flat −45 dBFS. A quiet /h/, /f/ or /th/ onset is otherwise found late, and its breath comes out longer.

### 1.3 The grammar (build errors)

`check()` enforces these rules on every template, and the build fails on any error. The checks are in [`template.ts`](../playtest/speech-templates/design/template.ts), and [`template.test.ts`](../playtest/speech-templates/design/template.test.ts) proves the bad shapes fail and the winning shapes pass.

| rule | what | evidence |
|---|---|---|
| **R1** | Word, picture, name, number, position and title slots are said inside a TTS take, rendered once per value. They are never joined into a sentence at run time. | Experiments: whole takes won 72% of paired votes (T2 89%, T6 92%). Library clips in a carrier won 42%, and 28% processed. Two generic donor takes per word won 30%, and the judge heard the join 80–94% of the time. Black & Lenzo: "the voice quality switch midway in a sentence is extremely distracting". |
| **R2** | A pure-sound or demonstration slot ends an intonation phrase. If the sentence carries on after it, the continuation is at least 2 words and is recorded as its own phrase ("…in mat.", "…with me."). A lead-in before it is at least 2 words and is recorded suspended: a fall of 2 semitones or less over its last 300 ms. | Prior-art §7: listeners forgive joins at phrase boundaries and closures, and hear them in the middle of a phrase. The official Sounds~Write wording puts the sound at a phrase end ("This is the way we spell /k/ in this word."). |
| **R3** | One clip slot per phrase: two sounds need two lead-ins. | T4: two lead-ins won 96% of votes, one sentence with gaps 4%. Whisper even merged "/s/… to" into "tic". |
| **R4** | An utterance never starts on a pure sound that carries on in words ("/t/ stays the same"). Write "The sound {t} stays the same." instead. | FIRST_MINUTES §12 rule 2. The sound would have nothing to lean on. |
| **R5** | A word clip that the sentence is **about** is inside the take (R1). A word clip may follow a lead-in only as a **demonstration** (`~fast`, `~slow`, `~sounds`). Otherwise it stands alone between sentences (`~bare`). | This is Jonas's line between "Say this word slowly: mat" (wrong) and "Say mat slowly." (right). It keeps Sounds~Write's own demonstrations: "Listen for the word… /s/ /u/ /n/", "And now the fast way… sun". |
| **R6** | No colon before a slot, and no "…the word" before a bare word clip. | Jonas: "say this sound: a" → "say the sound a". |
| **R7** | A yes/no question never ends on a pure sound, because its rise has nowhere to land. Wh-questions ("Which one starts with /m/?") and alternative questions ("…the sound /o/, or the sound /oe/?") may. | Inventory row 5: "the question's rise can't land on a spliced pure sound". |
| **R8** | A spelling is a key, never spoken. | Sounds~Write: no letter names. |
| **R9 (critic)** | **A picture in a noun-phrase position** (`{picture~a}`, "the {picture}", "Where's the {picture}?", "Tap the {picture}") takes only pictures with noun data. The data lives in a sidecar, `src/content/nouns.ts`, one row per picture: `np` ("a sock", "an ear", "some milk", "the sun", "feet"), `number` (`sg`, `pl` or `mass`) and `kind` (`thing`, `action` or `quality`). An `action` or `quality` picture ("sit", "swim", "run", "hug", "wink") never fills a noun-phrase slot; it gets word templates ("{word} starts with…") instead. A template whose sentence changes with number declares `pl:` text ("Where are the {picture}?"). **The build fails** on a picture with no row, or a plural picture with no `pl:` text. | Run on today's `w_name_pic`, `w_find_pic` and `w_idle_look`, the reference `speak()` says "This is a ear.", "This is an earth.", "This is a feet.", "This is a milk.", "This is a swim.", "Where's the feet?" and "Can you find the swim?". Whisper passes all of them. The pictures include about 20 mass nouns (milk, sand, jam, soup, tea, rain, snow, toast…), verbs (sit, swim, run, hug, wink), plurals (feet, teeth, tents) and unique nouns (sun, moon, earth). Also, `VOWEL_START` in `template.ts` misses /eer/ ("a ear"). Take "an" from the vowel phonemes of `sw.ts` instead: a e i o u ae ee ie oe ue ar or er air eer ou oy oo uu schwa. |
| **R10 (critic)** | **A function word or a homograph as a value** is quoted in the TTS text ("Say 'at' slowly.", "Where does 'to' go?"). That covers the closed class (a an am as at be by do go he in is it me my no of on or so to up us we…) and the content's homographs (read, live, tear, use, dove, and any added later). Every such clip is judged, not sampled (§3.3). | The vocabulary has 18 two-letter words and 5 homographs today. Unquoted, TTS says their weak forms ("Say /ət/ slowly") and hears "Say it slowly." as a pronoun. Whisper can't tell /lɪv/ from /laɪv/. `audit_special_<w>` already quotes ("This is 'the'."). |

It also gives one style warning: "this sound {s}" should be "the sound {s}". That's Jonas's wording, and experiment T3 found "Say the sound…" as good as "Say this sound…". The catalogue has no warnings.

### 1.4 What each template declares

The fields of `TemplateDef` ([`template.ts`](../playtest/speech-templates/design/template.ts)):

| field | meaning | example |
|---|---|---|
| `id` | snake_case, prefixed by slot kinds: `w_` word or picture, `s_` sound, `ws_` word and sound, `ww_` two words, `ss_` two sounds, `n_` name or number, `fs_` a fast/slow move. These are the inventory's `W.`/`S.` prefixes, lowercased so they're safe in file names. | `w_say_slowly` |
| `text` | the whole template in the §1.1 syntax. Captions, transcripts and the TTS script all come from it. | "Say {word} slowly." |
| `slots` | slot name → type | `{ word: "word" }` |
| slot positions (computed by `positions()`) | A text slot's place in its intonation phrase: **I** initial, **M** medial, **F** final. A clip slot's place in the sentence: **end**, **phrase** or **alone**. The generator uses this to choose donor classes for a splice. The audits check it. The catalogue lists it for every template. | `w_say_slowly` word: M. `ws_starts_with` picture: I, sound: end. `ws_way_we_spell` sound: phrase, word: F |
| `tier` | whole, sound, sequence or splice (§2). **(critic)** `parse()` already implies it, and `check()` rejects a mismatch, so compute it instead of declaring it. The splice tier has no templates, so it becomes a repair step in the generator, not a tier | whole |
| `domain` | The content set that lists the values, with the unit each value arrives in. The generator renders by tier; a build ships every value up to its highest unit. | `words`, `pictures`, `three-sound-pictures`, `spellings`, `swap-steps`, `build-items` |
| `src` | Pieces already recorded: a line id, or a family pattern that the content fills in (`fs_<picture>` → `fs_mop`). | `{ 0: "fs_<picture>" }` |
| `derive` | Slots worked out from others, such as a spelling's canonical example words. | `examples` from `teach-lines.gen.ts` |
| `fallback` | What plays if a rendered piece is missing (§2.5). | "Let's say it the slow way…" · the slow way |
| `hide` | Word values the grown-ups' caption hides until they're revealed. A written dictation word would give the spelling away. | `w_your_word` |
| `who`, `purpose` | the speaker (Sensei or the Baron), and the utterance purpose the core logs | `instruction`, `question`, `correction`… |
| `replaces`, `inventory`, `lane` | the lines and families it retires or adopts, its inventory rows, and the FIX_PLAN §2 lane that owns its call sites | – |
| `wordTimes` (to add) | Store Whisper word timings, so a card can light on "sock" | the picture templates |

### 1.5 Templates, `lines.ts` and TEACHER_SCRIPT

- **(critic) Superseded: adopt nothing, and render every piece fresh into `/a/t/`.** The bullets below describe the design as written.
  - **What adoption saves:** 421 clips. That's about 15 minutes of rendering (at 2.9 takes a clip) and about $0.40.
  - **What adoption costs:**
    - A second code path everywhere a piece is resolved: `src`, `legacyId`, `hasLine` in `speak()`, `clipsOf()`, `renderJobs()`, `check-assets`, the audits and retirement.
    - Two encodings and two finishing chains inside one utterance.
    - Pieces from different render dates inside one sentence. That's harmless while the model is the same, and a voice switch mid-sentence once it isn't (§11).
    - Unchecked wording. `report.ts` checks only the *shape* of adopted family members, not their words. So `tv_idle_look_sock`, "Have a look at each picture. Where's the sock?", is adopted as `w_idle_look` "Where's the {picture}?", and its caption and transcript would be wrong.
  - **So:**
    - one template is one render batch, with one model, one encoding and one path;
    - legacy lines and families stay in `lines.ts` until their template ships, then join `RETIRED_LINES`;
    - the 5 re-records below become fresh template pieces;
    - fallbacks still play lines from `lines.ts`, and the 3 new fallback lines are the only template-related additions to it.
  - **Follow-up:** `catalogue.ts` and `sizes.ts` still model adoption. Drop `src` and `legacyId` at P0 (F2), and the totals rise by 421 clips.
- **Existing recordings are adopted, not re-recorded.** A template piece whose words and shape match a recorded line uses that line (`src`).
  - That covers 421 clips already recorded: `fm_name_<w>` (56), `fs_<w>` (26), `tg_<g>_<p>_in`, `_see` and `_like` (47 each), `tp_<p>_hear` (32), `tv_spelt_like_this_<w>` (14), and so on.
  - It also covers 184 of the 297 lead-in and continuation lines.
- **Some adopted lines need re-recording in the template's shape:**
  - seven lines: `tv_guess_q`, `tv_won_one` to `tv_won_four`, `t_everyone_say` and `same_sound_spelling`;
  - plus every fixed piece whose wording changed. The catalogue lists them.
- **New pieces live in `/a/t/`, not in `lines.ts`.** The generator renders them with the same gates as `gen-audio.ts`.
  - `lines.ts` keeps complete sentences, the lead-ins it adopts, and three new fallback lines (§2.5).
- **84 lead-ins are replaced.** Each one joins `RETIRED_LINES` when its template ships. Of the other 29 lines:
  - 19 are retired already.
  - 7 are unused: `say_sounds`, `its`, `like_in`, `t_here`, `t_in_this_word_this_is`, `tut_tile`, `tut_test`.
  - 2 were retired by FIRST_MINUTES §12 but are still called by `Early.tsx` `ListenLevel`: `listen_slow` and `listen_sounds`.
  - `tv_now_say_word` is followed by the child's own voice, not a clip, so it is re-recorded as a whole sentence.
- **TEACHER_SCRIPT's generated families (`<w>`, `<p>`, `<pair>`, `<n>`, `<game>`, `<reader>`) become template ids.**
  - TS §1's slot rule ("each slot is its own clip… never inside one") is replaced by §1.3's grammar.
  - The 46 places in TS (58 line ids) whose natural wording puts a value in the middle of a sentence get that wording back (§6.3).
- **Line families filled by `games.ts` `fillLine` stay line families:** `world_<n>`, `tv_map_next_<game>`, `tv_learn_frame_<n>`, `tv_pocket_ready_<n>` and `tv_right_<reader>`. They are small, closed sets that are already recorded whole (inventory row 57). No template is needed.

### 1.6 The rule for pure sounds

1. **Always the checked clip** from `/a/p/`.
   - Never synthesised, never pitch-shifted, time-stretched or re-encoded.
   - The only change allowed is gain. There is a per-sound gain table for sounds inside a sentence, built by measuring each sound's K-weighted active level against the −16 LUFS carriers. The experiment used −2 dB for /s/ and /sh/.
2. **At the end of a phrase**, after a lead-in that is recorded suspended and is at least 2 words. The preferred cue is "the sound": "Say the sound…", "Here's the sound…", "Take out the sound…".
   - **(critic) A second way to record the lead-in, for the pilot to try.**
     - **How:** render the whole sentence with a placeholder in the sound's place ("Say the sound ah.", "This is the way we spell mmm in mat."), force-align it (MMS, as `splice.py` does), and cut it before and after the placeholder.
     - **Why:** the lead-in and its continuation then come from one take, with the melody of a sentence that is still going. That is the "say the sound a" Jonas asked for, not a hanging "…".
     - **It keeps the pure-sound rule:** the placeholder is TTS and is thrown away. A gate checks that no voiced energy from it is left within 30 ms after the cut (like `trailingBlip`), and the sound played is still the `/a/p/` clip.
     - **Cost:**
       - A template whose continuation is keyed by member gets its lead-in keyed by member too, so both come from one take. That adds about 170 clips for `ws_way_we_spell` across the whole programme.
       - A lead-in with no continuation ("Say the sound…") stays one clip for every sound, as C and D had it.
       - Alignment runs offline.
3. **Joins:** 250 ms of `breath` before it. If the sentence carries on, 250 ms before the continuation (§1.2).
4. **One per phrase.** A list of sounds (`{sounds}`, a blend, "You won back two sounds!" · /m/ · /s/) is a demonstration standing alone after its sentence, with the tile gaps it has today (260–320 ms).
5. **Its job on screen** (`show: "petal"`, SOUND_DISPLAY) is unchanged.
   - The petal's cue fires up to 250 ms before the sound's scheduled start, so it rises during the lead-in's tail.
   - The cue never delays the sound, because the join is already scheduled.

---

## 2. Tiers

### 2.1 What the experiments decided

| tier | used for | how it's made | evidence (share of blind paired votes won) |
|---|---|---|---|
| **whole** | Every template whose slots are words, pictures, names, numbers, positions or titles, and whose values can be listed from the content. That list is the whole *used* set, whose size grows with the vocabulary, not its square. | One Gemini TTS take per value (method A). Two takes, keep the better by the gates. An offline D splice repairs a take that says a word wrong. **(critic)** A template that talks *about* a word ("Say {word} slowly.") takes up to 6 takes under the fluency gate (§3.3). If none passes, D repairs it: the word from a take that says it right, joined into a *fluent* master carrier chosen once per template. | A: 72% overall, T2 89%, T6 92%. D (same-sentence donor) 76%, a tie: the Flash judge slightly preferred D, the Pro judge slightly preferred A. A was called "spliced" in 11% of T2 votes (D 13%). |
| **sound** | Every template with a pure sound. Its speech pieces may themselves carry a word ("Mop starts with…"). | Each speech piece is a take. A lead-in is recorded ending suspended, and a continuation starting with "…". The sound is the `/a/p/` clip, and joins are timed at run time. | T3, one sound at the end: no method clearly won (D 59%, C 57%, A 44%, B 39%); the lead-in's shape matters more than the method. T4, two sounds: two lead-ins won 96%, one sentence with gaps 4%. |
| **sequence** | A complete sentence, then a clip that stands alone: the dictation fade, "Listen for the word." · the sounds, a read-back. | Fixed lines. The clip is the library's. | Prior art: a pause is natural between two sentences (MTA, ScotRail; "The next stop is… Sunningdale"). Inventory awkwardness 2. |
| **splice** | Nothing at launch. Two uses: repair (join the right word from one take into the right carrier of another), and any future template whose used value pairs exceed 3 × the vocabulary (arbitrary Kai-and-Suki misreadings, generated swap chains). | D from the experiment (`tools/splice.py`, promoted to `scripts/lib/splice.py`). The join goes inside the neighbouring word both takes say, with a Praat pitch transplant, level matching and 8 ms crossfades. Offline only. The output ships as one file. | D won 76% overall, and was called "spliced" about as often as real single takes. The two-slot case (D 87% vs A 92%) took both donors from the pair's own take, so donors from "Tap pig, then tap {w}." are **not yet tested**. A template can't use this tier until it passes the §7.1 listening test. |

**Rejected, with the evidence:**
- **Joining words at run time:** C won 42% of votes, C2 28%.
- **A three-class harvested filler library** (prior-art §10): generic donors, D2, won 30%. Donors from other sentences, D3, won 61%, but failed wherever the boundary after the word differed.
- **Neural editing:** F5-TTS won 40% and said 3 of 20 target words wrong ("meth", "site", "sop"). Its weights are non-commercial.
- **Audio sprites:** one template across the vocabulary decodes to about 480 MiB, and Safari shifts MP3 offsets by 576 samples.

### 2.2 The numbers

These numbers come from `bun playtest/speech-templates/design/sizes.ts`, which writes `sizes.json`.
- Value sets come from the unit files, scaled to the planned 850 words (to the end of Year 1) and 2,100 words and 800 pictures (the whole programme).
- Sizes assume 24 kHz, 48 kbps MP3 (6.3 KB per second, measured in delivery.md §3.1) at Sensei's pace of 2.6 words per second.

| | Year R | to end of Year 1 | whole programme |
|---|---:|---:|---:|
| clips (speech pieces) | 3,764 | 8,155 | 19,505 |
| already recorded (adopted) | 421 | 421 | 421 |
| **new clips to render** | **3,343** | **7,734** | **19,084** |
| size of `/a/t/` | 51 MB | 108 MB | 256 MB |
| files in `dist`, with today's ~4,200 | 8.0k | 12.4k | 23.7k (24% of Workers Paid's 100,000) |
| render time: 2.1 takes a clip, about 4 s a take with the gates, 6 in parallel | 1.3 h | 3.0 h | 7.4 h |
| TTS cost at $0.00034 a take (it doubles after 31 Dec 2026) | $2.39 | $5.52 | $13.63 |
| **(critic)** at the takes `gen-audio.ts` actually needs (2.7 a line, 4.7 a lead-in) plus the fluency gate, about 2.9 a clip, over every clip (nothing adopted: 3,764 / 8,155 / 19,505) | about 2.0 h, $3.70 | about 4.4 h, $8.00 | about 10.5 h, $19 |
| **(critic)** files in `dist`, counting the word, slow-word and picture libraries growing past today's 933 words | about 8.0k | about 12.4k | about 27k (27% of 100,000) |

The biggest templates, by whole-programme clips:

| template | text | tier | clips R / Y1 / all |
|---|---|---|---|
| `w_position_q` | What's the {pos} sound in {word}? {word~slow} | whole | 382 / 938 / 2,375 |
| `w_your_word` | Your word is {word}. | whole | 372 / 850 / 2,100 |
| `w_your_next_word` | Your next word is {word}. | whole | 372 / 850 / 2,100 |
| `w_listen_again` | Let's listen to {word} again. {word~slow} | whole | 372 / 850 / 2,100 |
| `w_say_slowly` | Say {word} slowly. | whole | 372 / 850 / 2,100 |
| `w_sort_where` | Where does {word} go? | whole | 90 / 568 / 1,818 (an upper bound: every Extended Code word) |
| `w_name_pic` | This is {picture~a}. | whole | 128 / 245 / 800 (56 recorded) |
| `w_diff_start` | {picture} starts with a different sound. | whole | 128 / 245 / 800 (5 recorded) |
| `ws_starts_with` | {picture} starts with {sound}. | sound | 128 / 245 / 800 (26 recorded) |
| `ww_change` | {word} to {word2}. What do we need to change? | whole | 137 / 225 / 650 |
| `ws_middle_is`, `ws_not_in` | The middle sound in {picture} is {sound}. · {picture} doesn't have the sound {sound}. | sound | 79 / 158 / 501 each |
| `ws_first_is` | The {pos} sound in {word} is {sound}. | sound | 72 / 228 / 366 (the demo words) |

Every template has a row in [catalogue.md](speech-templates/catalogue.md) §1. Most of the 81 sound templates are 1–3 fixed pieces. The ones that grow with the content are:
- the six whose speech carries a word or picture: `ws_starts_with`, `ws_middle_is`, `ws_not_in`, `ws_first_is`, `ws_if_it_was`, `ws_gap`;
- the spelling explanations keyed by spelling or sound pair: `ws_way_we_spell`, `ws_spelling_of`, `ws_another_way_like`, `ss_same_spelling`, `s_ways_list`.

### 2.3 Every inventory row, and where it goes

"Clips" counts every speech piece the row's templates need, for Year R / to the end of Year 1 / the whole programme; one number means the same at every tier. "Adopted" counts the ones recorded already. The rows overlap a little (`w_next_q` serves rows 1 and 49), so the totals are §2.2's.

| # | inventory | template(s) | tier | clips R / Y1 / all |
|---|---|---|---|---|
| 1 | `W.position-q` | `w_position_q`: the item's first ask names the word ("What's the first sound in mat?"; "last" first for a two-sound word). Then `w_next_q` asks "What's the next sound?" · the slow way, with the word already named. | whole | 384 / 940 / 2,377 (3 adopted) |
| 2 | `W.your-word` | `w_your_word`, `w_your_next_word`, then `w_bare_word` from the third word (TS §3.18's fade stays) | whole | 744 / 1,700 / 4,200 |
| 3 | `W.listen-again` | `w_listen_again`, taking turns with `fs_stuck_slow`, `fs_stuck_again` and `w_slow_again` (adopted) | whole | 375 / 853 / 2,103 (3 adopted) |
| 4 | `WW.change` | `ww_change` (the official "{Mat} to {sat}. What do we need to change?"), `ww_i_change` (the demo), `ww_both` | whole | 162 / 271 / 791 |
| 5 | `S.which-starts` | `s_which_starts`, `s_which_picture_starts`, `s_find_starts` | sound | 3 (3 adopted) |
| 6 | `W.name` | `w_name_pic` (the `this_is_a` fallback is deleted) | whole | 128 / 245 / 800 (56 adopted) |
| 7 | `S.which-write` | `s_which_write`, `s_find_write`, `s_now_find_write` | sound | 3 (3 adopted) |
| 8 | `S.say-read` | `s_say_read`: "Now let's say the sounds, and read the word." · sounds · word; plus `s_lets_check` | sequence | 2 (1 adopted) |
| 9 | `S.how-write` | `s_how_write`, `s_and_how_write` | sound | 2 (2 adopted) |
| 10 | `S.here-is` | `s_here_sound`, `s_first_sound`, `s_next_sound`, `s_next_known`, `s_learn_first` / `_next` / `_another` / `_last`, `s_another_sound`, `s_sound_again`, `s_here_it_comes`, `s_petal_is`, `s_can_you_hear`, `s_flower_recap` | sound | 15 (13 adopted) |
| 11 | `WS.way-we-spell` | `ws_way_we_spell`, the official formula verbatim, with the sound back in the middle | sound | 42 / 115 / 173 (48 adopted) |
| 12 | `WS.starts-with` | `ws_starts_with` | sound | 128 / 245 / 800 (26 adopted) |
| 13 | `S.say-with-me` | `s_say_the_sound` (**Jonas's example**), `s_say_with_me` ("Tap the petal, and say the sound {s} with me."), `s_tap_letter_say`, `s_once_more`, `s_now_you_say`, `s_everyone_say` | sound | 8 (1 adopted) |
| 14 | `W.say-slowly` | `w_say_slowly` (**Jonas's example**), `w_i_say_slowly`, `w_tap_tortoise`, `w_tap_rabbit`, `w_ts_slow`, `w_ts_fast`, and the §9 moves `fs_say_slow`, `fs_now_fast`, `fs_slow_tortoise`, `fs_fast_rabbit`, `fs_say_sounds_slow`, `fs_or_slowly` | whole + sound | 426 / 956 / 2,252 (6 adopted) |
| 15 | `S.letters` | `s_letters` (adopted; Dec4 kept), `ss_x_two` | sound | 4 (3 adopted) |
| 16 | `S.listen-for-word` | `s_listen_for_word` (Sounds~Write's exact words, re-recorded as a sentence), `s_my_sounds`, `fs_dots_ido` | sequence | 3 (3 adopted) |
| 17 | `S.thats-we-need` | `ss_thats_we_need` (two lead-ins), `s_its_this_one` ("Say the sound {s}, as you put it on the line."), `s_same_sound_spelling` | sound | 5 (3 adopted) |
| 18 | `N.reader-says` | `n_reader_says` "{Kai} says {at}." (reader × read-check word), `n_reader_right` | whole | 122 / 182 / 242 (2 adopted) |
| 19 | `S.which-middle` | `s_which_middle` "Which one has {s} in the middle?" · slow · slow; `ww_both_again` | sound | 3 |
| 20 | `W.example-list` | `w_example_hear`, `w_example_see`, `ws_spelling_of` (adopted canonical lists; `teach.ts`'s spliced `list()` fallback is deleted) | whole | 112 / 271 / 389 (127 adopted) |
| 21 | `WS.has-middle` | `ws_middle_is` "The middle sound in {pin} is… /i/" (the sound moves to the end) | sound | 79 / 158 / 501 |
| 22 | `N.won-back` | `n_won_one`, `n_won_back` ("You won back two sounds!" · /m/ · /s/) | sequence | 4 (all adopted; re-recorded as whole sentences) |
| 23 | `S.find-with` | `s_find_start`, `s_find_middle`, `s_find_word_with` | sound | 5 |
| 24 | `WS.first-is` | `ws_first_is` | sound | 72 / 228 / 366 |
| 25 | `W.this-is` | `w_swap_start` "Our first word is {mat}." | whole | 24 / 45 / 140 |
| 26 | `S.stays-same` | `s_stays_same` "The sound {t} stays the same." | sound | 2 |
| 27 | `S.another-way` | `s_another_way` (adopted), `s_and_another_way`, `ws_another_way_like` | sound | 15 / 75 / 132 (49 adopted) |
| 28 | `S.they-all` | `s_they_all_start`, `s_they_all_have`, `s_look_this`, `s_found_both`, `s_rw2_all_start` | sound | 5 (5 adopted) |
| 29 | `SS.can-be` | `ss_can_be` | sound | 3 (3 adopted) |
| 30 | `W.slow-word` | `w_slow_word` (re-recorded as a whole sentence) | sequence | 1 |
| 31 | `W.sort-where` | `w_sort_where`, `w_sort_ido` | whole | 99 / 593 / 1,853 |
| 32 | `SS.same-spelling` | `ss_same_spelling` | sound | 7 / 99 / 169 (1 adopted) |
| 33 | `S.diff-spellings` | `s_diff_spellings`, `s_ways_list` | sound | 11 / 27 / 37 (1 adopted) |
| 34 | `N.ways` | `n_ways` | sound | 9 (9 adopted) |
| 35 | `S.petal-for` | `s_petal_for` | sound | 1 |
| 36 | `SS.swap-sounds` | `ss_swap_sounds` "Take out the sound {m}, and put in the sound {s}." | sound | 2 |
| 37 | `S.build-with` | `s_build_with` | sound | 1 |
| 38 | `WS.if-it-was` | `ws_if_it_was` | sound | 37 / 55 / 73 (1 adopted) |
| 39 | `WS.gap` | `ws_gap` "In {rain}, which one spells the sound… /ae/?" | sound | 20 |
| 40 | `W.find-pic` | `w_find_pic`, `w_find_again`, `w_idle_look` (TS's `<w>` families adopted) | whole | 384 (3 adopted) |
| 41 | `W.i-hear` | `w_i_hear` | whole | 20 (2 adopted) |
| 42 | `W.different-start` | `w_diff_start`, `s_listening_for` | whole | 129 / 246 / 801 (5 adopted) |
| 43 | `WS.not-in` | `ws_not_in` "{Dog} doesn't have the sound… /a/" | sound | 79 / 158 / 501 |
| 44 | `W.spelt-like-this` | `w_spelt_like` | whole | 12 / 72 / 129 (14 adopted) |
| 45 | `W.tap-hear` | `w_tap_hear` | whole | 20 (1 adopted) |
| 46 | `WW.pair` | `ww_ido_pair` (TS families adopted) | whole | 20 (8 adopted) |
| 47 | `WW.notice` | `ww_notice` | sound | 1 |
| 48 | `S.help-look` | `s_help_look` "Let me show you. It's the sound… /s/" | sound | 1 |
| 49 | `W.help-word` | `w_next_q` (idle and Help) | sequence | 0 (adopts `next_sound_q` and `last_sound_q`) |
| 50 | `W.catch` | `w_catch` "Here's your word." · word | sequence | 1 |
| 51 | `W.story-title` | `w_story_title` "This story is called {title}." | whole | 6 / 30 / 60 |
| 52 | `W.story-q` | no template: two whole sentences at a sentence join | – | 0 |
| 53 | `W.special` | `w_special` (adopted family) | whole | 15 / 35 / 60 (9 adopted) |
| 54 | `S.say-here` | `s_say_here` (the official correction; wires up `teach.ts` `sayHere`) | sound | 2 (2 adopted) |
| 55 | `SS.does-it-have` | `ss_does_it_have` (the Lesson 10 question; wires up `whichSound`) | sound | 2 |
| 56 | `W.run-wrong` | `w_run_wrong` | sequence | 2 |
| 57 | `N.families` | no template: `fillLine` families stay line families (§1.5) | – | 0 |
| 58 | `S.pocket-frame` | `s_pocket_frame`, `s_pocket_recap` | sound | 2 |
| 59 | `C.caption` | runtime: captions from the template text (§5.4) | – | 0 |

### 2.4 Why 19,505 clips, not the inventory's 36,429

The inventory counted every phrasing of every word template, over every word and picture. The catalogue counts what the game actually says. Whole-programme figures:

| what | inventory's full set | catalogue | why |
|---|---:|---:|---|
| position questions | 6,019 (word × first, next and last) | 2,375 + 366 demo | **The word is named once per building item**, the way a teacher does it: "What's the first sound in mat?" Then "What's the next sound?" |
| per-word sentences | 21,000 (10 per word) | 10,817 | Only where the game uses them. Kai and Suki read the read-check words (240, not 4,200). "In {word}, it's spelt like this." is one chest example per spelling (129, not 2,100). "If it was {word}…" is the read-check misreadings (73). "Say {word} slowly." has one phrasing (the demo is `w_i_say_slowly` over the demo words). The "…in {word}." suffix is gone, because examples are the canonical, pinned words (DECISIONS, 26 Sep). This row adds `w_sort_where` (1,818), which the inventory didn't count. |
| picture sentences | 6,400 (8 per picture) | 2,868 | Three per picture: name, starts with, starts with a different sound. The find-the-picture families serve the pre-code games' 128 pictures, and the demo sets are fixed. |
| middle-sound pictures | 1,002 | 1,002 | the same |
| swap steps | 1,300 | 930 | the official question per step, plus a demo and a start word per chain |
| lists, special words, families, sound carriers | 708 | 1,147 | the sound-template pieces, and the spelling explanations keyed by spelling (`ws_way_we_spell`, `ws_spelling_of`, `ws_another_way_like`) |
| **total** | **36,429** | **19,505** | |

### 2.5 Fallbacks: never a missing clip

- **Rule:** a fallback is a recorded whole sentence, then the clip on its own, or a lead-in, then a pure sound or a demonstration. It never joins a word into a sentence (R1, tested in `template.test.ts`).
- **Which templates need one.** Every whole template over a large value set (words, build items, sort words, swap starts and steps, read words) declares a fallback. Examples:
  - `w_your_word` falls back to "Listen to your word." · [sat].
  - `w_say_slowly` falls back to "Let's say it the slow way…" · the slow way.
  - `w_position_q` falls back to "What's the first sound?" · the slow way.
- **Small sets have no fallback.** Stories, special words, counts, fixed pieces and demo sets are small and closed, so the build must have every member.
- **Three new lines**, for `lines.ts` (catalogue.md §3):
  - `tv_listen_word`: "Listen to your word."
  - `tv_kai_reads`: "Here's how Kai reads it."
  - `tv_suki_reads`: "Here's how Suki reads it."
- **(critic) Offline.** Templates add a new file for every template × word, so a child who opens a level offline for the first time hits fallbacks more often than today. Three changes:
  - a fetch that rejects (no network) counts as missing, the same as a 404;
  - the service worker precaches, at install, every line a fallback can play (11 lines today) and `/a/p/` (46 clips, 336 KB);
  - `warm()` covers the next *two* map nodes, not one.
  
  A fallback's own `{ word }` or `{ stretch }` clip can still be uncached. Then the child hears nothing, as with today's lazy cache.
- **When a fallback plays:** only if a load fails. `speak()` is optimistic and pure. `audio.ts` loads a `say()`'s clips up front; if a `{ tpl }` clip comes back missing (a 404, or anything that isn't `audio/*`), it plays the whole template's fallback instead. It also logs `tpl-miss` to `__audioLog`. Half a template plus half a fallback is never heard.
- **The build check** (`check-assets.ts`) lists every value the content can reach up to the build's highest unit (`members()` × `renderJobs()`), and fails if any clip is missing or failed QA. So a release build plays 0 fallbacks.
  - Preview builds may run ahead of the audio while content grows. There, the transcript audit reports the fallback rate (target ≤ 1%).

---

## 3. The generation pipeline

A new script, `scripts/gen-templates.ts`, built from the reference in `playtest/speech-templates/design/`. It reuses `scripts/tts.ts` (TTS, finishing, the judge), `scripts/gemini.ts`, and the Whisper/Praat QA in `scripts/phonemes/qa.py` and `playtest/voice/qa.py`.

```
bun scripts/gen-templates.ts [--tier R|Y1|all] [--only w_say_slowly,…] [--members file] [--dry] [--takes 2]
                             [--concurrency 6] [--judge-rate 0.05] [--force]
doppler run -p os-legacy-2026-04 -c dev -- bun scripts/gen-templates.ts --tier R
```

### 3.1 Enumerate

1. For each template, `members(template, content, maxUnit)` lists its values from the content:
   - `src/content/units/*` (words, pictures, chains);
   - `sw.ts` (sounds and spellings);
   - `teach-lines.gen.ts` (canonical examples);
   - `worlds.ts` (read pairs and demo words);
   - `stories.ts` and `SPECIAL_WORDS`.
2. `renderJobs()` turns each member into the pieces not recorded yet, with each piece's exact TTS text. A lead-in ends on "..."; a continuation starts on "...".
3. Jobs are de-duplicated by clip id (`t:<template>/<piece>-<key>`).
4. The plan goes to `playtest/runs/speech-templates/gen/plan.jsonl`.

`--tier R` renders only what Year R can reach. The generator runs whenever the content grows: new words, pictures or spellings.

### 3.2 Render

- **Voice and text.** Gemini `gemini-3.8-flash-tts`, voice Sulafat, en-GB, **plain text only**, because Gemini reads instructions aloud. No style prompt: Google's own advice is that extra prompt text increases drift.
- **Takes.**
  - A whole clip gets 2 takes, and up to 4 while the only fault is Whisper.
  - A lead-in gets up to 6 while its only fault is a falling tail (`gen-audio.ts`'s `--lead-takes` rule).
  - The best passing take is kept (§3.3).
- **Retries and concurrency.** Retries on HTTP 429 or 5xx, and on timeouts (30 s a call): up to 5, with backoff of 2ⁿ s plus jitter. 6 calls in parallel (measured: 1.57 s a call).
- **Words TTS may misread.**
  - Homographs (read, live, wind, bow, row, tear, lead, close…) and one-letter words get a `ttsText` override in the content. The Whisper gate accepts the override's transcript.
  - A word's intended sounds come from its segmentation, so the judge can check "live = /l/ /i/ /v/".

### 3.3 QA gates

| gate | threshold | on | tool |
|---|---|---|---|
| text match | Whisper (faster-whisper `small.en`, then `medium.en` on a miss) matches the piece's text word for word, after normalising. Homophones allowed (Matt, Kye) | 100% | `qa.py` |
| slot word heard | every text-slot value in the transcript, in the right place | 100% | `qa.py` |
| pace | ≤ 3.3 words a second (`wordCount`) | 100% | `gen-audio.ts` rule |
| loudness | −16 LUFS ±1; a clip under 1.2 s −19 ±1; true peak ≤ −1.5 dBTP | 100% | `finishAudio` |
| no letter names | no letter-name tokens for a slot word (for example "M A T") | 100% | `qa.py` |
| lead-in tail | falls ≤ 2 semitones over the last 300 ms (aim 1.5); a clean tail (no breath or stray consonant) | every lead-in | `tailFall`, `trailingBlip` |
| continuation head | no burst over 80 ms before the first word; no leading breath | every continuation | new, in `template-qa.ts` |
| BATH vowel | any piece with a BATH word, in the carrier or the slot (the content marks a word whose spelling "a" is /ar/, plus the list in TS §9.8): long /ɑː/ in 3 of 3 votes | as listed | Gemini 3.1 Pro, TS §9.8's calibrated prompt |
| duration sanity | 0.6–1.8 × the estimate (2.6 words a second) | 100% | – |
| **fluency (critic)** | No silence of 250 ms or more between two words that the text doesn't separate with punctuation (Whisper word timestamps, or −40 dB frames). Of the passing takes, keep the one with the shortest such silence, and aim for under 150 ms. For templates that talk about a word, render up to 6 takes, then D repair from a fluent master carrier (§2.1). | every whole piece | `template-qa.ts` |
| **pace (critic)** | The ≤ 3.3 rule above would fail all six of the experiment's "Can you find the {word}?" takes: 3.4–4.7 words a second on file length. Those were the best-judged clips in the experiment (89%). `widenPauses` can't slow them, because there is no punctuation inside to widen. So the rule would burn 8 takes and then list the clip as failed. Keep ≤ 3.3 for pieces of 6 words or more. For shorter pieces, set the ceiling from the pilot clips Jonas picks (probably about 4). | 100% | `gen-audio.ts` rule, adapted |
| **noun data (critic)** | Every picture value of a noun-phrase slot has a `nouns.ts` row, with `kind: thing`, and a plural has the template's `pl:` text (R9) | 100% (a build error) | `check()` plus the content check |
| **quoted values (critic)** | A function word or homograph (R10) is quoted in the TTS text. **Every** such clip is judged with its intended IPA ("live = /l ɪ v/", "to = /t uː/, strong form"). | 100% | `judgeAudio` |
| voice drift | ECAPA speaker-embedding cosine to the Sensei centroid of 50 reference lines, at or above the 5th percentile of today's 1,170 lines. **Log only on the first run, then gate.** | 100% | speechbrain, in the existing venv |
| spot-check judge | Gemini audio judge, production rubric plus "one natural take by a warm British teacher? is {word} clear and British?" Score ≥ 8 | every fixed piece; the first 20 values of every template; then 5% at random, and every clip in Whisper's bottom 10% of confidence. **A template whose sampled failure rate is over 2% is judged in full.** | `judgeAudio` |
| join metrics (splice tier and repairs only) | F0 step ≤ 2.5 semitones, tight energy step ≤ 8 dB, MFCC distance ≤ 60. The experiment's D measured 1.2 st, 5.7 dB and 49.3 | every splice | `measure.py`, promoted |

### 3.4 Repair

A value whose takes all fail on the slot word:
1. First, up to 4 more takes.
2. If one take has the right word and another has the right carrier, D joins them (§2.1). The join metrics and the judge must then pass.
3. Otherwise the value is marked `failed` in the manifest, and the build check lists it. It never ships silently: the fallback covers a preview, and the release gate blocks.

### 3.5 Finish and write

1. **Trim and fade** as `finishAudio` does today: keep 30 ms before the speech and 60 ms after, with 25 ms fades. Joins are timed from the detected speech edges, so the edge silence doesn't matter.
2. **Encode:** `ffmpeg -ar 24000 -ac 1 -c:a libmp3lame -b:a 48k` from the TTS WAV (delivery.md §3). Pure sounds and existing clips are never re-encoded.
3. **Masters:** FLAC in `assets-src/speech/t/<template>/<piece>-<key>.flac`, which git ignores. That's about 34 KB a clip, 0.7 GB for the whole programme. An optional R2 sync.
4. **Write atomically:** to a temporary file, then rename into place. Then append a line to the journal.
5. **Word timings:** for templates with `wordTimes`, Whisper word timings go into `_index.json`.

### 3.6 The manifest, and only rendering what's missing

- **Per template:** `public/a/t/<template>/_index.json`, shaped as `{ v: 1, template, text, entries: { "<piece>-<key>": { h, ms, on, off, lufs, wps, takes, judge?, words? } } }`.
  - `h` is the **input hash**: 8 hex characters of SHA-1 over the voice, the model, the exact TTS text, the finishing settings and the pipeline version.
    - **(critic)** Drop "the pipeline version": hash only what changes the audio.
    - A model id change re-renders *every* template: about 10 hours, and every phone's `/a/t/` cache. So pin `TTS_MODEL` for template renders.
    - When Google retires the model, re-render one whole template at a time. Never mix model versions inside a template (§11).
  - `on` and `off` are the speech edges.
  - The largest, `w_position_q` at 2,375 entries, is about 95 KB raw and 25 KB gzipped.
- **Idempotent.** A job whose file exists and whose input hash matches is skipped. So:
  - changing a template's text re-renders exactly the pieces whose TTS text changed;
  - adding words renders only the new values;
  - `--force` re-renders.
- **Resumable.** `playtest/runs/speech-templates/gen/journal.jsonl` gets one line per finished clip. After a crash the run replays the journal and goes on.
- **Durations** for the headless runner go into `public/a/durations.json` as `t/<template>/<piece>-<key>` keys (`gen-durations.ts`).
  - That adds about 19,500 entries, about 0.5 MB. The game's bundle never imports it: only `src/core/content/durations.ts` does, and the game doesn't load the linebook.

### 3.7 Throughput and cost

| | Year R | to end of Year 1 | whole programme |
|---|---:|---:|---:|
| new clips | 3,343 | 7,734 | 19,084 |
| takes (2.1 a clip on average) | 7,020 | 16,241 | 40,076 |
| wall time at 6 parallel calls, about 4 s a take with Whisper and the machine gates | 1.3 h | 3.0 h | 7.4 h |
| spot-check judge calls (every fixed piece, the first 20 values of each template, 5% at random, and Whisper's bottom 10%) | about 1,450 | about 2,100 | about 3,800 |
| TTS cost at $0.00034 a take | $2.39 | $5.52 | $13.63 |

### 3.8 The human ear

Before any lane renders its full set:
- each template renders 20 random values (**(critic)** and only those until its gate passes: a re-wording re-renders the whole set);
- they go on a listening page with a **Blind** button, like the experiment's: `playtest/speech-templates/gen/<template>/index.html`;
- Jonas's ear is the gate for the pilot (§7.1).

The judge is a model: it is weak on pure sounds, and the two judges agreed on only 71% of items.

---

## 4. Delivery

From [delivery.md](speech-templates/delivery.md), sized for this catalogue:

- **Hosting.**
  - Workers static assets, one file per clip, at `/a/t/<template>/<piece>-<key>.mp3`.
  - Jonas's account is on Workers Paid, which allows 100,000 files per version. We'd use 8.0k (Year R), 12.4k (Year 1) and 23.7k (the whole programme). **(critic)** About 27k for the whole programme, once the word, slow-word and picture libraries grow with the vocabulary (§2.2).
  - A deploy gate fails at 80,000 files. Past that, `/a/t/` moves to R2 behind the same origin (delivery.md §2.4), for about $0 a month at our scale.
- **No sprites.**
- **Format.**
  - New speech is MP3 at 24 kHz mono, CBR 48 kbps. A 1.25 s sentence is 7.9 KB, 57% of today's.
  - Opus waits until PostHog shows fewer than 1% of sessions on iOS below 18.4.
  - `/a/p/` is never touched.
- **Decoding.**
  - Speech decodes through `OfflineAudioContext(1, 1, 24000)`, which halves decoded size (an average line goes from 525 KiB to 262 KiB). Pure sounds decode at the full rate.
  - Decodes go through a queue of 2 (WebKit bug 227636).
- **Service worker.**
  - Hash-bucketed caches, as delivery.md §5 built and tested. Each template folder is its own folder, so re-rendering a template drops only that template.
  - **Buckets per folder adapt to its size:** `clamp(ceil(files / 128), 1, 16)`. The 90 or so fixed-piece templates get 1 bucket each, and the big word templates get 16. That's about 420 cache names in all, and about a 4 KB table in `sw.js`.
  - A re-rendered clip re-fetches at most 1/16 of its folder.
  - The worker also caches `_index.json` (JSON is allowed under `/a/t/`).
- **Missing clips.**
  - The content-type guard goes in the service worker and in `load()`, so Cloudflare's `200 text/html` single-page-app fallback is never cached or decoded.
  - A 10-line Worker returns 404 for missing `/a/*` (delivery.md §7).
  - Either way, the template's fallback plays (§2.5).
- **Warming.** Clips are fetched into the cache without decoding when a level starts, and when the map highlights the next node:

  ```ts
  warm(clipsFor(level))  // = every template the level's activities declare × the values the planner chose → clipsOf()
  ```

  - Each activity declares its templates, so `clipsFor()` lists URLs without playing anything, and the text-adventure runner can check at build time that every URL exists.
  - `preload()`, which decodes, stays for the first clip or two a scene needs straight away.
- **Per-level budget.**
  - A Word Building or battle level of 10 words warms about 32 template clips: 2 dictation sentences, plus a first-sound question, a "say it slowly" and a listen-again per word. That's about **420 KB**.
  - Decoded, it is about **6.1 MiB** at 24 kHz, if every clip plays.
  - The 40 MiB least-recently-used store and PERF's 64 MB ceiling on live decoded audio are unchanged. The store holds about 350 templated sentences at 24 kHz.
- **Offline, later:** "download this world" is `warm(clipsFor(every level of the world))`. About 300 words × 5 templates is about 1,500 clips, or 20 MB.

---

## 5. The runtime API

### 5.1 `speak()` and friends (`src/content/templates.ts`, from the reference `template.ts` and `catalogue.ts`)

```ts
speak(id: TemplateId, values: Values, o?: { show?: SoundShow; reveal?: boolean }): Say[]
textOf(id, values, style: "transcript" | "caption", reveal?: boolean): string   // 'Say mat slowly.' · 'Say the sound /a/.'
clipsOf(id, values): string[]            // URLs: warm(), preload(), the build's coverage check
members(id, content, maxUnit): Values[]  // the enumerator (generator, build check, tests)
renderJobs(id, values): { clip, url, text, lead, cont }[]
positions(id): Record<slot, "I" | "M" | "F" | "end" | "phrase" | "alone">
check(def): { errors, warnings }         // the grammar (§1.3), run in a unit test over the whole catalogue
```

All of it is pure: no DOM, no audio. Scenes call `say(speak("w_say_slowly", { word: "mat" }))`. The core calls the same `speak()` through the linebook (§5.3).

What `speak()` returns (the output of the reference tests):

```ts
speak("w_say_slowly", { word: "mat" })
// [{ tpl: "w_say_slowly", piece: 0, key: "mat", text: "Say mat slowly.", hide: ["mat"],
//    fallback: [{ line: "tv_fs_say_slow" }, { join: "breath" }, { stretch: "mat" }] }]
speak("s_say_the_sound", { sound: "a" })
// [{ tpl: "s_say_the_sound", piece: 0, key: "_", text: "Say the sound..." }, { join: "breath" }, { sound: "a", show: "petal" }]
speak("ws_way_we_spell", { sound: "m", word: "mat", spelling: "m_m" })
// [{ line: "t_way_we_spell" }, { join: "breath" }, { sound: "m", show: "petal" }, { join: "breath" }, { line: "tg_m_m_in" }]
```

**(critic)** With nothing adopted (SPT12), the last example's two `{ line }` items become `{ tpl: "ws_way_we_spell", piece: 0 | 1, … }`. Every speech part a template returns is then a `{ tpl }`.

### 5.2 `audio.ts` (a request to F1, which owns the file)

1. **Two new `Say` kinds.**
   - `{ tpl, piece, key, text, hide?, fallback? }` loads `urls.tpl(tpl, piece, key)` = `/a/t/<tpl>/<piece>-<key>.mp3`.
   - `{ join: "breath" | "sentence" }` is a designed pause. It is measured from speech to speech, which is not what today's `{ gap }` means; `{ gap }` keeps its meaning.
   - `{ word, demo: true }` marks a demonstration (the fast way) for the audits. It plays like `{ word }`.
2. **Speech edges.** When a buffer is decoded, `speechEdges(buf)` scans the first and last 150 ms for frames above −45 dBFS (5 ms frames), and caches the result in a `WeakMap`. It takes microseconds. It absorbs WebKit's MP3 priming and every clip's baked edge silence.
3. **Scheduled joins.**
   - Each clip is started with `src.start(when)` on the context clock, one clip ahead, while the previous clip is still playing. This replaces `onended` → `start()`.
   - The start time is `when(next) = start(prev) + off(prev)/rate + join/FAST − on(next)/rate`.
   - Clips with no `join` between them keep today's behaviour (`gap` or back to back).
   - `hush()`, the turn-your-phone `gate` and a new `say()` stop every scheduled source, not just the current one.
4. **Petal cues.** A `"petal"` sound's cue fires at `when − cueMs` from a timer (at most 250 ms). The cue never delays the sound.
5. **Fallback.** If any `{ tpl }` loader resolves to `null`, the whole list is swapped for the item's `fallback`, once, and a `tpl-miss` entry is logged (`__audioLog`, and a listener hook for the bot).
6. **Captions.**
   - A `{ tpl }` item adds its `text`, with each value in `hide` replaced by 🔊 unless the `say()` reveals it.
   - Sounds stay petal parts in the caption bubble (SD r62).
   - A lead-in's trailing "..." is dropped at a phrase end, as today.
7. **`onClip` ids.**
   - A template clip's id is `t:<tpl>/<piece>-<key>`.
   - `wordTimes()` answers for template clips from the template's `_index.json`, fetched with its first clip. Only templates with `wordTimes` have them.
8. **Other changes**, from delivery.md §8: decoding speech at 24 kHz except `/a/p/`; the decode queue of 2; `warm()`; the content-type guard; and `DECODED_BUDGET`'s comment updated to about 350 templated sentences.

### 5.3 The core and the headless runner (a request to F2, which owns `src/core`)

- **`UttPart`** in `types.ts` gains `{ tpl; piece; key; text }` and `{ join }`, which match the new `Say` kinds one to one. **`UtteranceSpec`** gains `{ tpl: TemplateId; values: Values }`.
- **`LineBook.utter()`** builds a template utterance from `speak()`:
  - `text`: `textOf(…, "transcript")`.
  - `tags`: the template's own tags, a `word:<w>` mention per word value, and a `sound:<p>` mention per sound.
  - `lines`: its adopted line ids.
  - a new `tpls: TemplateId[]` field on `UtteranceCore`.
  - `estMs`: from `durations.json`'s `t/…` keys plus the joins' ms. If a piece is missing, 350 ms a word plus `missingAudio: true`, and the headless runner uses the fallback.
- **Template metadata**: `purpose`, `who`, tags and needs live in `line-tags.ts`'s sidecar format, keyed by template id. So the director and the audits read templates the way they read lines.
- **The text adventure** prints the template's text:

  ```
  SENSEI  Say mat slowly.
  SENSEI  What's the first sound in mat? "mat" (slowly)
  SENSEI  This is the way we spell /m/ in mat.
  ```

- **Headless time:** `estMs` includes the joins: 250 ms for a breath, 450 ms for a sentence.

### 5.4 Transcripts, captions and audits

- **Every clip's text can be recovered**, three ways:
  1. the part carries `text`;
  2. `textOf()` rebuilds it from the template and its values;
  3. `_index.json` holds the input hash of the exact text rendered, so an audit can tell when a clip is stale (its text has changed since it was rendered).
- **The bot's transcript logs:**
  - `t:<tpl>/<piece>-<key>` for each template clip, next to today's `line id`, `word:`, `stretch:` and `sound:`;
  - one `say: <n>` group id per `say()` (inventory.md's request). Compositions are then counted exactly, not by the 0.7 s timing rule.
- **(critic) The script lints cover templates too.** Template text never passes through `lines.ts`, so `jev-lint-lines` and the SCRIPT_STYLE checks (fast lines, banned words, TS §7.4) must run over every template's `textOf()`. They run on 20 sample values per template, and on every value for templates keyed by a closed set.
- **(critic) The treadmill's "one take, or joined?" judge** gets the experiment's sentence saying a pure sound is intended. Without it, every sound template counts as joined.
- **The `echo` audit** uses the template id as the utterance's shape token. "Say mat slowly." said twice within 30 s is an echo; "Say mat slowly." then "Say sat slowly." is a different value of the same routine, and allowed where the routine is (SCRIPT_STYLE §5.1).
- **New audits** (F4, in `script-audit.ts`; thresholds in §7.3):
  - `carrier-colon`
  - `word-after-lead`
  - `template-fallback`
  - `sound-mid-phrase`
  - `clip-text`
  - `join-gap`
  - `first-ask-names-word`

---

## 6. The migration plan

### 6.1 Phases

| phase | who | what | size |
|---|---|---|---|
| **P0 foundation** | F1 (`audio.ts`), F2 (`src/content/templates.ts`, new; `src/core`), pipeline (new files: `scripts/gen-templates.ts`, `scripts/lib/template-qa.ts`, `scripts/lib/splice.py`, `scripts/lib/asset-buckets.ts`, `worker/assets.ts`), F4 (audits) | §5.2, §5.3, §3, delivery.md §8, and the §7.3 audits (report only). The catalogue lands with its tests; `check-assets` gains the coverage check. | F1 M, F2 M, pipeline L, F4 S |
| **P1 pilot** | pipeline, then Jonas | Year R renders of `w_position_q`, `w_your_word`, `w_listen_again`, `ww_change` and `w_say_slowly` (plus `s_say_the_sound` and `ws_way_we_spell`) go on blind pages against today's compositions. The breath A/B at 150/250/400 ms. **Gate: §7.1.** | about 40 min to render 1,640 clips, plus Jonas's listening |
| **P1, as amended (critic)** | pipeline, then Jonas | Render **only the listening samples** (20 values a template), fluency-gated. Add four arms:<br>**(a) Sounds:** lead-in style (suspended "…" vs placeholder-cut, §1.6) × breath (150 / 250 ms) on `s_say_the_sound` and `ws_way_we_spell`. 400 ms is dropped: it lost to 250 ms in the critic's run, and 250 ms lost to 150 ms.<br>**(b) A question ending on a sound:** `s_which_starts`, inventory row 5 (the fifth-worst offender), and untested.<br>**(c) Context:** `w_position_q` rendered on its own vs rendered after "Your word is {word}." and cut at the sentence break. Is the second "mat" said like a word the child has just heard?<br>**(d) Real play:** three 30-second stretches of Word Building rendered end to end, template clips against today's, for take-to-take consistency.<br>The full Year R render follows the gate. | about 15 min to render about 400 clips, then Jonas's listening (about 25 min), then about 2 h for Year R |
| **P2 lanes** | up to 13 lanes in parallel, per §6.2 | Each lane swaps its `Say[]` compositions for `speak()`, declares its activities' templates for `clipsFor()`, and deletes its fallback splices. The pipeline renders each lane's templates for Year R first, then Year 1. | per lane S–M |
| **P3 clean-up** | integration | Retire 84 lead-ins and 9 unused ones into `RETIRED_LINES`. Turn the §7.3 audits into blockers. Write TEACHER_SCRIPT §1 and FIRST_MINUTES §12 for the grammar (§6.4). Log §8 in DECISIONS. Run the full acceptance. | 2–3 h |

### 6.2 By lane (FIX_PLAN §2 owners)

Line numbers are the inventory's and will have drifted: search for the function names.

| lane | files | templates (inventory rows) |
|---|---|---|
| **F1 Perf** | `audio.ts` | the runtime (§5.2): `{ tpl }`, `{ join }`, clock scheduling, speech edges, fallback swap, captions, `warm()`, the 24 kHz decode, the decode queue, the content-type guard |
| **F2 Voice** | `feedback.ts` | `correction`: `w_listen_again` / `w_slow_again` / `fs_stuck_slow` (3), `ss_thats_we_need` and `s_its_this_one` (17), `s_same_sound_spelling`, `s_letters` (the split correction, 15). `pictureCorrection`: `ws_starts_with` (12), `w_diff_start` (42), `ws_not_in` (43), `s_listening_for`, `s_listen_for_word` (16) |
| | `narrate.tsx` | `lettersSay` and `lettersReminder` → `s_letters` and `ss_x_two` (15); `spellingHelp` → `w_listen_again` (3); `twoSoundsReminder` → `ss_can_be` (29) |
| | `narrative.ts` | `LISTEN_AGAIN` leads → `w_listen_again`, `w_slow_again`, `fs_stuck_slow` (3) |
| | `teach.ts` | `introPetal` → `s_petal_is`, `s_can_you_hear`, `s_they_all_have`, `s_now_you_say`, `s_everyone_say`, `s_here_sound`, `w_example_hear` (10, 13, 20) · `introGem`, `newGem`, `foundScript` → `ws_spelling_of`, `ws_another_way_like`, `s_another_way`, `s_and_another_way`, `ws_way_we_spell`, `n_ways`, `w_example_see` (11, 20, 27, 34) · `sameSound` → `s_diff_spellings`, `s_ways_list` (33) · `sameSpelling` → `ss_same_spelling` (32) · `canBe` → `ss_can_be` (29) · `sayHere` → `s_say_here` (54) · `whichSound` → `ss_does_it_have` (55). Delete `list()` and the `clip(…, fallback)` splices. |
| | `lines.ts`, `src/core/**`, `src/content/templates.ts` (new) | 3 new lines and 5 re-records (§1.5); `UttPart`, `LineBook`, `durations`, `line-tags` (§5.3) |
| **F3 Petals** | `NavDemo.tsx` | `s_here_it_comes` (10) |
| **F4 Checks** | `scripts/treadmill/*` | the §7.3 audits; the "one take, or joined?" judge on template utterances; the `say` group id in transcripts; blind pages per template |
| **A** | `Placement.tsx` | `place_spell` → `w_your_word` (2) · `place_sound` → `s_which_write` (7) · `place_gap` → `ws_gap` (39) · `place_findall` → `s_find_word_with` or `s_find_start` (23) · `place_tap` → `w_find_pic` (40) |
| **B1 Shell** | `App.tsx` | `Reward.talk` → `n_won_one` and `n_won_back` (22) · `fm_rw2_s` → `s_rw2_all_start` (28) |
| **B2 Flower** | `Tree.tsx` | through `teach.ts` (F2) · `tv_flower_tap` → `s_say_with_me` (13) · `s_flower_recap` (10) |
| **B3 Shows** | `Intros.tsx` | `flower_i2` → `s_petal_for` (35) · `GemFound` → `s_and_another_way` (27) |
| **B4 Stickers** | `Stickers.tsx` | `audit_petal_means` → `s_petal_for` (35) · `fm_rw2_s` → `s_rw2_all_start` (28) |
| **C1 Early** | `Early.tsx` | `BuildOne.ask` / `again` / `slotQ` → `w_position_q` and `w_next_q` (1) · `BuildOne` effect → `w_your_word`, `w_your_next_word`, `w_bare_word` (2) · `runDemo` → `w_i_say_slowly` and `ws_first_is` (14, 24) · `readBack` → `s_say_read`, `s_lets_check` and the `fs_*` moves (8, 14) · `FirstSoundLevel.mk` → `s_which_starts` family (5) · Ninja Eyes → `s_which_write` (7) · `onRight` → `s_how_write`, `ws_starts_with` (9, 12) · `SoundHuntLevel` → `s_which_middle`, `ws_middle_is` (19, 21) · `ReadOne` → `n_reader_says`, `n_reader_right`, `ws_if_it_was` (18, 38) · `usePickGame.present` → `w_name_pic` (6), and delete the `this_is_a` / `starts_with` / `has_in_middle` fallbacks · `ListenLevel` → `w_i_hear`, `w_find_pic` (40, 41), and remove `listen_tap`, `listen_slow`, `listen_sounds` and `i_can_hear` (FIRST_MINUTES §12) |
| **C2 Warm-ups** | `Warmup.tsx`, `warmups.ts` | `nameCards` → `w_name_pic` (6) · `tap` → `w_find_pic`, `w_find_again`, `w_idle_look` (40) · `fastslow` → `w_tap_tortoise`, `w_tap_rabbit`, `w_ts_slow`, `w_ts_fast`, `fs_or_slowly` (14) · `slowpick` → `w_slow_word` (30) · `sounds` and `dots` → `s_my_sounds`, `s_listen_for_word`, `fs_dots_ido` (16) · `tapall` → `s_find_start`, `s_find_middle`, `s_find_word_with`, `s_pocket_frame`, `s_pocket_recap`, `s_they_all_*`, `s_look_this`, `s_found_both`, `s_how_write`, `w_diff_start` (9, 23, 28, 42, 58) · `noticeShow` → `ww_notice`, `s_say_with_me` (13, 47) · rail and which → `ww_ido_pair` (46) · `fs_stuck_again` |
| **D1 Dojo** | `Dojo.tsx` | `Build.prompt` → `w_your_word`, `w_your_next_word`, `w_bare_word` (2) · `Build` idle and help → `w_next_q` (49) · `Find.prompt` and help → `s_which_write`, `s_find_write`, `s_now_find_write` (7) · `Learn` → `s_how_write`, the `s_here_*` and `s_learn_*` families, `s_next_known`, `s_another_sound`, `s_sound_again`, `s_say_with_me`, `s_tap_letter_say`, `s_once_more`, `s_another_way` (9, 10, 13, 27) · `Find.tap` → `ss_thats_we_need` (17) · help → `s_help_look` (48) · `tv_next_build` → `s_build_with` (37) · the `fs_*` moves |
| **D2 Battle** | `Battle.tsx` | `question` → `w_your_word`, `w_your_next_word`, `w_bare_word` (2) · `monsterAttack` → `w_listen_again` (3) · help → `w_next_q`, `s_help_look` (48, 49) · the `fs_*` moves |
| **D3 Swap** | `Swap.tsx` | effect → `w_swap_start` (25) · `ask`, `hear`, help → `ww_i_change`, `ww_change`, `ww_both` (4) · `tapPos` → `s_stays_same` (26) · `sayPick` → `ss_swap_sounds` (36) · help → `s_help_look` · read-backs → `s_say_read` (8) |
| **D4 Sort** | `Sort.tsx` | the falling word, `wrongChest`, help and idle → `w_sort_where` (31) · `w_sort_ido` · `w_spelt_like` (44) · the chests → `s_letters` (15) |
| **D5 Run** | `Run.tsx` | cue, help and loop → `s_listen_for_word` (16) · `run_catch` → `w_catch` (50) · `catchLantern` → `w_run_wrong` (56) |
| **D6 Story** | `Story.tsx` | `TitleStep` → `w_story_title` (51) · `SPECIAL_LINE` → `w_special` (53) · `QuestionPage` stays two whole lines (52) |

### 6.3 TEACHER_SCRIPT lines that become templates

These are inventory §4's 46 places (58 line ids) where the natural wording puts a value in the middle of a sentence. TS gets the natural wording back:

| TS line ids | natural wording | template |
|---|---|---|
| `tv_petal_say`, `tv_petal_first`, `tv_new_petal_say`, `tv_petal_say_short`, `tv_rw2_tap_petal`, `tv_flower_tap` | "Tap the petal, and say the sound /s/ with me." | `s_say_with_me` |
| `tv_dojo_idle_say`, `tv_once_more` | "Tap the letter, and say the sound /b/ with me." · "Once more. Tap it, and say the sound /b/." | `s_tap_letter_say`, `s_once_more` |
| `its_this_one` ↻ | "It's this one. Say the sound /m/, as you put it on the line." | `s_its_this_one` |
| `tv_here_sound` · `tg_<g>_<p>_way` | "This is the way we spell /m/ in mat." (official) | `ws_way_we_spell` |
| `mid_<w>`, `tv_not_in_middle`, `fm_not_in_<w>` | "The middle sound in pin is /i/." · "Dog doesn't have the sound /a/." | `ws_middle_is`, `ws_not_in` |
| `tv_hunt_q` | "Which one has /i/ in the middle?" | `s_which_middle` |
| `tv_pocket_middle_more_<p>`, `tv_find_words_in`, `tv_place_findall_round` | "Find the pictures with /o/ in the middle." · "Find every word with /ae/ in it." | `s_find_middle`, `s_find_word_with` |
| `t_they_all_have` | "They all have the sound /a/." | `s_they_all_have` |
| `tv_i_say_slowly`, `fm_tap_tortoise` ↻, `fm_tap_rabbit` ↻, `tv_ts_fast`, `tv_ts_slow`, `tv_ts_slow_one` | "I'll say am slowly." · "Now tap the tortoise, and say sun slowly with me." · "Now tap the rabbit, and say sun fast." · "The tortoise says sun slowly." · "The rabbit says sun fast." | `w_i_say_slowly`, `w_tap_tortoise`, `w_tap_rabbit`, `w_ts_slow`, `w_ts_fast` |
| `first_sound_q`, `last_sound_q`, `tv_last_first`, `tv_next_middle` | "What's the first sound in mat?" (official), then "What's the next sound?" | `w_position_q`, `w_next_q` |
| `tv_first_is` | "The first sound in am is /a/." | `ws_first_is` |
| `tv_lets_say_read` | "Now let's say the sounds, and read the word." · /a/ /m/ · am | `s_say_read` |
| `tv_yes_<reader>`, `kai_says`, `suki_says` | "Yes! Suki read it right." · sounds · word · "Kai says at." | `n_reader_right`, `n_reader_says` |
| `tv_swap_change_to`, `tv_swap_now_change`, `st_what_change` | "I'll change mat to sat." · "Sat to sit. What do we need to change?" (official) | `ww_i_change`, `ww_change` |
| `tv_swap_kick`, `tv_swap_in` | "Take out the sound /m/, and put in the sound /s/." (the official narrator) | `ss_swap_sounds` |
| `thats` · `stays_same` | "The sound /t/ stays the same." | `s_stays_same` |
| `tv_thats_write` · `we_need` | "That's how we write /s/. We need /m/." | `ss_thats_we_need` |
| `tv_won_<n>` | "You won back two sounds!" · /m/ · /s/ | `n_won_back` |
| `tv_x_two_sounds` | "This spelling is two sounds together." · /k/ /s/ | `ss_x_two` |
| `t_ways_<n>`, `fs_<w>`, `fm_diff_<w>`, `fm_notice_sun_sock`, `tv_your_word_<w>`, `tv_find_again_<w>`, `tv_idle_look_<w>`, `tv_tap_hear_<w>`, `tv_guess_so_<w>`, `tv_spelt_like_this_<w>`, `tv_ido_pair_<pair>`, `tv_which_q/fix_<pair>`, `audit_special_<w>`, `tv_learn_frame_<n>`, `tv_map_next_<game>`, `world_<n>`, `tv_pocket_ready_<n>` | already natural (whole-sentence families) | adopted, as they are |

TS's own generated families (`<w>`, `<pair>`…) stay whole-sentence families: they *are* whole templates. Each is listed under its template in catalogue.md.

### 6.4 The docs to change (at P3, by integration)

- **TEACHER_SCRIPT §1.** Replace "Slots. Each slot is its own clip, placed at the end of a sentence or alone between two sentences, never inside one" with §1.3's R1–R8 and §1.1's slot notation. Rows write `{word}`, `{sound}` and `{word~slow}`, and name the template id.
- **TEACHER_SCRIPT §9.7 rule 1** ("Sounds only at a sentence end or in their own slot") becomes R2: "at a phrase end".
- **FIRST_MINUTES §12 rule 2.**
  - Replace "350–450 ms before the clip and at least 250 ms after it" with "a 250 ms breath from the speech's end to the clip's start, and 250 ms after it when the sentence carries on".
  - Rule 1 ("any line that contains a word is one whole recording") stays, and is now R1.
- **PERF.md.** The clip sizes are about 86 kbps and 17.9× their download (delivery.md). Add the 24 kHz speech decode, and the per-level warm budget of about 420 KB and about 6.1 MiB.
- **DECISIONS.md**: §8's entries.

---

## 7. Acceptance

### 7.1 Listening (the pilot gate, and before each lane ships)

| test | material | target |
|---|---|---|
| **Jonas's blind ear (the gate)** | For each of the four top offenders (`w_position_q`, `w_your_word`, `w_listen_again`, `ww_change`), Jonas's two examples (`w_say_slowly`, `s_say_the_sound`) and `ws_way_we_spell`: 20 random Year R values, each paired with today's composition, played blind in random order | Word templates: the template is preferred in **≥ 80%** of his picks. Sound templates: **≥ 60%**. If a template misses, it is re-worded or re-rendered before P2. |
| **the breath gap** | `s_say_the_sound` and `ws_way_we_spell` at 150, 250 and 400 ms, blind, 10 sounds each | Jonas picks the value; it's logged as the SPT3 constant |
| **lead-in style × breath (critic)** | `s_say_the_sound` and `ws_way_we_spell`: suspended "…" vs placeholder-cut (§1.6), at 150 and 250 ms, blind, 10 sounds each | Jonas picks the pair. If no pair beats today's composition in ≥ 60% of his picks, sounds keep today's timing and only the wording changes ("the sound", no colon, R2–R7), and that is logged. |
| **the judge**: Gemini 3.8 Flash, 3 order-balanced votes per pair; Gemini 3.1 Pro on any item where Flash's votes are split | the same pairs as Jonas's test | Template preferred in **≥ 75%** of votes on word templates (A beat today's composition in 100% of votes on T2 and T6), and **≥ 55%** on sound templates. Whole clips called "spliced" in **≤ 20%** of votes (real single takes: 10–31%). |
| **the judge, as amended (critic)** | the same | **Three problems with the gates above:**<br>1. On T1 (Jonas's example) the whole take won only 33–39% against today's shape, so ≥ 75% is not what the evidence predicts for templates that talk about a word. The experiment's prompt rewards "two clean utterances", and B's "Say this word slowly… mat" is exactly that. It never asks about the *wording*.<br>2. A fixed "spliced ≤ 20%" is below what genuine single takes score: 31% on T1, and 57% on T3.<br>3. The judge agreed with the other model only 71% of the time.<br>**So:** word templates are judged on the fluency-gated takes, with a second question in the prompt: "which would a teacher say?". Gate at **≥ 60%**. "Spliced" is gated **within 10 points of a control set** of 20 fixed single-take lines judged in the same run. **Jonas's ear stays the only gate that can pass a template the judge fails.** |
| **real play (critic)** | the pilot's three 30-second stretches (§6.1 arm d) | Jonas prefers the template version in 2 of 3. Within one stretch, no clip stands out in pace or pitch: speech-only pace within ±20% of the stretch's median, and median F0 within ±2 semitones. |
| **every template** | 20 random values on its blind page before its lane ships | judge ≥ 8 on 95% of clips; "one take, or joined?" ≤ 20% "joined" for whole clips. **(critic)** "Joined" is measured against the control set, as above; templates that talk about a word are judged on fluency-gated takes |
| **the splice tier** (when first used) | 20 values against whole takes | D within 10 points of A on votes, and no significant loss (18+ votes a pair) |

### 7.2 Clips and joins

| check | target | measured where |
|---|---|---|
| Whisper text match; slot word heard | 100% of shipped clips | generator gates, then `check-assets` |
| pace | ≤ 3.3 words a second, 100% | generator |
| loudness | −16 ±1 LUFS (under 1.2 s: −19 ±1), true peak ≤ −1.5 dBTP | generator |
| lead-in tails | fall ≤ 2 semitones (aim ≤ 1.5); clean tail | generator |
| BATH words | /ɑː/ in 3 of 3 votes | generator |
| join timing, `breath` | speech end → next speech start: **250 ± 20 ms** | the bot's audio log (scheduled start times plus speech edges) in continuous runs; and offline, on 100 assembled utterances per sound template |
| join timing, `sentence` | **450 ± 30 ms** | the same |
| longest silence inside one template utterance | ≤ 600 ms. Today the pause before a slot is about 270–620 ms, and varies by scene | the same |
| pure sound level in a sentence | active level within ±3 dB of the lead-in's last 500 ms, after the gain table | offline assembled utterances |
| splice joins (repairs) | F0 step ≤ 2.5 semitones, tight energy step ≤ 8 dB, MFCC distance ≤ 60 | generator |

### 7.3 Transcripts

These run in continuous runs with the perfect and learner personas over the full journey, through `script-audit.ts`, and in the headless runner:

| audit | what | target |
|---|---|---|
| `carrier-colon` | A line ending in "…", ":" or "—" directly followed by a word clip that isn't a demonstration. Any line in play matching `/(this\|the) (word\|sound)(\.\.\.\|:)$/` followed by a slot. Any "Say this word slowly…" or "Say this sound…" shape. | **0**. Today, inventory rows 1–4 alone: about 7.5, 9.2 and 3.6 compositions per 10 minutes (the swap one has four joins), plus every "Spell…" and "Build the word…" lead before a dictation word. |
| `word-after-lead` | a `word:` clip within 0.7 s after a lead-in, unless it's marked `demo` | **0** |
| `word-after-lead`, as amended (critic) | Judge it on the logged parts, not on timing. A 450 ms `sentence` join is under 0.7 s, so the timing rule would flag the design's own `~bare` words that stand alone after a full sentence: `w_catch`, `s_say_read`, `n_reader_right`, `w_run_wrong`. Flag a `word:` clip only when the part before it, in the same `say` group, is a speech piece that ends on "…", or a `{ join: "breath" }` without `demo`. Keep the 0.7 s timing rule only for `say()` arrays that aren't templates. | **0** |
| `first-ask-names-word` | the first position question of each building item names the word | **100%** |
| `sound-mid-phrase` | a pure sound followed within the same phrase by fewer than 2 words, or by a second sound (R2, R3) | **0** |
| `template-fallback` | `tpl-miss` events | **0** in a release build; ≤ 1% of template utterances in a preview |
| `clip-text` | every `t:` clip id resolves to a text matching the template, with a current input hash | **100%** |
| `echo` | unchanged thresholds, with the template id as the shape token | as today |
| slot joins per 10 minutes | a word inside a sentence without a join; sound joins all `breath` | today's 26–59 slot joins per 10 minutes (inventory) become 0 word joins after a lead-in. Every sound join is a designed breath. |

### 7.4 Sizes and memory

| budget | target | expected (sizes.ts) |
|---|---|---|
| files in `dist` | ≤ 80,000 (the deploy gate) | 8.0k Year R · 12.4k Year 1 · 23.7k whole programme (**(critic)** about 27k, with the libraries growing) |
| bytes under `/a/t/` | Year R ≤ 60 MB · Year 1 ≤ 125 MB · whole programme ≤ 300 MB | 51 · 108 · 256 MB |
| the largest file | ≤ 25 MiB (Cloudflare) | under 30 KB |
| a level's warm list | ≤ 60 clips and ≤ 600 KB | about 32 clips and 420 KB (Word Building or battle, 10 words) |
| a level's clips decoded, if all played | ≤ 8 MiB at 24 kHz | about 6.1 MiB |
| live decoded audio in the phone soak | ≤ 64 MB (PERF); the least-recently-used store levels off at 40 MiB | unchanged |
| a re-recorded clip | re-fetches ≤ 1/16 of its template folder | as delivery.md §5.3 (17 of 300 clips re-fetched) |
| `_index.json` | ≤ 120 KB raw per template | about 95 KB, for `w_position_q` |

---

## 8. Decisions (for integration to log in DECISIONS.md)

| # | decision | why | reversible by |
|---|---|---|---|
| SPT1 | **Words are said inside the take, never joined in at run time.** A word clip follows a lead-in only as a demonstration (`~fast`, `~slow`, `~sounds`); otherwise it stands alone between sentences. | Experiments: whole takes 72–92%, runtime word joins 28–42%. Jonas's two examples. | the catalogue |
| SPT2 | **Pure sounds sit at a phrase end, one per phrase, after "the sound…" where the wording allows.** A second sound needs its own lead-in. TS §1's "never inside a sentence" becomes "at a phrase end", so the official "This is the way we spell /k/ in this word." is said as written. | T4: 96% vs 4%. The official Sounds~Write wording. | `check()` |
| SPT3 | **Joins are timed from speech to speech on the audio clock:** a breath of 250 ms, a sentence of 450 ms. This replaces FIRST_MINUTES §12's 350–450 ms before a sound. | Today's pause before a slot is about 270–620 ms and varies by scene; the long end is the quiz voice, and ≥ 80 ms already marks a boundary. **Jonas's A/B picks the final value.** | one constant per join kind |
| SPT4 | **Four tiers: whole, sound, sequence, splice.** Splice is offline only and has 0 templates at launch. Rejected: runtime word joins, harvested filler libraries, cross-template donors, neural editing and sprites. | §2.1 | – |
| SPT5 | **A building item names its word once** ("What's the first sound in mat?"); later asks are the fixed "What's the next sound?". | The official wording, and it saves 3,600 clips across the whole programme. | `w_position_q`'s domain |
| SPT6 | **Examples are only the canonical, pinned whole sentences.** `teach.ts`'s spliced `list()` fallback is deleted. | Extends DECISIONS 26 Sep ("spliced word lists sounded choppy"). | – |
| SPT7 | **Fallbacks are a whole sentence, then the clip alone.** Three new lines. The build fails on any reachable value without a clip, and fallbacks are counted in transcripts. | "Never a missing clip", and never an ugly one. | – |
| SPT8 | **Template clips live at `/a/t/<template>/<piece>-<key>.mp3`**, as MP3 at 24 kHz, 48 kbps, with FLAC masters that git ignores. Service-worker buckets per folder: `clamp(ceil(files/128), 1, 16)`. | delivery.md; about 420 caches instead of about 2,000. | – |
| SPT9 | **Template ids are snake_case with slot-kind prefixes** (`w_`, `s_`, `ws_`, `ww_`, `ss_`, `n_`, `fs_`): the inventory's ids, lowercased. | File-safe; they read like the inventory. | – |
| SPT10 | **Kai's and Suki's readings are whole takes per reader × read-check word** ("Kai says at."), 240 clips across the whole programme. | 2 × a small set is cheap. The word is the focus, at the end of the sentence. | – |
| SPT11 | **The pilot gates everything.** No lane renders its full set until Jonas's blind test passes §7.1. | His ear is the real test; the judge agreed with itself only 71% of the time. | – |
| SPT12 (critic) | **Nothing is adopted.** Every template piece is rendered into `/a/t/`. Legacy lines retire when their template ships. | Adoption saves about 15 min of rendering, and it costs a second code path and mixed takes inside one sentence. It also let a wording mismatch through (`tv_idle_look_sock`). | `src` in the catalogue |
| SPT13 (critic) | **Whole pieces pass a fluency gate:** no silence of 250 ms or more inside a clause, and the most fluent passing take is kept. Templates that talk about a word get up to 6 takes, then a D repair. | The critic judged 60 whole takes: 48 of "Say {word} slowly." in four phrasings, plus the experiment's T1 and T2. An odd pause was heard in 1 of 9 takes whose longest silence was under 150 ms, and in 14 of 28 at 250 ms or more. | the threshold |
| SPT14 (critic) | **Picture noun phrases come from `src/content/nouns.ts`** (`np`, `number`, `kind`). Actions and qualities never fill a noun-phrase slot. Function words and homographs are quoted in the TTS text, and every such clip is judged. | R9, R10: the reference `speak()` says "This is a feet." and "Can you find the swim?", and Whisper passes them. | – |
| SPT3, amended (critic) | The breath's starting value is **150 ms**, filled with the lead-in's own tail. The pilot picks between 150 and 250 ms and between the two lead-in styles. | D (150 ms) was the experiment's best sound method, and 150 beat 250 in the critic's run (12/18). | one constant |

---

## 9. Requests for files I may not edit

The teacher-voice-petals-scroll workflow is editing these now, or they are shared.

1. **`src/engine/audio.ts` (F1).** §5.2 in full. Also delivery.md §8.3: the 24 kHz decode, the decode queue, `warm()`, the content-type guard, `urls.tpl`, and the `say` group id for the bot's log (inventory.md's request).
2. **`src/content/lines.ts` (F2).**
   - Add `tv_listen_word` "Listen to your word.", `tv_kai_reads` "Here's how Kai reads it." and `tv_suki_reads` "Here's how Suki reads it."
   - Re-record `tv_guess_q` as "Listen for the word.", `tv_won_one`…`tv_won_four` as whole sentences ("You won back two sounds!"), `t_everyone_say` as Sounds~Write's "Everyone say that sound.", and `same_sound_spelling` ending on a full stop.
   - At P3, move the 84 replaced lead-ins and the 9 unused ones into `RETIRED_LINES` (catalogue.md §4).
3. **`src/content/teach.ts`, `src/engine/feedback.ts`, `src/scenes/narrate.tsx`, `src/content/narrative.ts` (F2).** The §6.2 rows. Wire up `sayHere` and `whichSound` through `s_say_here` and `ss_does_it_have`.
4. **`src/core/**` (F2).** §5.3: `UttPart` and `UtteranceSpec`, `LineBook.utter`, `durations`, template metadata in `line-tags.ts`, and `tpls` on `UtteranceCore`.
5. **`src/content/templates.ts` (new, F2).** Promote `playtest/speech-templates/design/template.ts` and `catalogue.ts`, with the test, into `src/content/`. Implement `members()` over the content (the domain names in the catalogue).
6. **`scripts/treadmill/*` (F4).** The §7.3 audits, the template judge, the listening pages, and `t:` clip ids in `transcript.ts` and `bot.ts`.
7. **The scenes (P2 lanes).** The §6.2 rows. In `Early.tsx`, delete the `this_is_a` / `starts_with` / `has_in_middle` fallbacks and the `ListenLevel` lines retired by FIRST_MINUTES §12.
8. **`scripts/gen-audio.ts`.** No change needed: the new generator reuses `scripts/tts.ts`. If F2 prefers one entry point, `gen-audio.ts templates` can call `gen-templates.ts`.
9. **`src/pwa/sw.template.js`, `vite.config.ts`, `wrangler*.jsonc`, `scripts/preview.sh`, `scripts/release.sh`, `scripts/check-assets.ts`.** delivery.md §8, plus:
   - adaptive buckets (SPT8);
   - JSON allowed under `/a/t/`;
   - the template coverage check (§2.5);
   - the 80,000-file gate.
10. **Docs, at P3.** TEACHER_SCRIPT §1 and §9.7, FIRST_MINUTES §12, PERF.md, DECISIONS.md (§6.4 and §8).
11. **(critic) `src/content/nouns.ts` (new, F2, content).** One row per picture: `np`, `number` (`sg`, `pl` or `mass`) and `kind` (`thing`, `action` or `quality`).
    - Draft it with an LLM pass over the pictures (233 distinct in the unit files today, 800 planned), then check it against today's hand-written lines ("This is some jam.", "This is the sun.").
    - The content check fails on a missing row (R9).
12. **(critic) The reference code in `playtest/speech-templates/design/`,** before it is promoted (F2):
    - `template.ts`:
      - take the article's vowel set from `sw.ts` (add `eer` and `schwa`);
      - quote function-word and homograph values in `pieceText()` (R10);
      - add `pl:` text and the R9 check;
      - drop `src` and `legacyId` (SPT12).
    - `report.ts`: compare the *words* of adopted family members, not only their shape. It passes `tv_idle_look_sock` today.
    - `sizes.ts`:
      - no adopted clips;
      - count `dist` files with the libraries growing;
      - use 2.9 takes a clip.
13. **(critic) `src/engine/audio.ts` (F1), additions to item 1:**
    - find speech edges relative to each clip's peak (−40 dB);
    - treat a rejected fetch as a missing clip, so the fallback plays;
    - `warm()` the next two map nodes.
14. **(critic) `src/pwa/sw.template.js`:** precache at install every line a fallback can play (11 today) and `/a/p/`.
15. **(critic) `scripts/gen-templates.ts` (new) and `scripts/lib/template-qa.ts` (new):**
    - the fluency gate, the short-piece pace rule, and the quoted-value judge (§3.3);
    - lead-ins keep up to 300 ms of their own tail (§1.2);
    - the placeholder-cut lead-in mode (§1.6), with its residue check;
    - the input hash without a pipeline version (§3.6).
16. **(critic) `scripts/treadmill/*` (F4):**
    - the amended `word-after-lead` (§7.3);
    - `jev-lint-lines` and SCRIPT_STYLE over template text (§5.4);
    - the pure-sound sentence in the "one take, or joined?" prompt.

---

## 10. Evidence, and how to re-run it

| file | what |
|---|---|
| [`playtest/speech-templates/design/template.ts`](../playtest/speech-templates/design/template.ts) | the model: `parse`, `check` (R1–R8), `speak`, `textOf`, `clipsOf`, `renderJobs`, `positions` |
| [`playtest/speech-templates/design/catalogue.ts`](../playtest/speech-templates/design/catalogue.ts) | the 122 templates: text, slots, tier, domain, adopted pieces, fallbacks, what they replace, inventory rows, lanes |
| [`playtest/speech-templates/design/template.test.ts`](../playtest/speech-templates/design/template.test.ts) | 14 tests. The catalogue passes the grammar. The ruled-out shapes fail ("Say this sound: {s}", "Change {a} to {b}.", "{t} stays the same.", "Is it {s}?"…). `speak()` output, captions, adopted families, articles, clip-text round trips, fallbacks. |
| [`playtest/speech-templates/design/sizes.ts`](../playtest/speech-templates/design/sizes.ts) → `sizes.json` | the §2.2 numbers |
| [`playtest/speech-templates/design/report.ts`](../playtest/speech-templates/design/report.ts) → [speech-templates/catalogue.md](speech-templates/catalogue.md) | the catalogue with sizes and slot positions, the re-records, the new lines, and every lead-in's fate |
| **(critic)** [`playtest/speech-templates/critic/render.ts`](../playtest/speech-templates/critic/render.ts) | 48 takes of "Say {word} slowly." in four phrasings (+ "Now…", "Can you…?", "Let's… together"), 6 words × 2 takes, finished like every line |
| **(critic)** [`playtest/speech-templates/critic/assemble.py`](../playtest/speech-templates/critic/assemble.py) → `critic/fluency.json`, `critic/breath/` | the longest silence inside each whole take, and speech-only pace. The design's sound shape (the experiment's "Say the sound..." take, then the pure clip at 150 / 250 / 400 ms from speech to speech) |
| **(critic)** [`playtest/speech-templates/critic/judge.ts`](../playtest/speech-templates/critic/judge.ts) → `critic/judge.json` | 60 single-clip judgements (natural, odd pause, word clear, pace) and 72 blind pair votes (250 ms against 150 ms, 400 ms, C and D) |

```
bun test playtest/speech-templates/design
bun playtest/speech-templates/design/sizes.ts
bun playtest/speech-templates/design/report.ts
# (critic)
doppler run -p os-legacy-2026-04 -c dev -- bun playtest/speech-templates/critic/render.ts
playtest/runs/speech-templates/.venv/bin/python playtest/speech-templates/critic/assemble.py
doppler run -p os-legacy-2026-04 -c dev -- bun playtest/speech-templates/critic/judge.ts
```

**Assumptions in the sizes**, which the real `members()` replaces with exact counts:
- **Planned vocabulary:** 850 words to the end of Year 1, and 2,100 words and 800 pictures across the whole programme. That is DECISIONS' figure; the unit files hold 933 words and 249 pictures today.
- **Upper bounds:**
  - `w_sort_where`: every Extended Code word.
  - The picture templates: every picture.
  - Read-check words: 120 / 180 / 240, from today's 12 pairs in early levels.
- **Estimates:**
  - Demo words: 2 per unit.
  - Durations: 2.6 words a second, plus 0.25 s.
  - 6.3 KB a second at 48 kbps.


**(critic) Results of those runs** (Gemini 3.8 Flash, one vote per clip at temperature 0; pairs as in the experiment):

| takes | n | naturalness (mean of 10) | odd pause around the word | an inner silence of 150 ms or more | word clear |
|---|---:|---:|---:|---:|---:|
| experiment A, "Say {word} slowly." | 6 | 6.3 | 5 | 5 | 6 |
| "Say {word} slowly." | 12 | 7.6 | 4 | 11 | 12 |
| "Now say {word} slowly." | 12 | 7.8 | 4 | 12 | 12 |
| "Can you say {word} slowly?" | 12 | 7.5 | 4 | 11 | 12 |
| "Let's say {word} slowly, together." | 12 | 7.2 | 4 | 12 | 12 |
| experiment A, "Can you find the {word}?" | 6 | 8.7 | 1 | 0 | 6 |

The phrasing doesn't fix the pause; picking the take does.

| the design's shape (250 ms) against | votes won by 250 ms | 250 ms called spliced | the other called spliced |
|---|---:|---:|---:|
| 150 ms, same lead-in | 6/18 | 15/18 | 10/18 |
| 400 ms, same lead-in | 12/18 | 13/18 | 17/18 |
| C: placeholder-cut carrier, no gap | 6/18 | 12/18 | 9/18 |
| D: placeholder-cut carrier, 150 ms room tone, pitch glide | 6/18 | 15/18 | 7/18 |

**Caveats:**
- The 150 / 250 / 400 ms comparison is clean: the same cut, only the gap differs.
- The comparison against C and D is not. The critic's clips cut the lead-in at −45 dB with a 5 ms fade and used digital silence, while C and D kept the take's room tone.

---

## 11. Open risks (critic)

Ordered by how likely each is to stop this "working super well". Each row says what limits the risk, and when it gets checked.

| # | risk | why it matters | what limits it | checked |
|---|---|---|---|---|
| 1 | **Jonas's own example may still not beat today's shape.** "Say mat slowly." comes out of Gemini with a pause around the word in about a third of takes. On T1, the judge preferred "Say this word slowly… mat" 61–67% of the time. | It is the headline example, and it's the kind of template (a word being talked about) behind `w_listen_again`, `w_sort_where`, `ww_change` and `w_i_say_slowly`. | The fluency gate plus up to 6 takes. By the critic's run, 26 of 54 takes pass the 250 ms limit, so 6 takes all fail about 2% of the time. Then D repair from a fluent master carrier (§2.1). The pilot compares phrasings (§6.1). | P1, Jonas's ear |
| 2 | **No sound shape may beat today's by Jonas's ear.** In the experiment every sound method was within 20 points of the others (18 votes a pair). The critic's run favours 150 ms and placeholder-cut lead-ins, on equally small numbers. | Jonas's first example is a sound. | The lead-in style × breath arm (§6.1 a). If nothing passes, sounds keep today's timing and only the wording changes, and that's logged. That still delivers "say the sound a" rather than "say this sound: a". | P1 |
| 3 | **Picture grammar** (R9): about 30 of the 233 pictures are actions, mass nouns, plurals or unique nouns. | "This is a swim." is shipped silently: Whisper matches the text it was given. | `nouns.ts` and a build error. Actions go to word templates. | P0 content check |
| 4 | **Function words and homographs as values** (R10). | TTS weak forms ("Say /ət/ slowly") and wrong readings (live /laɪv/) pass Whisper. | Quoting, and judging every one of these clips. Jonas's listening page lists them. | generator; P2 per lane |
| 5 | **The judge is a weak instrument.** The two models agree on 71% of items. It rewards clean breaks (B won T1) and is weak on pure sounds. | Gates built on it can pass bad clips or block good ones. | Gates relative to a control set (§7.1). Jonas's ear decides the pilot. The judge only screens at scale. | every gate |
| 6 | **Jonas's time is the bottleneck.** 7 pilot templates × 20 values, 4 arms, and a listening page per lane (13 lanes). | The house rules say never to wait on him. Lanes would stall behind the gate. | Order the pilot page by risk (Jonas's two examples first), about 25 minutes. After the pilot, each lane's page is optional: the judge gates it, and Jonas spot-checks later. | P1, P2 |
| 7 | **The model changes or is retired.** `gemini-3.8-flash-tts` is a preview-generation model. | A model bump changes the hash of every clip: about 10 hours of re-rendering, and every phone's `/a/t/` cache. Rendering only the missing clips with a newer model puts two voices in adjacent sentences. | Pin the model id for templates. Re-render template by template, never mixed. Keep the FLAC masters. Turn the ECAPA drift gate on from the first run, against the centroid for the pinned model. | at each model change |
| 8 | **TTS quota.** The render plan assumes 6 calls in parallel and no daily cap. | The whole programme is about 57k takes. A requests-per-day cap would stretch it over days. | Read the project's Gemini quota before P1. `--concurrency` and the resumable journal (§3.6) already handle 429s and restarts. | before P1 |
| 9 | **Repo and disk growth.** `public/a/` is tracked in git (`.git` is 367 MB), and the backup repo on GitHub is public. `.trash/` is already 15 GB, and each `preview.sh` moves its old ~190 MB promote copy there. | `/a/t/` adds about 260 MB at the whole programme, and each re-render of a big template adds its size again. With `/a/t/`, each preview adds about 450 MB to `.trash/`. | Move `/a/t/` out of git (R2, or git-ignored with masters synced) before the Year 1 render. `preview.sh` should use `cp -cR` (APFS clone, delivery.md) and keep only the last few promote copies. Emptying `.trash/` is Jonas's call. | before the Year 1 render |
| 10 | **Enumeration drift.** `members()` has about 35 hand-written domains. | A value a scene can reach but the domain misses is a production `tpl-miss`. | Run the headless runner over every unit in CI with `tpl-miss` fatal, next to `check-assets`' coverage. Over time, fold the small domains into the runner's trace. | P0 |
| 11 | **The second mention.** "Your word is mat. What's the first sound in mat?" names the word twice in a row, each time rendered cold, so each "mat" gets a fresh accent. | A teacher would de-accent a word the child has just heard. Rendered cold, it sounds like being introduced to the word twice. The official wording repeats the word, so the wording stays. | Pilot arm (c): render in context and cut at the sentence break. If Jonas prefers it, `w_position_q` renders that way, at the same file count and double the text. | P1 |
| 12 | **Takes back to back.** A minute of Word Building plays about 10 different template takes. Today it's mostly the same lead-ins. | Takes can differ in pace or pitch register (the experiment's T2 masters fell differently in every take). | Pilot arm (d), and its consistency limits (§7.1). If they fail, choose each take by its closeness to the template's median pace and F0. | P1 |
| 13 | **iOS.** Nothing has been tested on a device: the 24 kHz `OfflineAudioContext` decode, clock-scheduled joins after an audio interruption (a call, the lock screen), and the bucketed service worker as a Home Screen app. | The joins are the whole point, and they are only proven in desktop engines. | The delivery.md §9 device checks, plus a join-timing log from a real iPad in a continuous run (§7.2's ±20 ms). | P0, before P2 |
| 14 | **Story pages and the Baron are out of scope.** Stories stay whole recordings (inventory rows 51–53). No template is spoken by the Baron. | If either gains a slot, the generator has only Sulafat, and the story pages decode at 48 kHz (816 KiB each). | A `who: "baron"` template fails `check()` until the generator has his voice. Story pages can take the 24 kHz decode with the other speech. | when it comes up |
