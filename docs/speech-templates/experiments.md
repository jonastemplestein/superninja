# Speech templates: the audio experiment

27 Sep 2026. The question from Jonas: can the game say "Say mat slowly" and "Say the sound /a/" instead of "Say this word slowly... mat", everywhere, and sound natural? This is the head-to-head listening test of the ways to make those clips. Every clip is in `playtest/speech-templates/experiments/<method>/`, with a listening page at `playtest/speech-templates/experiments/index.html`. It has a **Blind** button, so you can pick favourites by ear before you see the method names.

## The short answer

| template type | winner | runner-up | don't use |
|---|---|---|---|
| **One word in a sentence** ("Say {word} slowly.", "Can you find the {word}?") | **A, a whole sentence per word** (TTS), tied with **D, a prosody-matched splice from a take of the same sentence** | D3, a donor from a *different* sentence with the same word before the slot (61% of its votes; A beats it head to head: 72–100% of the fast judge's votes, 56–67% of Pro's) | a word clip dropped into a carrier (C), the library clip reshaped (C2), generic donors (D2), F5-TTS editing (E): the judge hears the join 76–94% of the time (E on names excepted) |
| **Two words** ("Tap {word}, then tap {word2}.") | **A ≈ D** (A 92%, D 87% of votes); D is the only way that stays linear in the vocabulary | – | everything else (≤ 63%) |
| **A name** ("{name} read it right!") | **A ≈ D** (80% each). There are only two names, so record whole sentences | E (73%) | B, C, C2 |
| **A pure sound at the end** ("Say the sound /a/.") | **nothing clearly wins**. D (lead-in with its tail glided towards the sound's pitch, a 150 ms room-tone pause, level-matched) 59%, C 57%, A 44%, B 39% | – | – |
| **Two pure sounds** ("Change /s/ to /m/.") | **B's shape**: two lead-ins, each ending suspended, "Change this sound... /s/ ...to this sound... /m/" (96%) | C 54%, D 46% | one sentence with gaps for the sounds, "Change... to..." (A, 4%) |

In plain words:

1. **Whole sentences are still the gold standard for words**, and they are cheap: Gemini TTS takes 1.6 s a clip. The catch is the count: templates × words (× words again for a template with two word slots).
2. **A splice can be as good as a whole sentence, but only if the word comes from a take of the same sentence.** With that donor, the refined splice (D) won 76% of all its votes, the most of any method, against 72% for whole sentences. Head to head against A, it won 56–67% of the fast judge's votes on every template, while the Pro judge preferred A on T1, T2 and T6 (D won 39–44% of those): a tie. The judge called D "spliced" about as often as the real single takes (T2: 13% vs 11%). D's win comes from **where it cuts**. It joins inside the word *before* the slot, which both takes say, so the transition into "mat" is the donor's own. It keeps the donor's own stop closures and pauses. And the word takes the master's melody: its own tune on a sentence-final word, the master's elsewhere. The first version of the splice, which cut at the word boundaries, lost 53 of 60 votes to the third.
3. **Reusing one recording of a word across different sentences is audible**, however carefully it is processed. Library word clips reshaped in pitch and duration (C2) won 28% of their votes. Generic donors ("I think {w} is next.", "The last word is {w}.", D2) won 30%, and the judge called them spliced 80–94% of the time. Donors that share the word before the slot (D3: "Say {w} now." for "Say {w} slowly.") got most of the way on T1 (67% overall; the Pro judge gave it 44% against A). They failed when the boundary after the word differed: "Tap {w} now." has no pause, but T6 needs the comma in "Tap {w}, then". **So a word's recording can be shared only between templates with the same word before the slot, the same kind of boundary after it, and the same sentence type.**
4. **Pure sounds are fine at the end of a suspended lead-in.** The wording barely matters ("Say the sound..." ≈ "Say this sound..."). What matters is the shape. One sound per lead-in, at a phrase end. Two sounds need two lead-ins.
5. **Neural speech editing (F5-TTS) isn't ready for this.** It runs on this Mac: 15 minutes to set up, 2.6 s an edit. But it misheard 3 of 20 target words ("find the meth", "the site", "tap sop"), re-voices the whole clip through its vocoder, and was called spliced 76–85% of the time on T1, T2 and T6.

## What was tested

Six templates, each with six slot values (T5 has only Kai and Suki). **Words:** mat, sun, ship, rain, frog, sock. **Sounds:** the QA'd pure clips in `public/a/p/` for /a/, /s/, /m/, /sh/, /d/ and /ie/.

| | template | slot values |
|---|---|---|
| T1 | Say {word} slowly. | the 6 words |
| T2 | Can you find the {word}? | the 6 words |
| T3 | Say the sound {sound}. | the 6 sounds |
| T4 | Change {sound1} to {sound2}. | a→ie, s→m, m→d, sh→s, d→m, ie→a |
| T5 | {name} read it right! | Kai, Suki |
| T6 | Tap {word}, then tap {word2}. | mat→sun, sun→ship, ship→rain, rain→frog, frog→sock, sock→mat |

Every voice is Sensei: Gemini `gemini-3.8-flash-tts`, "Sulafat", en-GB, plain text. Each script was rendered twice (three times for the masters). The take with the best production-rubric judge score was kept, as `gen-audio.ts` does. Every output was finished the same way: trimmed, 25 ms fades, −16 LUFS (−1.5 dBTP limit), 50 ms pad, and MP3 for listening. A pure sound is never synthesised or pitch-shifted, only gain-matched.

### The methods

- **A: whole-sentence TTS per combination.** "Say mat slowly." as one take. Pure sounds can't be TTS'd, so for T3 and T4 the words were rendered around pauses ("Say the sound...", "Change... to..."), and the pure clip went in the pause, 400 ms after the words (the §12 rule of `docs/FIRST_MINUTES.md`).
- **B: today's style.** A lead-in that ends suspended ("Say this word slowly...", "Can you find...", "Say this sound...", "Change this sound..." + "To this sound...", "The one who read it right is...", "Tap..." + "Then tap..."), 400 ms, then the library clip, with 300 ms before the next lead-in. Everything plays at the library's own levels, the way the game plays it now.
- **C: naive splice.** One master carrier with a filler in the slot ("Say pig slowly."). The filler is cut out at its forced-aligned boundaries, and the library clip (`public/a/w/<word>.mp3`, or the pure clip) is dropped in with 10 ms fades.
- **C2: the library clip, processed.** C's clip, given D's processing (below). This asks whether processing can rescue the ~1,240 word clips we already have.
- **D: the prosody-matched splice** (`tools/splice.py`, the third version). The donor is the item's own two A takes; the one needing less pitch change is used. It is spliced into the same master carrier as C, which was chosen from three takes as the one needing the least pitch change across the donors (unit-selection style).
  - **Alignment.** torchaudio MMS_FA (wav2vec2 CTC forced alignment, char level). Boundaries are refined to the quietest 10 ms between words.
  - **Where to cut.**
    - Before a real pause (≥ 350 ms of silence), cut in the silence and keep the master's pause.
    - Otherwise, drop the filler's own stop closure (80 ms) and keep the donor's onset.
    - When the donor is the same sentence, join **inside the neighbouring word both takes say** ("sa|y", "th|e", "ta|p"). The point is where the two takes are most alike (MFCC, level, F0: optimal coupling), searched over the second half of that word. The transition into the slot word is then the donor's own.
  - **Joins.** Rising zero crossings, 8 ms raised-cosine crossfades.
  - **Pitch.** Praat PSOLA (Manipulation, overlap-add).
    - Most words get the master filler's own F0, mapped through the word and join anchors ("transplant").
    - An utterance-final word keeps its own tune, shifted to meet the master at the join ("auto"). Tuning showed the final word's own tune won on T2 12/18, and the transplant won on T1 and T6.
  - **Level.** K-weighted active level matched to the filler's.
  - **Duration.** The two takes' tempo ratio (clamped to 0.85–1.15).
  - **T3 and T4.** The master's own words, a 150 ms micro-pause filled with the master's room tone, and the pure clip, level-matched (−2 dB for /s/ and /sh/). The carrier's last 250 ms is glided in pitch (≤ 3 st) to 1 st under the sound's onset. The pure clip itself is untouched but for gain.
- **D2: D's processing, generic donors.** Two renders per word serve every template: "I think {w} is next." for a medial slot and "The last word is {w}." for a final one. This is the scalable variant (2 × words clips in total).
- **D3: D's processing, a donor from another sentence with the same word before the slot.** "Say {w} now." for T1, "Look at the {w}." for T2 (with the master's tune, since it's a statement in a question), "Tap {w} now." and "Now tap {w}." for T6. This was added after the first round, to find out whether the shared neighbour is what makes D work.
- **E: neural speech editing.** F5-TTS v1 Base (flow matching; its own `speech_edit.py` procedure: mel-domain mask, 32 steps, CFG 2), on Apple MPS. The master is edited in place ("Say pig slowly." → "Say mat slowly."). The regenerated length is the library word's length × a calibrated in-context ratio. Of two seeds, the one Whisper hears correctly is kept.
  - **VoiceCraft not tried.** Its official setup is Linux/CUDA (audiocraft, xformers, and MFA via conda). F5-TTS covered neural editing in about 15 minutes of setup, well inside the 2-hour budget.

### The measures

- **Blind judge.** Gemini 3.8 Flash audio understanding, paired comparisons. For each item, every pair of methods is played as "Clip 1" and "Clip 2", with no names. Each pair gets three votes: a hashed random order, the reverse, then random again (temperature 1). The prompt asks which sounds more like one natural take by one warm teacher (joins, pitch, loudness, rhythm, melody), says the pure sounds are intended, and asks for each clip whether it was spliced.
  - The totals are 1,818 votes, 67% of pairs unanimous across their 3 votes. The first-played clip won 56%, which the order balancing cancels.
  - **Second opinion.** Gemini 3.1 Pro on the ten key pairs: 810 votes. Pro prefers the second clip (first wins 37%), which is also balanced.
- **Whisper** (faster-whisper medium.en). Word accuracy against the method's own script, and whether the slot words were heard. Homophones count ("Matt", "Kye"). For T3 and T4 only the carrier words count.
- **Join metrics** at every join, and, for A, at the slot word's natural boundaries in the same take (the reference):
  - the |F0 step| (the last 3 voiced frames within 250 ms before vs the first 3 within 250 ms after, in semitones);
  - the |K-weighted level step| of the 200 ms of speech either side;
  - for tight joins only, the |RMS step| over 20 ms and the MFCC (c1–c12) distance.
- **Cost:** the clips needed, and the measured time per clip.

## Results

### Blind judge: share of paired votes won

Each cell is the share of that method's paired votes it won against all the other methods on the same items (so 50% is average). T3 and T4 have four methods; T5 has six.

| method | T1 | T2 | T3 | T4 | T5 | T6 | all |
|---|---|---|---|---|---|---|---|
| **A** whole-sentence TTS | 72% | 89% | 44% | 4% | 80% | 92% | 72% |
| **B** today's lead-in + clip | 85% | 31% | 39% | 96% | 10% | 1% | 43% |
| **C** naive splice | 33% | 29% | 57% | 54% | 33% | 52% | 42% |
| **C2** library clip + processing | 23% | 35% | – | – | 23% | 26% | 28% |
| **D** prosody-matched splice (same-sentence donor) | 71% | 88% | 59% | 46% | 80% | 87% | 76% |
| **D2** prosody-matched splice (2 generic donors per word) | 19% | 40% | – | – | – | 30% | 30% |
| **D3** prosody-matched splice (cross-template donor sharing the neighbouring word) | 67% | 53% | – | – | – | 63% | 61% |
| **E** F5-TTS speech edit | 29% | 35% | – | – | 73% | 48% | 40% |

### Blind judge: share of votes where the clip was called spliced

| method | T1 | T2 | T3 | T4 | T5 | T6 |
|---|---|---|---|---|---|---|
| **A** | 31% | 11% | 57% | 98% | 20% | 10% |
| **B** | 36% | 97% | 69% | 50% | 97% | 99% |
| **C** | 89% | 93% | 46% | 61% | 77% | 84% |
| **C2** | 89% | 80% | – | – | 83% | 93% |
| **D** | 32% | 13% | 50% | 72% | 20% | 25% |
| **D2** | 94% | 84% | – | – | – | 82% |
| **D3** | 43% | 49% | – | – | – | 66% |
| **E** | 85% | 83% | – | – | 30% | 76% |

### Bradley–Terry ranking per template (strengths sum to 1)

| template | ranking |
|---|---|
| T1 | B (0.40) > A (0.19) > D (0.18) > D3 (0.14) > C (0.03) > E (0.02) > C2 (0.02) > D2 (0.01) |
| T2 | A (0.44) > D (0.41) > D3 (0.05) > D2 (0.03) > C2 (0.02) > E (0.02) > B (0.02) > C (0.02) |
| T3 | D (0.32) > C (0.30) > A (0.20) > B (0.17) |
| T4 | B (0.87) > C (0.07) > D (0.05) > A (0.00) |
| T5 | A (0.35) > D (0.35) > E (0.25) > C (0.03) > C2 (0.02) > B (0.01) |
| T6 | A (0.55) > D (0.34) > D3 (0.05) > C (0.03) > E (0.02) > D2 (0.01) > C2 (0.00) > B (0.00) |

### Head to head against A (whole-sentence TTS): share of votes the method won (votes)

| template | A | B | C | C2 | D | D2 | D3 | E |
|---|---|---|---|---|---|---|---|---|
| T1 | · | 61% (18) | 22% (18) | 11% (18) | 56% (18) | 6% (18) | 28% (18) | 11% (18) |
| T2 | · | 0% (18) | 0% (18) | 0% (18) | 67% (18) | 0% (18) | 11% (18) | 0% (18) |
| T3 | · | 39% (18) | 61% (18) | – | 67% (18) | – | – | – |
| T4 | · | 100% (18) | 94% (18) | – | 94% (18) | – | – | – |
| T5 | · | 0% (6) | 0% (6) | 0% (6) | 67% (6) | – | – | 33% (6) |
| T6 | · | 0% (18) | 0% (18) | 0% (18) | 56% (18) | 0% (18) | 0% (18) | 0% (18) |

### Head to head: D's share of votes against each method (votes)

| template | A | B | C | C2 | D | D2 | D3 | E |
|---|---|---|---|---|---|---|---|---|
| T1 | 56% (18) | 44% (18) | 83% (18) | 78% (18) | · | 94% (18) | 56% (18) | 89% (18) |
| T2 | 67% (18) | 100% (18) | 94% (18) | 83% (18) | · | 94% (18) | 83% (18) | 94% (18) |
| T3 | 67% (18) | 50% (18) | 61% (18) | – | · | – | – | – |
| T4 | 94% (18) | 0% (18) | 44% (18) | – | · | – | – | – |
| T5 | 67% (6) | 100% (6) | 83% (6) | 83% (6) | · | – | – | 67% (6) |
| T6 | 56% (18) | 100% (18) | 89% (18) | 100% (18) | · | 94% (18) | 78% (18) | 94% (18) |

### Second opinion: share of votes the first method won, Gemini 3.8 Flash / Gemini 3.1 Pro (items where the two judges' majorities agree: 191/270)

| pair | T1 | T2 | T3 | T4 | T5 | T6 |
|---|---|---|---|---|---|---|
| A vs B | 39% / 33% | 100% / 100% | 61% / 50% | 0% / 6% | 100% / 100% | 100% / 100% |
| A vs C | 78% / 61% | 100% / 100% | 39% / 39% | 6% / 11% | 100% / 100% | 100% / 83% |
| A vs C2 | 89% / 72% | 100% / 100% | – | – | 100% / 83% | 100% / 94% |
| A vs D | 44% / 61% | 33% / 61% | 33% / 56% | 6% / 28% | 33% / 83% | 44% / 56% |
| A vs D3 | 72% / 56% | 89% / 67% | – | – | – | 100% / 67% |
| A vs E | 89% / 67% | 100% / 94% | – | – | 67% / 17% | 100% / 78% |
| B vs D | 56% / 78% | 0% / 0% | 50% / 67% | 100% / 61% | 0% / 33% | 0% / 0% |
| B vs C | 100% / 89% | 50% / 22% | 28% / 44% | 89% / 72% | 33% / 67% | 0% / 22% |
| C vs D | 17% / 33% | 6% / 0% | 39% / 39% | 56% / 56% | 17% / 50% | 11% / 11% |
| D vs E | 89% / 61% | 94% / 89% | – | – | 67% / 50% | 94% / 67% |

### Whisper word accuracy (1 − WER) / slot words heard (T3, T4: the carrier words only)

| method | T1 | T2 | T3 | T4 | T5 | T6 |
|---|---|---|---|---|---|---|
| **A** | 100% / 6/6 | 100% / 6/6 | 100% | 92% | 100% / 2/2 | 100% / 6/6 |
| **B** | 97% / 5/6 | 100% / 6/6 | 100% | 100% | 100% / 2/2 | 93% / 4/6 |
| **C** | 100% / 6/6 | 100% / 6/6 | 100% | 75% | 100% / 2/2 | 100% / 6/6 |
| **C2** | 100% / 6/6 | 97% / 5/6 | – | – | 100% / 2/2 | 97% / 5/6 |
| **D** | 100% / 6/6 | 100% / 6/6 | 100% | 75% | 100% / 2/2 | 100% / 6/6 |
| **D2** | 78% / 5/6 | 100% / 6/6 | – | – | – | 97% / 5/6 |
| **D3** | 100% / 6/6 | 97% / 5/6 | – | – | – | 97% / 5/6 |
| **E** | 100% / 6/6 | 93% / 4/6 | – | – | 100% / 2/2 | 97% / 5/6 |

How to read the join metrics:

- A's "joins" are its slot word's natural boundaries, mostly in silences or at consonant onsets, so its spectral distance is large by nature.
- D and D3 join inside a vowel both takes say, so their small distance is partly by construction.
- The informative contrast is among the splices. A word taken from a different context (C2: 86, D2: 77) jumps much more in spectrum than one joined inside a shared word (D: 49, D3: 51). That is the same split the judge heard.
- D's F0 steps (1.2 st on word templates) are smaller than the natural word-to-word movement inside a single take (A: 3.5 st).
- The level steps say little: B's 14 dB is lead-in against library clip (the lines finish at −16 or −19 LUFS by length, the words at −19).

### Join F0 step, mean |semitones| (A = the natural word boundaries in one take)

| method | T1 | T2 | T3 | T4 | T5 | T6 |
|---|---|---|---|---|---|---|
| **A** | 6.2 | 1.9 | 7.6 | 3.9 | 1.1 | 3.9 |
| **B** | 6.2 | 2.0 | 8.2 | 8.6 | – | 6.6 |
| **C** | 5.6 | 5.2 | – | 8.3 | 10.0 | 5.2 |
| **C2** | 4.4 | 0.3 | – | – | 2.5 | 0.4 |
| **D** | 0.3 | 1.3 | 1.0 | 2.9 | 1.3 | 1.7 |
| **D2** | 2.2 | 0.7 | – | – | – | 0.4 |
| **D3** | 0.4 | 2.3 | – | – | – | 3.8 |
| **E** | 6.6 | 3.4 | – | – | 0.2 | 1.5 |

### Join metrics, all templates

| method | joins | |F0 step| st | |level step| dB | tight live joins | |energy step| dB (tight) | MFCC distance (tight) |
|---|---|---|---|---|---|---|
| **A** | 62 | 4.0 | 6.9 | 18 | 9.0 | 62.4 |
| **B** | 56 | 6.8 | 13.9 | 0 | – | – |
| **C** | 62 | 6.3 | 7.1 | 46 | 16.7 | 62.6 |
| **C2** | 38 | 1.8 | 8.0 | 26 | 11.5 | 85.9 |
| **D** | 62 | 1.7 | 6.6 | 27 | 5.7 | 49.3 |
| **D2** | 36 | 1.1 | 8.1 | 24 | 17.7 | 77.4 |
| **D3** | 36 | 2.2 | 7.5 | 27 | 7.0 | 51.2 |
| **E** | 50 | 3.4 | 11.6 | 21 | 6.3 | 35.1 |

#### Joins, word templates (T1, T2, T5, T6)

| method | joins | |F0 step| st | |level step| dB | |energy step| dB (tight) | MFCC dist (tight) |
|---|---|---|---|---|---|
| **A** | 38 | 3.5 | 6.7 | 9.0 | 62.4 |
| **B** | 32 | 4.7 | 14.6 | – | – |
| **C** | 38 | 5.7 | 8.6 | 17.3 | 62.1 |
| **C2** | 38 | 1.8 | 8.0 | 11.5 | 85.9 |
| **D** | 38 | 1.2 | 7.1 | 5.7 | 49.3 |
| **D2** | 36 | 1.1 | 8.1 | 17.7 | 77.4 |
| **D3** | 36 | 2.2 | 7.5 | 7.0 | 51.2 |
| **E** | 50 | 3.4 | 11.6 | 6.3 | 35.1 |

#### Joins, sound templates (T3, T4)

| method | joins | |F0 step| st | |level step| dB | |energy step| dB (tight) | MFCC dist (tight) |
|---|---|---|---|---|---|
| **A** | 24 | 4.6 | 7.1 | – | – |
| **B** | 24 | 8.5 | 13.0 | – | – |
| **C** | 24 | 8.3 | 2.6 | 15.9 | 63.3 |
| **D** | 24 | 2.5 | 5.9 | – | – |

### Generation time

"Assemble" is this Mac's time from the takes to the finished clip: alignment, cuts, Praat, joins, loudness, MP3. D3's is high because it searched both donor takes' shared words. It is all offline; nothing here runs in the browser.

| step | mean per clip | n |
|---|---|---|
| Gemini TTS call (Sulafat, one take) | 1.57 s | 174 |
| F5-TTS edit on M4 Max MPS (32 NFE, one seed) | 2.64 s | 40 |
| F5-TTS model load (once) | 1.7 s | 1 |
| assemble A | 0.39 s | 32 |
| assemble B | 0.45 s | 32 |
| assemble C | 0.31 s | 32 |
| assemble C2 | 0.51 s | 20 |
| assemble D | 1.00 s | 20 |
| assemble D2 | 1.79 s | 18 |
| assemble D3 | 3.76 s | 18 |
| assemble D_sound | 0.14 s | 12 |

### The tuning rounds that made D work

The first full judge round ran on version 1 of the splice (cuts at the word boundaries, a pitch ramp). It put D at 52% and the reshaped clips at 33–40%, and the judge's reasons named "the word 'the' abruptly cut off", "dead silence between 'say' and 'frog'", "a click before 'mat'" and "an unnatural pitch drop". Each version was judged against the one before (Gemini Flash, 3 votes per item):

| change | votes won by the new version |
|---|---|
| v2: join inside the shared neighbouring word ("th\|e"), cut stop closures and pauses by their silences | 36/60 over v1 (T2: 17/18) |
| v2 own tune vs transplanted tune | T2: own 12/18; T1: transplant 11/18; T6: transplant 13/18, so "auto": own tune on a final word only |
| v3: a pause under 350 ms before the slot is the filler's stop closure plus a gap, so the donor brings its own onset and the shared join happens there too | 45/60 over v2, 53/60 over v1 |
| a bug fixed after round 3: the pitch-transplant time map ran backwards at pause joins, so a word could get the wrong stretch of the master's melody | the final numbers above are after the fix |
| D3 (another sentence, same word before the slot) vs D | T1 9/18, T2 9/18, T6 2/18 |

D in the final table is v3 with the fix. The fix touched C2, D, D2 and D3; all their word-template votes and measures were re-run on the final clips.

## What this means for "everywhere"

**The word inside the sentence has to be recorded inside a sentence like it.** Everything that tried to reuse one recording of a word in other sentences was heard. The acoustic reason is in the join metrics and the judge's notes. A word carries its neighbours' transitions, its position's lengthening, its closure and release, and its tune. Cut from anywhere else, one of those is wrong.

**How to scale it:** render each value *in place* once per slot of each template, then use those renders as follows.

- **One-slot templates (T1, T2, T5):** ship the render as the clip. That's method A, which ties with D.
- **Two-slot templates (T6):** join per-slot renders with D. Record "Tap {w}, then tap cup." and "Tap pig, then tap {w}." for every word, which is 2 × words renders per template instead of words². (The experiment took both donors from the pair's own take. Its first slot ends before the comma pause, where the two versions can't differ. That the second slot's donor would work from "Tap pig, then tap {w}." is an inference, not a result.)
- **Any template, when a take says the word wrong or the carrier drifts:** repair it with D, joining the good word from one take into the good carrier of another. The judge heard D's joins about as often as it "heard" joins in real single takes.

### Sharing across templates

This is the only real saving, and it costs naturalness. Define slot *classes* by the three things that matter: the word before the slot, the boundary after it (none / comma / sentence end) and the sentence type (statement / question). Then share one donor per class and word. D3 is the only test of that here, with imperfect class matches, and it reached 61%. Measure it before relying on it.

### Pure sounds

Keep the §12 structure: a suspended lead-in, then the sound at a phrase end.

- **One sound:** D's refinements are marginally the best seen. They are a 150 ms pause filled with room tone (not 400 ms of digital silence), the lead-in's tail glided a few semitones towards the sound, and the sound level-matched. "Say the sound..." is as good as "Say this sound...". The differences are small (D 59%, C 57%, A 44%, B 39%) and 18 votes a pair, so this is "don't worry about it", not a finding.
- **Two sounds:** use two lead-ins ("Change this sound... /s/ ...to this sound... /m/"). "Change /s/ to /m/." with the sounds in the gaps failed badly (4%). With short gaps, Whisper even merged "/s/... to" into "tic".

### Cost at full scale

The table assumes 10 word templates.

| | 850 words (now) | 2,100 words (the whole programme) |
|---|---|---|
| A: renders (one slot per template), 2 takes each | 8,500 clips, 17,000 TTS calls | 21,000 clips, 42,000 calls |
| ...wall time at 6 parallel calls, assuming ≈ 4 s a take (1.6 s TTS measured, plus the audio judge) | ≈ 3.1 h | ≈ 7.8 h |
| ...shipped as MP3 (≈ 21 KB a sentence) | ≈ 180 MB, 8,500 files | ≈ 440 MB, 21,000 files |
| D-style word parts instead (≈ 0.7 s, ≈ 7 KB; one carrier per template) | ≈ 60 MB | ≈ 147 MB |
| Two-slot template, A | 722,500 sentences (words²) | 4.4 M, which is impossible |
| Two-slot template, D | 1,700 renders | 4,200 renders |
| F5-TTS edits instead of TTS (2.6 s each, one Mac, 2 seeds) | ≈ 12 h | ≈ 30 h |

- **Cloudflare static assets.** 20,000 files per Worker version on Free, 100,000 on Paid (Wrangler ≥ 4.34), and 25 MiB a file (Cloudflare limits page). `public/` has 4,191 files today. Pack each word's template clips into one file (an audio sprite with offsets in a JSON manifest) to keep the count at about one file per word. Load the clips by level, not in one precache: the service-worker cache is versioned by a hash of `public/a`, so a big library downloads again on every audio change.
- **Memory.** The 64 MB decoded-audio budget is no issue. A 1.8 s sentence decodes to 0.3 MB; a D word part (0.7 s) to 0.12 MB, plus its carrier, decoded once.

## Caveats

- **The judge is a model.** It is inconsistent on pure sounds: A's T3 clips, whose only join is a 400 ms pause, were called spliced 57% of the time. It also favours whatever has a pause at a join: B won T1 (85%) because "Say this word slowly... mat" is two clean utterances. It wasn't judging the wording Jonas wants to change. Two models agree on the item-level majority 71% of the time (191/270). Where they disagree (A vs D), read it as a tie. Jonas's ear is the real test: use the Blind button.
- **The samples are small.** There are 18 votes per pair per template, from 6 items (T5: 2 items). Differences under about 20 points aren't meaningful.
- **Takes vary.** Sulafat said "Can you find the pig?" with a low fall-rise in all three master takes and with a high fall in most donor takes. That's why the tune rule mattered. A production pipeline should render several takes and pick by fit, as D did.
- **The splice uses one master per template.** Its quality depends on that master's takes. The filler words (pig, Tom, cup) all start with a stop; FILLER_CLOSURE in `splice.py` assumes it. A continuant filler would need that changed.
- **Donor frames must release the word's final consonant.** Whisper misheard several spliced words:
  - D3's "mat" as "map", twice (donors "Look at the mat." and "Tap mat now.");
  - D2's T1 "mat" as "map" (as "my" in round 1), and the carrier's "Say" as "Save" three times.

  One case was checked in the waveform. In "I think {w} is next." the final stop runs straight into "is" in some takes: take 2 of "mat" has a 30 ms closure and no pause. The others weren't checked. A phonics game needs clean final consonants, so a donor frame should put the word before a pause.

## Reproduce

Everything is in `playtest/speech-templates/experiments/tools/`. Bulky intermediates (raw takes, WAVs, votes) are in `playtest/runs/speech-templates/`, which git ignores.

```
# Python 3.12 venv: numpy scipy praat-parselmouth faster-whisper torch==2.8 torchaudio==2.8 librosa soundfile matplotlib
uv venv --python 3.12 playtest/runs/speech-templates/.venv
doppler run -p os-legacy-2026-04 -c dev -- bun playtest/speech-templates/experiments/tools/render.ts      # TTS takes
playtest/runs/speech-templates/.venv/bin/python playtest/speech-templates/experiments/tools/build.py       # A B C C2 D D2 D3
playtest/runs/speech-templates/.venv-f5/bin/python playtest/speech-templates/experiments/tools/f5_edit.py 2  # E (uv pip install f5-tts)
playtest/runs/speech-templates/.venv/bin/python playtest/speech-templates/experiments/tools/e_finish.py
playtest/runs/speech-templates/.venv/bin/python playtest/speech-templates/experiments/tools/measure.py     # Whisper + joins
doppler run -p os-legacy-2026-04 -c dev -- bun playtest/speech-templates/experiments/tools/judge.ts       # blind pairs
JUDGE_MODEL=gemini-3.1-pro-preview OUT=judge_pro.json PAIRS="A:D,A:B,..." doppler run ... judge.ts        # second opinion
playtest/runs/speech-templates/.venv/bin/python playtest/speech-templates/experiments/tools/report.py      # tables + page
```

The tables above are `report.py`'s output (the numbers also go to `experiments/results.json`). The tuning rounds' votes are `playtest/runs/speech-templates/tune1.json`–`tune3.json`, run with `OUT=`, `PAIRS=` and `EXTRA=` (earlier versions' clips are in `playtest/runs/speech-templates/v1/` and `v2/`).

Decisions taken without asking, per the house rules:

- The masters use fillers not in the test set (pig, Tom, cup), so every C/C2/D/D2/D3 clip is a real splice.
- D's donors are the item's own A takes (the brief's "render the carrier with each word in place").
- D3 was added mid-experiment to separate "same sentence" from "same neighbouring word".
- B's and A's gaps are digital silence, the way the game plays them now. Only D's sound pauses got room tone.
- E is skipped for T3/T4, since pure sounds are never synthesised.
- VoiceCraft was not attempted (Linux/CUDA stack); F5-TTS stood in for neural editing.

## Prior art the methods come from

- Slot-and-filler prompt concatenation (IVR systems; *limited domain synthesis*, Black & Lenzo 2000). Record variables in the prosodic position they'll be used in: this experiment's main finding, again.
- Unit-selection join costs and *optimal coupling* (Hunt & Black 1996; Conkie & Isard 1997). Choose the cut points where the two signals are most alike, ideally inside a shared phone: D's "join inside the neighbouring word".
- TD-PSOLA (Moulines & Charpentier 1990) and pitch transplantation, via Praat's Manipulation.
- CTC forced alignment with the MMS aligner (Pratap et al. 2023, via torchaudio).
- Neural speech editing: VoiceCraft (arXiv 2403.16973) and F5-TTS (arXiv 2410.06885).
