# Accent audit: are Sensei, the narrator and Baron Muddle really British?

27 Sep 2026. Jonas asked: "are you sure the narrator and sensei have a proper British accent?"

## Verdict

**Mostly, but not reliably.** On a good take, Sensei (Gemini "Sulafat", en-GB) sounds like convincing modern Southern British English. She drops the r in "car", "four" and "her". Her t in "water" and "butter" is a crisp aspirated British t. She says "tomahto", and she uses the broad /ɑː/ in "half", "past", "can't" and "dance". But the model often slips into American (or, for "fast", Northern) pronunciations, and the game has shipped those takes:

| Voice | Convincingly Southern British? | What slips |
|---|---|---|
| **Sensei**: Gemini Sulafat, en-GB (lines, words, story pages, the intro film, the pure sounds) | **7/10 as shipped; 9/10 on a good take.** Most listeners would call her British, but a British parent listening for it will catch American words. | About **1 in 6 r-words** has an American r ("word", "words", "first", "start", "heard"). More than **1 in 4 BATH words** has the flat "a" of "tap" ("fast" in 8 of 22 rabbit lines, "ask", "class", "last", "after"). About **1 in 12 t's** between vowels is flapped ("petal", "letters"). **7 of 43 r-word word clips** are American ("bird", "fur", "girl", "corn", "are", "jar", "flower"). The **pure sounds 'ar' and 'or' end in an r-glide**. The **finale line** is American throughout. |
| **Narrator** | There is no separate narrator. Sensei (Sulafat) reads the story pages and the intro film. Fresh renders were **8/10**: British in all 9 takes. The trailer's narrator, ElevenLabs "George", is British. | The film's `film_5` has a flapped "petals". The two story pages checked are clean. |
| **Baron Muddle**: Gemini Algenib, en-GB | **7/10.** He is British most of the time, and his growly delivery hides a lot. | In 1 of 6 fresh takes, "words" had an American r. The judge hears `baron_w2` as American, and `baron_w5` has a flapped "letters". |

Keeping **en-GB matters.** The same voice asked for en-US had an American r in "car" 2 times out of 2, and flat "grass" and "bath".

**Why the slips got through:** the accent check in `scripts/gen-audio.ts` is a Gemini judge that is shown the words and asked whether the accent is British. That kind of judge **cannot tell**. Given the same kind of prompt, it called a known-American control voice (macOS Samantha) "Southern British" in 15 of 18 votes (see Judge 1 below).

**What this means for the voice picker:** accent is a property of each take, not just of each voice. Any Gemini voice can drift. Judge each candidate over several takes and against British and American anchors, not by one listen. A new Sensei voice also means re-recording every line (about 1,250 clips in `public/a/l` and 65 story clips in `public/a/s`), every word (about 1,240 in `public/a/w`, ~1,000 stretched words in `public/a/x`, the held first sounds in `public/a/o`), and rebuilding all 46 pure sounds in `public/a/p` from the new voice, because they are cut from Sulafat.

### Listen for yourself (2 minutes)

| Listen to | And compare with | What you'll hear |
|---|---|---|
| `playtest/voice-picker/audio/current/sensei-4.mp3` | `…/sensei-4.take2.mp3` | "Now say it **fast**": flat /a/ (American or Northern), then broad /ɑː/ |
| `public/a/l/tv_fs_two_ways.mp3` ("…and a fast way.") | `public/a/l/tv_fs_fast_rabbit.mp3` ("Now the fast way, like the rabbit…") | The same shipped mismatch, in the rabbit lines |
| `public/a/l/finale.mp3` | `public/a/l/film_1.mp3` | An American "World Flower" and a flapped "petal", then a British "World Flower" |
| `public/a/w/bird.mp3` | `public/a/w/her.mp3` | American r-coloured "bird", then a British "her" |
| `public/a/p/or.mp3`, `public/a/p/ar.mp3` | `public/a/w/four.mp3`, `public/a/w/car.mp3` | The pure sounds end in an r, and the words don't |
| `playtest/voice-picker/audio/current/baron-1.take3.mp3` | `…/baron-1.mp3` | Baron's American "words", then his British "words" |
| `public/a/l/film_5.mp3` | `public/a/l/film_2.mp3` | The intro film: flapped "petals" ("peddles"), then a British "petal" |

## Who speaks what today

| Role | Voice | Where | Sample clips |
|---|---|---|---|
| Sensei | Gemini TTS `gemini-3.8-flash-tts`, **Sulafat**, `languageCode: en-GB` (`scripts/gen-audio.ts` `VOICES.sensei`) | Every line (`public/a/l`, about 1,250 clips; 1,180 of the `LINES` in `src/content/lines.ts` are hers), every word (`public/a/w`), stretched and held words (`public/a/x`, `public/a/o`), the pure sounds (`public/a/p`, cut from Sulafat, see `scripts/phonemes/rebuild.py`) | `public/a/l/tv_same_word.mp3`, `public/a/w/car.mp3`, `public/a/p/ar.mp3` |
| Narrator | **Sensei (Sulafat).** The "narrator" speaker type in `src/core/types.ts` is unused | Story pages `public/a/s/*.mp3` (65 clips; `narr` pages use `who ?? "sensei"`). The intro film's narration is `public/a/l/film_1,2,5–8.mp3`, mixed into `public/media/intro_film.mp4` by `scripts/intro-film.py` | `public/a/s/s1_1.mp3`, `public/a/l/film_1.mp3` |
| Baron Muddle | Gemini **Algenib**, en-GB (`VOICES.baron`) | 14 lines, including the film's `film_3` and `film_4` | `public/a/l/film_3.mp3`, `public/a/l/baron_final.mp3` |
| Trailer | Sensei Sulafat and Baron Algenib, plus a narrator: **ElevenLabs v3 "George"** (`JBFqnCBsd6RMkjVDRZzb`, `trailer/trailer.config.ts`) | The trailer only | none in the game |
| Kai and Suki | Sensei's voice reads their answers ("Kai says…") | `public/a/l/kai_says.mp3` | none |
| Ninja kiai shouts | Gemini Leda, pitched up (docs/DECISIONS.md, 26 Sep) | `public/a/fx/kiai_*.mp3` | none |

## How it was checked

1. **The test script**, rendered with today's voices. It is in `scripts/voice-picker/audit-script.ts`:
   - Sulafat: 6 Sensei lines and 3 narrator lines, 3 takes each (27 takes).
   - Algenib: 2 Baron lines, 3 takes each.
   - George: the narrator lines, 1 take each.
   - Sulafat asked for en-US, as a diagnostic.

   The finished takes are in `playtest/voice-picker/audio/current/`. `manifest.json` there gives each take's accent verdict, flags and judge scores. Take 1 is `<line>.mp3`, the others are `<line>.take2.mp3` and `<line>.take3.mp3`, and George's are `<line>.george.mp3`.
2. **Controls with a known accent**, to calibrate every check:
   - British: macOS Daniel (en_GB), ElevenLabs Alice, and ElevenLabs George reading the Baron.
   - American: macOS Samantha (en_US), OpenAI coral, and OpenAI ash for the Baron.
3. **Three Gemini listening judges** (`gemini-3.8-flash`, 3 votes a clip, the options in a fresh random order each vote, temperature 1):
   - **Judge 1**, the prompt as briefed: the words, plus "which accent… rate 1–10… list American features".
   - **Judge 2**, blind: no words given; it transcribes first, then spreads 100 points over nine accents. Tried with Flash and 3.1 Pro.
   - **Judge 3**, ABX: a known British clip and a known American clip of the **same words** (in a random order), then the clip under test, with the question "whose accent does X share?"
4. **Acoustics** (Praat via parselmouth, words located with Whisper, with spectrograms checked by eye, see `audit-evidence/`):
   - **Rhotic r**: an American r pulls F3 down to about 0.6–0.7 of the speaker's usual F3. A British vowel keeps F3 where it is.
   - **BATH**: F2 of the vowel. Broad /ɑː/ is low (for Sulafat about 1,200–1,400 Hz, like "car"). The flat /a/ of "tap" is high (her "tap" is about 1,735 Hz).
   - **t between vowels**: a flap stays voiced right through. A British t has a silent closure (40 ms or more) and a burst.
5. **The shipped library**: every Sensei and Baron line and story page containing a marker word. That is 649 of 1,253 clips (639 Sensei, 10 Baron), plus 43 r-words from the word library and the pure sounds.

## Evidence

### Calibration: which checks can tell British from American?

| Control (known accent) | Judge 1 (briefed): score and "Southern British" votes | Judge 2 (blind, Flash / Pro): % Southern British | Judge 3 (ABX): British votes | F3 in r-words (median of usual) | BATH words with the TRAP vowel | t between vowels |
|---|---|---|---|---|---|---|
| Daniel (British) | 8.7, 16/18 | 81 / 71 | 17/18 | 0.96, 0 of 10 r-coloured | 0/8 | 3/3 aspirated |
| Alice (British) | 10.0, 18/18 | 93 / 87 | 15/18 (vs the macOS anchors) | 0.99 (3 flags of 10; the one inspected, "car", is a tracking error) | 0/8 | 3/3 aspirated |
| Samantha (American) | **8.4, 15/18** | **68 / 60** | **2/18** | **0.63, 9 of 10** | **8/8** | 2/3 flapped |
| coral (American) | 5.6, 9/18 | 51 / 33 | 8/18 (vs the macOS anchors, the weaker pair) | **0.66, 8 of 10** | 7/8 | 3/3 flapped |

Judges 1 and 2 **cannot be trusted** on this material. Given British-sounding words ("Shall we have another go?", "Brilliant!"), they hear a British accent even in an American voice. Judge 1 even claimed Samantha had a "broad /ɑː/ in grass and bath and completely non-rhotic pronunciation", which the acoustics show is false. The ABX judge with the ElevenLabs Alice and OpenAI coral anchors separates the controls well: Daniel 17/18 British, Samantha 2/18. The acoustic measures separate them cleanly. So the verdict rests on the ABX judge and the acoustics.

### The test script with today's voices

| Voice | Judge 1: score, "Southern British" votes | Judge 3 (ABX): British votes | r-words (F3) | BATH vowel (F2) | t between vowels | tomato |
|---|---|---|---|---|---|---|
| **Sulafat as Sensei** (18 takes) | 9.7 overall, 78/81 across all 27 takes | **51/54.** The 3 American votes were all for sensei-4 take 1, "Now say it **fast**" | 42 tokens, **none r-coloured** (median 0.97; the one flag, "dear", is a tracking error) | "half", "past", "can't" and "dance" broad in 3 of 3 takes. **"fast" flat in 3 of 6** (F2 1,650–1,760 Hz; her "mat" is 1,650–1,750). "grass" and "bath" fronted in 1 of 3 takes | 9 of 9 aspirated (closures of 85–210 ms) | "tomahto" 3/3 |
| **Sulafat as narrator** (9 takes) | (included above) | **27/27** | "far", "World", "Flower" non-rhotic | none to test | none to test | none to test |
| **Algenib as the Baron** (6 takes) | 7.5, 14/18 | **14/18.** baron-1 take 3: 0/3 | **"words" r-coloured in take 3** (F3 0.68–0.73; takes 1 and 2 at 0.93–0.98) | none to test | none to test | none to test |
| George, the trailer narrator | 9.8, 9/9 | 8/9 | non-rhotic | none to test | none to test | none to test |
| Sulafat, **en-US** (diagnostic) | 7.5, 13/18 | 10/18 | **"car" r-coloured 2/2** | "grass", "bath", "fast" flat; "half" and "past" broad | aspirated | index 0.2 |

The spectrograms are in `audit-evidence/1-car-rhotic-vs-not.png` and `2-bath-trap-vowels.png`.

### 20 real game clips

| Clip | Judge 1 (briefed) | Judge 3 (ABX): British votes | Acoustics |
|---|---|---|---|
| 10 Sensei lines: `fm_starfish_q`, `tv_same_word`, `fm_opt_q2`, `help_name`, `jump_pick`, `audit_middle_place`, `world_5`, `film_1`, `film_6`, `finale` | 27/30 Southern British | 9 lines 3/3; **`finale` 0/3** | **`finale`**: American r in "World" (F3 falls to 1,900 Hz) and a flapped "petal". `help_name` "ask", `fm_opt_q2` "class" and `tv_same_word` "fast" have the flat vowel, which the judge missed |
| 2 story pages: `s1_1`, `s6_7` | 6/6 | 3/3 each | clean |
| 4 Baron lines: `film_3`, `film_4`, `baron_final`, `baron_w2` | 10/12 | `film_4` and `baron_final` 3/3; **`baron_w2` 0/3; `film_3` 0/3** | `baron_w2`: inconclusive, listen. `film_3`: "words" measures non-rhotic (F3 flat, about 2,400 Hz, like the British anchor), so the judge may be wrong: listen |
| 4 words: `car`, `bird`, `water`, `after` | 11/12 | `car`, `water`, `after` 3/3; **`bird` 1/3** | **`bird` r-coloured** (F3 about 1,900 Hz all the way through, like Samantha's). The others are British: "water" has an aspirated t and no r |

So **16 of the 20 real clips are clearly British. `finale` and `bird` are American. `baron_w2` and `film_3` are doubtful.**

### The shipped library (639 Sensei clips and 10 Baron clips with a marker word)

- **r after a vowel, before a consonant** ("word", "words", "first", "start", "turn", "heard", "world"):
  - 64 of 318 tokens (20%) measured r-coloured, spread over 56 of 272 clips.
  - Checked by eye, 8 of 10 sampled flags were real (`audit-evidence/5-library-r-spotcheck.png`). So about **1 in 6 of these words is said the American way**.
  - Examples: `tut_1` ("Ninja training! **First**…"), `tv_w5_done` ("…you heard the **words**"), `tv_lets_say_read` ("…read the **word**"), `fm_slow_listen` ("Listen to my slow **word**…").
  - The Baron had none in 6 tokens.
- **BATH words:**
  - **14 of 50 tokens (28%)** have the flat vowel of "tap" (F2 of 1,650 Hz or more, with F1 around 1,000 Hz). All 14 were checked by eye. Two more flags were misplaced word timings and are left out.
  - **"fast": 8 of 22 flat**, 10 broad and the rest in between. The flat ones include the rabbit lines `tv_fs_two_ways`, `fm_tap_rabbit`, `tv_fs_now_fast`, `tv_fs_rabbit`, `fm_same_word`, `tv_same_word` and `tv_fs_praise_both`.
  - The others: "ask" 2/3 (`help_name`, `tv_opt_ask`), "class" 2/4 (both in `fm_opt_q2`), "after" 1/2 (`tv_fs_made`), "last" 1/14 (`tut_test`).
  - Spectrograms: `6-library-fast-spotcheck.png` and `10-library-bath-spotcheck.png`.
- **t between vowels:** 5 of 63 Sensei tokens are flapped: `film_5` "petals" (in the intro film), `finale`, `trial_win` and `audit_petal_means` "petal", and `t_three_letters` "letters". The Baron has 1 of 4 (`baron_w5` "letters"). The rest measure as British, but the detector missed `finale`'s flap (it was found by eye), so there may be a few more (`7-library-petal-flaps.png`).
- **The word library:** of 43 r-words, **7 are r-coloured**: `bird`, `fur`, `girl`, `corn`, `are`, `jar`, `flower`. `car`, `star`, `park`, `her`, `turn`, `nurse`, `word`, `first`, `hurt`, `shirt`, `church`, `four` and `more` are British (`3-pure-sounds-and-words.png`, `4-word-library-r-words.png`).
- **The pure sounds:**
  - **'ar' ends in an r-glide**: over its last 100 ms, F3 falls from 3,000 to 2,100 Hz and F2 rises.
  - **'or' ends in an r-glide too**: F3 falls from 3,100 to 1,750 Hz.
  - 'er', 'air' and 'eer' are clean, non-rhotic British.
  - 'ar' and 'or' are not in the word-cutting recipes (`scripts/phonemes/rebuild.py`). They come from Sensei reading texts such as "ar." and "or" (the `tts` field in `src/content/phonics.ts`). The judge that passed them had "no r sound" in its rubric.
  - A British child is taught /ɑː/ and /ɔː/ with no r.

The measurements are evidence, not proof. The r detector raises some false flags (about 1 in 5 of the flags checked), and Whisper's word timings are sometimes loose. Each clip named above was checked on a spectrogram, or by the calibrated judge, or both. The rates (1 in 6, more than 1 in 4) are estimates from the measurements and the spot checks.

## What to do (for the voice-picker and audio workflows; nothing in `src/` or `public/` was changed)

1. **Picking a voice:** audition each candidate over several takes of this test script and compare against the anchors. One good take proves little: Sulafat's good takes are 9/10. ElevenLabs Alice (British female) and George (British male) came out British on the acoustics and to the ABX judge, so they are real alternatives. Remember the cost of changing Sensei: every clip, and the pure sounds.
2. **Gate every new take on accent, whatever voice is chosen.** Use the acoustic checks in `scripts/voice-picker/audit-measure.py`:
   - F3 in r-words;
   - F2 in fast, last, ask, class, after, castle;
   - a closure in petal, letters, little;
   - plus the ABX judge (`scripts/voice-picker/audit-judge-abx.ts`).

   Retake until clean. The current rubric ("score low if the accent is not British") passes American takes.
3. **Re-record what shipped American.** The list is `playtest/runs/voice-picker/audit/fix-list.json`: 80 clips, 36 of them confirmed by eye or by the judge (the other 42 are acoustic flags on "word", "first" and "start", about 4 in 5 of which hold up). First:
   - the pure sounds `ar` and `or`;
   - the words `bird`, `fur`, `girl`, `corn`, `are`, `jar`, `flower`;
   - `finale` and `film_5` (the film);
   - the rabbit "fast" lines;
   - the ~45 "word", "first" and "start" lines.
4. **Jonas:** use the listening table above to decide how much this matters to your ear. The picker app should show these flags per take (`audio/current/manifest.json` has them).

## Files

- Scripts (all `scripts/voice-picker/audit-*`):
  - `audit-script.ts`: the test script and casts;
  - `audit-render.ts`: renders it;
  - `audit-judge.ts`, `audit-judge-blind.ts`, `audit-judge-abx.ts`: the judges;
  - `audit-render-anchors.ts`: anchors for the game clips;
  - `audit-measure.py`: the acoustics, including the `library` mode;
  - `audit-spectro.py`: spectrograms;
  - summaries in `audit-*-summary.py`.
- Data: `playtest/runs/voice-picker/audit/`. It holds `renders.json`, `judge*.json`, `measures.json`, `measures-library.json`, `fix-list.json`, and the raw takes and anchors.
- Spectrograms: `playtest/voice-picker/audit-evidence/`. Red is F3, green F2 and blue F1.

## Update, 27 Sep: one calibrated accent judge

The judges above were one-offs. `scripts/accent-judge.ts` is now the one to use for any take, in any voice: the BATH vowel, a rhotic r and a flapped t, word by word, as a British probability (see `docs/TREADMILL.md`, "The accent judge"). It calibrates on every run against `audio/accent-refs/`: this audit's ElevenLabs Alice and OpenAI coral takes (coral with no accent instruction; the picker's own coral takes were asked for a British accent, so they are no American control), copied out of the gitignored `playtest/runs/voice-picker/audit/`, plus the picker's George narrator takes. `refs.json` there lists each clip's sentence and target words. If the references stop separating, it refuses to judge.

For the picker: judge a candidate's takes with it (`bun scripts/accent-judge.ts take.mp3 --text "…"`), and count a take British at 80 % or more on every word. Alice and George come out British on all three markers. Coral with no instruction comes out American on all three. The r and the t are asked against a British and an American "Bird." and "Water." (`refs.json` `anchors`). When you pick the best of many takes, give it 21 fresh votes before trusting it: on 27 Sep two picks at 81 % and 86 % fell to 69 % and 55 %. And judge a voice on several sentences: Erinome's r in "word" came and went with the words around it.
