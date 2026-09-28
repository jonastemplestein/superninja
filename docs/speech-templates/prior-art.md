# Prior art: natural speech from templates with variable slots

*Research for Jonas's request of 27 Sep: "templatize the recordings and thus create more natural speech … instead of 'say this sound: a' you can say 'say the sound a' … instead of 'say this word slowly: mat', you would say 'say mat slowly'. This needs to work super well and you need to research prior art and then work out how you can apply it everywhere in the game."*

Written 27 Sep 2026 by the prior-art researcher in the speech-templates workflow. Every claim carries its source link, and key claims are quoted. Where I couldn't verify something I say so.

---

## The short version

1. **Every serious system splits the problem in two.** It records (or renders) whole sentences for the frequent cases and concatenates only the long tail. Black & Lenzo, IVR designers, Cisco's "Say It Smart" and the ACIxD guidelines all say this. ACIxD puts it most bluntly: *"Use the longest chunks possible … record prompts in their entirety whenever possible."* Gemini renders cost about $0.00045 per two-second sentence, so money isn't what limits whole sentences for us. File count, bytes, decode memory and QA are.
2. **A slot filler has to be recorded in the right prosodic position.** Nuance: *"even recording just three variations of each prompt (phrase initial, phrase final, and phrase internal) gives a huge quality boost, producing very natural sounding output."* ScotRail and SNCF record every station name two or three times (middle and end; or beginning, middle and end). FIFA records star players' names at "four or five" intensities.
3. **Take the filler from inside a sentence, not from isolation.** Black & Lenzo: *"prompts should have at least one occurrence of each word in the vocabulary in each prosodic context."* The Hungarian railway read its station names inside fixed carrier sentences. AT&T designed its recording scripts so the sounds either side of each extracted digit match where it will be reused. A3T found that *"generating the whole audio and then extracting the modified region is better than generating the modified region only."*
4. **Put joins where the ear forgives them.** That means a real phrase boundary with a pause, or the silent closure of a stop consonant (/p t k b d g/). Never put one inside a vowel, a diphthong or a sonorant. Syrdal (AT&T) found joins most audible *"in regions of spectral change"*, with diphthongs and following sonorants the worst. Dialogue editors cut *"on a hard clicky consonant like a t or a k"*.
5. **The gap is what separates a spliced sentence from a real one.** Of the cues that mark a phrase boundary, a pause is the strongest. For English listeners, going from 0 to 80 ms of pause raises the odds of hearing a boundary about 7.6-fold (Zhang 2012). **I measured today's clips.** Lines end with a median of **95 ms** of near-silence and words start with **25 ms**. Every carrier→word join therefore carries about 120 ms of silence *before* any scheduling delay (`playtest/speech-templates/join-silence.txt`). That's fine for "Say the sound… /a/", where a pause is natural, and fatal for "Say mat slowly", which must have no boundary.
6. **Never switch voice source mid-phrase.** Black & Lenzo tried filling unknown words from a synthesiser built on the same voice: *"the voice quality switch midway in a sentence is extremely distracting"*. They back off to re-synthesising the whole phrase instead. The pure sounds are the deliberate exception. An isolated phoneme is always said as a separate event, bounded by pauses, by teachers and by Teach Your Monster to Read alike.
7. **A steady carrier voice splices well; an expressive one doesn't.** EA could stitch Pat Summerall's *"very steady, even inflection"* but not John Madden's *"much more dynamic range"*. They gave Madden generic lines ("these guys") instead. Adams's scripts had the talent read a dummy name ("Trent [knocked it down.]"), cut it, and inserted the real name. That's the same trick as rendering a carrier around a placeholder.
8. **Neural speech editing is now good but not ready to ship with.** VoiceCraft's edits were rated *"nearly indistinguishable from unedited recordings in terms of naturalness"*. Most weights are non-commercial, though (VoiceCraft, F5-TTS, SSR-Speech, VoiceCraft-X). VoiceCraft's codec runs at 16 kHz, below our 44.1 kHz. Its own paper admits to *"long silence and scratching sound"* now and then. PlayDiffusion is Apache-2.0 and the most usable today. Its best use for us is offline "seam repair" on a spliced render, never touching the pure sounds.
9. **Web delivery sets hard limits.** Workers static assets allow **20,000 files per version on Free and 100,000 on Paid**. Web Audio decodes a whole sprite into float32 PCM, about 176 KB per second of 44.1 kHz mono, all resident at once. MP3 encoder delay makes sample-accurate joins differ between browsers. Keep sprites small, per unit, and schedule joins on the AudioContext clock.
10. **What I'd build.** The system has two tiers:
    - Whole-sentence renders, packed into per-unit sprites. These serve the templates whose slot sits mid-phrase ("Say mat slowly"), and the most frequent template × word pairs.
    - A harvested slot-filler library for everything else. Each word gets three prosodic classes (final, medial and continuation), cut by forced alignment from carrier renders. Carriers are rendered with a placeholder filler and cut inside a stop closure or at a pause. Joins are scheduled sample-accurately.

    An automatic join-cost check promotes any failing template × word pair to a whole-sentence render. Pure sounds always go in as the QA'd clips, at a deliberate, consistent pause.

---

## 0. What the game does today (measured, for context)

- **Formats.** Speech is MP3 at 44.1 kHz, mono, about 92 kbps (`ffprobe` on `public/a/l/*`). Lines average 28.7 KB and about 2.9 s; words average 7.5 KB and about 0.7 s. `public/a` holds 2,724 files and 122 MB (1,205 lines, 1,238 words, 46 pure sounds, 163 slow words, 7 onsets, 65 story pages).
- **Clip finishing** (`scripts/tts.ts` `finishAudio`). This trims silence to −45 dB with `silenceremove`, keeping up to 30 ms at the start and 60 ms at the end. It also applies *"25 ms fades at both ends (so a join never clicks)"* and normalises to −16 LUFS per clip.
- **Edge silence per clip, measured** (`playtest/speech-templates/join-silence.py`, 150 random clips per folder, −45 dBFS, 5 ms frames):

  | folder | lead (median / p90) | trail (median / p90) |
  |---|---|---|
  | lines `l` | 30 / 30 ms | 95 / 105 ms |
  | words `w` | 25 / 30 ms | 95 / 105 ms |
  | pure sounds `p` | 30 / 40 ms | 55 / 75 ms |
  | slow words `x` | 35 / 40 ms | 65 / 70 ms |

- **Playback** (`src/engine/audio.ts`). Every clip is decoded to an AudioBuffer, which is good. Clips in a `say([...])` list play one after another: each `src.start()` waits for the previous source's `onended` event and a promise hop. Sounds in a blend are separated by `sleep(it.gap ?? 320)`. So a splice is roughly 120 ms of baked silence plus main-thread scheduling jitter. On a phone under load that jitter is not small; `docs/PERF.md` measures a busy main thread during play.
- **The carriers already use the IVR convention.** Lines like `"Find this sound..."` and `"has this sound in the middle..."` end in an ellipsis, which in IVR scripting means "record with open, continuing intonation" (see §1).

These numbers explain why earlier splices were judged choppy (`docs/DECISIONS.md`, 26 Sep: *"Spliced word lists sounded choppy"*). The joins aren't only mismatched in pitch. Every one of them carries a pause long enough to sound like a phrase boundary.

---

## 1. Limited-domain synthesis, IVR prompt design and transport announcements

### 1a. Black & Lenzo, *Limited Domain Synthesis* (ICSLP 2000)

**The technique.** Design a recording script that covers the templates a system actually speaks, weighted by how often it speaks them. Record it in the target style, auto-label it, then select and join units only from that in-domain corpus.

**Evidence** ([paper, CMU](http://www.cs.cmu.edu/~awb/papers/ICSLP2000_ldom/index.html); sections [2](http://www.cs.cmu.edu/~awb/papers/ICSLP2000_ldom/node2.html), [3](http://www.cs.cmu.edu/~awb/papers/ICSLP2000_ldom/node3.html), [5](http://www.cs.cmu.edu/~awb/papers/ICSLP2000_ldom/node5.html), [6](http://www.cs.cmu.edu/~awb/papers/ICSLP2000_ldom/node6.html), [7](http://www.cs.cmu.edu/~awb/papers/ICSLP2000_ldom/node7.html)):

- Coverage rule: *"In general, prompts should have at least one occurrence of each word in the vocabulary in each prosodic context."*
- Frequency weighting (CMU Communicator): *"For the more frequently mentioned cities we included more than one occurrence in our prompts (in differing prosodic position) and for less frequent names we only included them once, in an intended prosodically neutral position."*
- Style is kept: *"the resulting synthesizer retains the style of the speaker exactly - Scottish accents, falsetto, 'laid-back' speakers, and even cartoonish voices are all captured well."*
- Weather slot-filling test on 50 held-out sentences. With automatic labels the results were 60% correct, 32% minor glitch and 8% wrong. After a day of label correction they were 90%, 10% and 0%.
- The commonest error was pauses: *"The most common form of error was a misplacement of silence (pauses)."*
- The key failure, mixing sources: *"it is very obvious when listening to such examples that the voice quality switch midway in a sentence is extremely distracting, especially as the unknown word is typically an important content word like a place name, even though the diphone synthesizer is based on the same voice as our limited domain voice. Thus if a phrase contains an out of vocabulary word we back-off for the whole phrase."*
- Human talent drifts towards the machine: *"We can, optionally, play the prompt to the human voice talent, but that often has the adverse effect of making the human speak more like the synthesizer."*
- The honest limit: *"As more general synthesis is required, with varying prosody, varying emphasis and focus as well as larger vocabularies, the amount of data that needs to be recorded will become too large."*

The Festvox *Building Synthetic Voices* book adds that a talking clock *"built from only 24 recordings, generates over a thousand unique utterances"* ([festvox.org/bsv](http://www.festvox.org/bsv/bsv.pdf); [Festvox LDOM page](http://www.festvox.org/ldom/index.html)).

**Fit for Super Ninja.** Very high as a design method. We're a limited domain: roughly 30–60 carrier templates, a known vocabulary of 850 → 2,100 words, 44 pure sounds and a handful of names and numbers. We don't need unit selection itself, because Gemini renders any sentence we ask for. The lessons carry over directly:
- (a) Cover each word *in each prosodic context we use*.
- (b) Weight by frequency: render the frequent pairs whole.
- (c) If a join fails, **back off to the whole phrase**, meaning a whole-sentence render, rather than patching the word with some other source.
- (d) Pause placement is the number-one bug class, and our measurements say the same.

### 1b. IVR prompt design (Nuance, Cisco, Genesys-style platforms, voice-talent practice)

**The technique.** Record carrier phrases once and play variable data (numbers, dates, names) from pre-recorded fragments. The fragments are recorded in several intonation variants and chosen by where they fall in the phrase.

**Evidence:**
- **Nuance Vocalizer ActivePrompts** ([docs.nuance.com](https://docs.nuance.com/speech-suite/voc-dev/ww-ActivePrompts.html)): *"ActivePrompts support context-sensitive rules, including prompts that start and/or end on a sentence boundary, on a phrase boundary … or are phrase internal. For playing back dynamic content, even recording just three variations of each prompt (phrase initial, phrase final, and phrase internal) gives a huge quality boost, producing very natural sounding output."* On digits: *"a basic recording set for digits playback could be one recording for each of the numbers 0 through 9 … While that would produce understandable output, it would not sound natural. Much better output could be obtained by recording three variations of each number … Even better output could be obtained by recording digit pairs in those three contexts."*
- **Nuance Mix, dynamic concatenated audio** ([docs.nuance.com/mix](https://docs.nuance.com/mix/integration/speech-suite/prepare-resource-files/prepare-prerecorded-messages/)). Nuance inserts **explicit, named silence files** around a dynamic value: `…/cpr/silence.natnum.precpr.wav`, the value, `…/cpr/silence.natnum.postcpr.wav`. *"If a recorded audio file cannot be found in the recorded audio package, TTS playback is used as a fallback."* The pause is designed, not incidental.
- **Cisco Unified CVP "Say It Smart"** ([spec PDF](https://www.cisco.com/c/en/us/td/docs/voice_ip_comm/cust_contact/contact_center/customer_voice_portal/15-0-1/sayitsmartspecs/guide/cvp_b_1501-say-it-smart-specifications-for-cisco-unified-customer-voice-portal.pdf); [Number type](https://www.cisco.com/c/en/us/td/docs/voice_ip_comm/cust_contact/contact_center/customer_voice_portal/12-6-2/sayitsmart/guide/ccvp_b_1262-say-it-smart-specifications-for-cisco-unified-customer-voice-portal/ccvp_b_1251-say-it-smart-specifications-for-cisco-unified-customer-voice-portal_chapter_0111.html)). The standard fileset *"involves fewer audio files to render the number but at the cost of sounding a bit robotic"*; the enhanced one *"involves more audio files to render a better sounding number"*. On falling back to TTS: *"This may be a bit disconcerting to the caller."*
- **ACIxD (Association for Conversational Interaction Design) guidelines** ([prosodic considerations](http://acixd.org/wiki/doku.php?id=prosodic_considerations)): *"Use the longest chunks possible. Concatenating prompts together for playback will always be necessary, but minimize it wherever possible … Look at the stats for your company and see what's really common. Perhaps 95% of bookings are for one to ten nights. Go ahead and record everything from one to ten in a complete prompt. Then use the concatenated version as a fallback for everything over ten."* Also: *"Use a flat intonation if you are recording a prompt segment that will be concatenated and it will be in the middle of the prompt."*
- **Voice-talent script notation** ([Amazing Voice guidelines](https://www.amazingvoice.com/voice-prompts-guidelines)). There are four prompt types: Complete, Beginning, Ending and Middle. A Beginning prompt *"is read/intonated as the 'start' of a sentence, but the end is unfinished (open). It begins with a capitalized word and ends with an ellipse (three dots)."* From [EasyIVR](http://www.easyivr.com/tech-ivr-message-on-hold_103.htm): *"Numbers can be spoken with an Initial (rising), Medial (neutral) or falling (final) inflection. The standard contextual notation … uses ellipses."*
- **Maintenance trap** ([Oracle VoiceXML localisation guide](https://docs.oracle.com/cd/E19528-01/820-1050/affcu/index.html)): *"If you edit or re-record a prompt to work well in one concatenation, the prompt might not work correctly if used elsewhere in a different part of the sentence."*
- **Production reality** ([Nu Echo](https://www.nuecho.com/rasa-conversational-ivr/)). They play $507.18 as `500_mid.wav`, `07_dollars_rising.wav` and `and_18_cents_final`: *"Recording large batches of small audio files for concatenation requires a consistent voice talent, good coaching and tight post-processing to maximize fluidity."*
- **AT&T patent US 6,601,030, "Method and system for recorded word concatenation"** ([freepatentsonline](https://www.freepatentsonline.com/6601030.html)). It labels each slot's tonal pattern in ToBI (H\*, H\*L−H%, H\*L−L%) and records the digits *inside* phone-number-like strings: *"Designing the script to approximate the same place of articulation of the first phoneme of the target digit with the last phoneme of the proceeding digit … reduces mismatches of coarticulation when the target digits are extracted and recombined."* The editor keeps *"from 0-50 milliseconds of relative silence"* around the target. And: *"It is useful to include in the inventory several instances (2 or more) of each digit and tonal pattern, and to sample them without replacement during synthesis. This avoids the unnatural sounding exact duplication of the same sound in the string."*

I found no public Genesys prompt-recording guide that says more than the Cisco and Nuance material. Genesys-style platforms follow the same "carrier + prerecorded fragments + TTS fallback" model; Cisco's is the best-documented public example.

**Fit.** High. Three things map straight onto us:
- (1) The **ellipsis convention** for carriers, which we already half-use.
- (2) **Three positional variants** of each filler.
- (3) **Designed pauses around a dynamic value**, as Nuance's `precpr`/`postcpr` silences do. Today our pause is whatever silence `finishAudio` happens to leave.

AT&T's two refinements are cheap to copy with TTS. Render the harvest carrier so the sounds either side of the slot match where the filler will be used. Keep two or more takes of frequent pieces and rotate them.

### 1c. Rail, metro and airport announcements

**Evidence:**
- **ScotRail** ([London Reconnections](https://londonreconnections.com/everything-i-learned-from-scotrails-automated-station-announcements/), on the 2,440-clip dump): *"the ScotRail announcements include various phrases – 'engineering work', the names of rival train operating companies – twice: once with an upward inflection (which sounds right in the middle of a sentence) and once with a downward one (which sounds right at the end). Numbers prefixed with a zero ('oh-one' and so forth) have a third, flat intonation, too."* A developer rebuilding announcements from the dump ([evelyn.moe](https://evelyn.moe/station-announcements-from-a-spreadsheet-and-some-files-back-to-announcements)) found: *"Most stations have two versions, a mid and an end version, with the first sounding more natural when in the middle of a list, and the latter sounding natural at the end."*
- **SNCF, Simone Hérault** ([Connexion](https://www.connexionfrance.com/news/meet-woman-behind-voice-of-french-train-announcements-for-40-years/643624)): *"Now, she records each word individually three times – changing the tone whether it is at the beginning, middle, or end of a sentence – before the words are strung together by sound engineers."*
- **Paris Métro:** station names are played *"in two intonations, the first rising and the second falling"*. That's a RATP designer quoted via [r/transit](https://www.reddit.com/r/transit/comments/1k5eeue/rising_and_falling_tones_in_paris_metro_pa/), citing 20 Minutes.
- **Choosing the variant is itself linguistics.** Jane Setter, a phonetician at Reading ([blog](http://aworldofenglishes.blogspot.com/2013/09/intonation-and-train-announcements.html)), on South West Trains: *"The company has therefore recorded two versions of each town/city at which the train stops, one with an r tone and one with a p tone."* The system put the wrong one in "This station is Sunningdale": *"using an r tone here makes it sounds like a surprise that one has arrived in e.g. Sunningdale."*
- **Hungarian railway (MÁV) TTS** ([Zainkó et al., Interspeech 2015](https://www.isca-archive.org/interspeech_2015/zainko15_interspeech.pdf)): *"The traditional approach was prompt concatenation with insertion of variable data recorded in a single, indifferent pronunciation. This solution caused perceivable discontinuities … This approach was later enhanced by including several prosodic variations of variable data."* Station names *"were read in carrier sentences. In one sentence 6 station names were listed. The beginning and the end of the sentence was fixed."* For consistency across 3–4 hour sessions: *"We apply a master sentence to force the speaker to keep the same sound timbre, F0 and speaking style … the master sentence was played over headphones after every 25 read sentences."*
- **A failure case, Indian Railways** ([LinkedIn, 2026](https://www.linkedin.com/posts/chaitanya-d-r_at-panvel-station-a-few-weeks-ago-i-noticed-activity-7495809193044500480-fNWj)): *"The numbers were recorded by one person. The station names by another. The general statement by a third. You could hear the seams."*
- **NYC MTA** ([Oreate](https://explore.oreate.ai/posts/why-mta-announcements-are-not-ai-and-how-those-viral-voice-clones-actually-work), a secondary source) describes a deliberate *"rhythmic 'pause' … between the phrase 'The next stop is' and the station name"*. The pause turns the join into a feature.

**Fit.** High for the principle. The number of versions is small and fixed (two or three). The variant is chosen by the *linguistic function* of the slot, not only its position. Consistency comes from anchoring the voice to a reference. The pause before a name is fine *when the sentence is built to have one*, as in "The next stop is… Sunningdale". For us that pause is natural before a pure sound and before a stretched word, but not inside "Say mat slowly".

---

## 2. Sports and game commentary

**The technique.** A dialogue engine picks lines by context and stitches recorded player names into lines or next to them. Names are recorded at several intensities and intonations.

**Evidence:**
- **Barry Davies, Actua Soccer (1995)** ([BBC Sport](https://www.bbc.com/sport/football/articles/c4g40828ngjo)): *"I told them you cannot use the same way of identifying the player every time he touches the ball - it has got to be at different levels depending where he is on the pitch … So I gave them about five different versions of every player's name, changing the emphasis each time."*
- **EA FC 26, Guy Mowbray** (same BBC article): he says each player's name *"in several different intonations … for use from everything from when they play a two-yard pass on the halfway line to smashing a worldie into the top corner"*. For 20,000+ players EA uses *"AI replicating his voice with his permission for some of the names"* ([FootballTransfers](https://www.footballtransfers.com/us/transfer-news/uk-premier-league/2026/02/the-art-of-video-game-commentary-explained-by-ea-sports-fc-and-fifa-legend)). The sessions are ad-libbed scenarios, *"10 different ways of doing that"*. Levels are matched by playing one commentator's line to the other *"so my levels are the same as his"*.
- **FIFA 19, Derek Rae** ([Goal](https://www.goal.com/en/news/fifa-19-champions-league-mode-the-secrets-from-behind-the-scenes-with-new-commentator/17kcfqc22q051jdl3slvq5t7l)): *"with the players who score goals a lot, we have four or five variations of those, from low intensity to the highest one."*
- **Stitchability depends on the voice.** Ernest Adams, who produced Madden ([Game Developer](https://www.gamedeveloper.com/audio/the-designer-s-notebook-how-to-write-sports-commentary)): *"Pat Summerall's voice has a very steady, even inflection which made it easy to stitch his words together into sentences. John Madden's voice has much more dynamic range, so we decided not to try it."* Madden's lines used *"'these guys,' 'they,' 'the offense'"* instead of names. Adams's recording script marks slots with square brackets: *"Trent [knocked it down.] Trent [with the knockdown.] … Lines with square brackets in them indicate interchangeable content -- the name 'Trent' would be removed during the editing process and the correct name would be inserted during playback."* The talent reads a dummy name so the rest of the line carries the intonation of a line that follows a name. The dummy is then cut. He also writes: *"the longer the line of dialog, the less frequently the player should hear it."*
- **Intensity matching is the hard part.** Jeff Macpherson, EA Canada audio ([Designing Sound](https://designingsound.org/2013/02/spectral-analysis-interview-with-jeff-macpherson/)): *"the huge challenge is figuring out how to make things match in…intensity."* A crowd-intensity filter gates which lines may follow which.
- **The failure mode.** Kotaku on NBA 2K10's Kevin Harlan, who *"breaks his cadence from player name ('Bryant!') to shot type ('for three!') to outcome ('got it!'), in a way that can sound like automated phone support"* ([Kotaku](https://kotaku.com/taking-games-commentary-beyond-repeat-performances-5514192)).
- **A DSP route that became Google TTS.** Phonetic Arts' *PA Commentator* made *"new, virtual lines"* from recorded commentary *"using signal processing, sophisticated phonetic models and linguistic algorithms"* ([GamesIndustry.biz](https://www.gamesindustry.biz/pa-commentator-tool-for-adding-live-dynamic-spoken-commentary-to-sports-games-set-to-be-shown-off-at-microsoft-s-gamefest-conference)). Google bought the company in December 2010 ([TechCrunch](https://techcrunch.com/2010/12/03/google-acquires-phonetic-arts/)). Related research: [Potard & Aylett, "Proper name splicing in computer games with TTS", Interspeech 2012](https://www.isca-archive.org/interspeech_2012/potard12_interspeech.html).
- **Football Manager has no spoken commentary.** The brief assumed it did. Its match commentary is text only ([SI community forum](https://community.sports-interactive.com/forums/topic/472877-is-there-a-way-to-hear-the-commentary/); [Steam discussion](https://steamcommunity.com/app/1263850/discussions/0/3069747601658786868/)). The combinatorics of about 290,000 players are exactly why.

**How joins are hidden** (a synthesis of the above plus the [askagamedev](https://www.tumblr.com/askagamedev/611046145884651520/in-sports-games-how-do-the-programmers-code-the) explainer). The name is usually its **own intonation phrase** ("Kane… shoots!"). It is bounded by a natural pause and covered by crowd noise, and matched in intensity to the line next to it. Mid-sentence insertion is rarer and needs a steady-voiced talent.

**Fit.** Medium. We have no crowd bed to hide seams in, and a quiet children's game exposes every join. Four lessons carry over:
- (1) Record names and words **inside the line, then cut** (Adams's brackets).
- (2) Keep **the carrier delivery steady**. Sensei's instruction lines should be calm "Summerall" reads; excitement belongs in whole-sentence praise lines.
- (3) **Match intensity** between carrier and filler: an excited filler after a calm carrier sounds wrong.
- (4) Rotate variants so repetition isn't audible.

---

## 3. Children's literacy apps and games

Public engineering write-ups here are scarce. I found nothing substantive from Hooked on Phonics, Nessy, Mentava, Phonics Hero or Lexia on how they assemble spoken prompts, and I say so rather than guess. What exists:

- **Teach Your Monster to Read** (voice: Simon Farnaby; [overview](https://www.teachyourmonster.org/teach-your-monster-to-read-overview/)). YouTube auto-captions of level 1 gameplay show a **carrier plus pure-sound slot** structure, with the sound at the **end** and **mid-sentence** ([Xpgamingio](https://www.youtube.com/watch?v=dKOwdz61cnc); [Making English Fun](https://www.youtube.com/watch?v=INw3jrKKwNg)):
  - *"now can you help me find the letters that make the sound [s]"*
  - *"let's learn a new sound [s] as in [Sun]"* (sound slot, then an example-word slot)
  - *"can you say [s]"*
  - *"put all the ducks in the [s] pond"* (mid-sentence sound slot)
  - *"can you click on the word [is]"*

  The captions drop or mangle the phonemes; the second transcript reads "put all the ducks in the pond". So the structure is my inference from those gaps. A BAFTA-nominated game putting isolated phonemes into slots, including mid-sentence, supports our house rule: pure sounds are inserted as clips, bounded by short pauses.
- **Khan Academy Kids.** Its job ads show two eras. An audio production assistant for *"Processing audio files including splicing, leveling, and exporting"* ([Twine](https://www.twine.net/projects/b7mon0-khan-academy-audio-production-assistant-project-based-contract-18-20-per-hour-audio-engineer-in-united-states-job)). Later an "Audio Generation & QA Specialist" to *"Run scripted audio generation workflows … speech synthesis tools to produce batches of audio assets from text prompts"*, *"modifying prompts where necessary"* and *"verify phonological accuracy for letter sounds, phoneme blending/segmenting"* ([FFWD job board](https://jobs.ffwd.org/companies/khan-academy/jobs/60819998-audio-generation-qa-specialist-khan-kids-part-time-contract-up-to-20-hours-week-40-50-hr)). That's the same shape as our pipeline: batch TTS plus human and phonetic QA. Kodi's feedback deliberately names the act (*"You traced the letter D."*, [Khan Kids help](https://khankids.zendesk.com/hc/en-us/articles/360049358751-Learn-more-about-the-characters-inside-Khan-Academy-Kids)), which is itself a slot-filled line.
- **Duolingo.** Its Speech Lab is led by Kevin Lenzo, very likely the Lenzo of Black & Lenzo; I didn't confirm that. It built custom TTS voices from *"6,000 sentences … carefully designed and completely balanced for combinations of speech sounds in different contexts with phrasings and different sentence types"*. Phrasing errors such as *"'Hello. Kevin.' As opposed to, 'Hello, Kevin.'"* are *"corrected by a linguist"* ([Duocon talk](https://www.youtube.com/watch?v=oEiKfH9WCGo); [blog](https://blog.duolingo.com/character-voices/); [Microsoft case study](https://www.microsoft.com/en-us/startups/blog/duolingo-makes-learning-language-fun-with-help-from-ai/)). The lesson for slots: punctuation around a slot changes its prosody, so the harvest carrier's punctuation must match the use.
- **Reading Eggs** gets *"small voice-over snippets"* from Voicearchive, delivered straight into its system by API ([Voicearchive](https://www.voicearchive.com/cases/reading-eggs-by-blake-elearning/)).
- **A cautionary review.** ABC Pocket Phonics *"uses a monotone robotic voice for instructions"*, and *"audio quality varies, with some recordings sounding unclear"* ([phonics.org](https://www.phonics.org/abc-pocket-phonics-review/)).
- **Developmental prosody supports final slots.** Fernald & Mazzie (1991): *"In speech to infants, mothers consistently positioned focused words on exaggerated pitch peaks in utterance-final position"*, and *"The use of exaggerated pitch peaks at the ends of utterances to mark focused words may facilitate speech processing for the infant"* ([abstract](https://exa.ai/library/publication/vh8yn8b1qf2); [ERIC](https://eric.ed.gov/?id=EJ431659)). These were 14-month-olds, younger than our players, but it's the same direction.

**Fit.** The genre's norm is a warm carrier plus an isolated sound or word in a slot. That's acceptable to children and teachers when the slot is at a boundary. Final-position focus is also the most child-friendly place for the target word (Fernald & Mazzie). Jonas's "Say the sound a" fits the norm. "Say mat slowly" is a mid-phrase slot, which no children's app I found builds by splicing. It needs the whole-sentence tier or very careful joins (§7).

---

## 4. Audio sprites in web games (Howler.js) and their memory cost

**The technique.** Pack many short clips into one file and play them by offset and duration. This cuts file count and HTTP requests.

**Evidence:**
- **Howler README** ([github.com/goldfire/howler.js](https://github.com/goldfire/howler.js)): sprites are `key: [offset, duration, (loop)]` in milliseconds. `html5: true` *"should be used for large audio files so that you don't have to wait for the full file to be downloaded and decoded before playing."*
- **The whole sprite is decoded into RAM** ([howler #1151](https://github.com/goldfire/howler.js/issues/1151)): *"If you use a large audio sprite file, howler will load and decode the whole file into memory. Depending on the file of the audio sprite file - this will crash a mobile browser."* HTML5 mode avoided the crash but *"messes up the whole audio sprite file somehow (wrong or no samples are played)"*. A contributor in [#426](https://github.com/goldfire/howler.js/issues/426) advised: *"Its recommended that Web Audio buffers are not longer than 45 seconds."*
- **Decoded size is float32 PCM, whatever the compression** ([musgravte](https://musgravte.hashnode.dev/five-misunderstandings-about-decoding-long-audio-in-the-browser)): *"Web Audio keeps decoded audio as 32-bit float PCM, uncompressed, resident in memory. How well the source file compressed is irrelevant."* Stereo 44.1 kHz is 352,800 B/s, so **mono is 176 KB/s, about 10.6 MB a minute** (at a 48 kHz context rate, 192 KB/s). WebKit bug [227636](https://bugs.webkit.org/show_bug.cgi?id=227636) shows iOS killing a tab (jetsam) during parallel `decodeAudioData`.
- **Sprite offsets and MP3 padding.** LAME adds encoder delay and padding ([LAME FAQ](https://lame.sourceforge.io/tech-FAQ.txt): *"LAME (and all other MDCT based encoders) add padding to the beginning and end of each song"*). Browsers disagreed on trimming it: see [Web Audio issue #1091](https://github.com/WebAudio/web-audio-api/issues/1091) (*"developers still have to fight the cross-browser inconsistency"*) and Firefox's fix in [bug 1566389](https://bugzilla.mozilla.org/show_bug.cgi?id=1566389). Chrome's gapless guide says *"Most MP3 encoders … do not produce sufficient pre-roll and post-roll for a flawless transition"* ([Chrome blog](https://developer.chrome.com/blog/media-source-extensions-for-audio); [demo](https://dalecurtis.github.io/llama-demo/index.html)).

**Fit and arithmetic.**
- **Files.** Workers static assets allow **20,000 files per version (Free) and 100,000 (Paid)**, with 25 MiB per file ([Cloudflare limits](https://developers.cloudflare.com/workers/platform/limits/)). Whole-sentence families for 2,100 words × 8 templates would be 16,800 files, which breaks the Free limit on their own. Sprites per unit and template family (tens to hundreds of files) remove the file-count problem.
- **Decoded memory.** Our budget is ≤ 64 MB live (`docs/PERF.md`), which is about 6 minutes of 44.1 kHz mono. A per-unit sprite for one template family covers roughly 30–60 words × 1.4 s ≈ 40–85 s, or 7–15 MB decoded. That fits when loaded one or two units at a time and evicted; one sprite for the whole vocabulary would not.
- **Bytes.** At today's roughly 92 kbps, a 1.4 s sentence is about 16 KB. 12,600 whole sentences (2,100 × 6 templates) would be about 200 MB, more than the whole of `public/a` today (122 MB). A three-class harvested filler library (2,100 × 3 × 0.7 s) is about 28 MB. This is the strongest argument for keeping concatenation for final and pause-bounded slots.
- **Offsets.** Pad each sprite member with at least 50 ms of true silence, and store offsets measured on the *decoded* buffer at build time in each target browser. Or find each member's start at runtime by searching for its onset near the nominal offset. Don't trust offsets computed from the MP3 file across browsers. Chrome's gapless guide recommends AAC with its standard priming metadata when a *"truly flawless transition"* matters. That needs testing on iOS Safari before we switch.

---

## 5. Neural speech editing and infilling

**The technique.** Mask a span of an existing recording and generate new speech for it, conditioned on both the left and right context and the new text. The edit should keep speaker, prosody and room.

| model (year) | what it does | quality evidence | licence | Apple Silicon | notes |
|---|---|---|---|---|---|
| **Voicebox**, Meta (2023) | flow-matching infilling; *"can also condition on future context"* | beat VALL-E on WER and similarity ([paper page](https://ai.meta.com/research/publications/voicebox-text-guided-multilingual-universal-speech-generation-at-scale/)) | **not released**: *"we are not making the Voicebox model or code publicly available"* ([Meta](https://ai.meta.com/blog/voicebox-generative-ai-model-speech/)) | – | reference point only |
| **A3T**, Baidu (ICML 2022) | masked-spectrogram reconstruction for editing | *"For TTS-based systems, we find that generating the whole audio and then extracting the modified region is better than generating the modified region only"* ([PMLR](https://proceedings.mlr.press/v162/bai22d.html); [arXiv](https://arxiv.org/pdf/2203.09690)) | research code (PaddleSpeech lineage); I didn't verify the licence | not verified | old; the quoted finding is the valuable part |
| **FluentEditor** (Interspeech 2024) | adds acoustic- and prosody-consistency losses at edit boundaries | beat CampNet, A3T and FluentSpeech on VCTK for naturalness and fluency ([ISCA](https://www.isca-archive.org/interspeech_2024/liu24p_interspeech.html); [code](https://github.com/Ai-S2-Lab/FluentEditor)) | licence not checked | not verified | VCTK-scale; a research artefact |
| **VoiceCraft** (ACL 2024) | codec-LM token infilling; edit and zero-shot TTS | edits *"nearly indistinguishable from unedited recordings in terms of naturalness"*; limitation: *"long silence and scratching sound that occasionally occur"* ([ACL](https://aclanthology.org/2024.acl-long.673/); [arXiv](https://arxiv.org/html/2403.16973v3)) | code **CC BY-NC-SA 4.0**; weights **Coqui Public Model License** ([repo](https://github.com/jasonppy/voicecraft)) | CUDA-first; MPS unverified | Encodec at **16 kHz**, below our 44.1 kHz |
| **SSR-Speech** (ICASSP 2025) | AR editing with CFG; *"waveform reconstruction leverages the original unedited speech segments"*; **watermarks edited regions** | SOTA on RealEdit ([arXiv](https://arxiv.org/html/2409.07556)) | code MIT; English weights **CC BY-NC-SA 4.0** ([HF](https://huggingface.co/westbrook/SSR-Speech-English)) | needs `xformers`; MPS unlikely without patching | keeping unedited audio intact suits our "don't touch pure sounds" rule |
| **F5-TTS / E2-TTS** (2024–25) | flow-matching TTS with a `speech_edit.py` that regenerates given time spans | fast: RTF 0.04–0.15 on an L20 GPU ([repo](https://github.com/SWivid/F5-TTS)) | code MIT; weights **CC-BY-NC-4.0** (Emilia data) ([HF card](https://huggingface.co/SWivid/F5-TTS)) | **yes**: the edit script sets `PYTORCH_ENABLE_MPS_FALLBACK`; the MLX port generated a sample *"in ~4 seconds on an M3 Max"* ([f5-tts-mlx](https://github.com/lucasnewman/f5-tts-mlx)) | 24 kHz; the easiest thing to try locally, but non-commercial weights |
| **PlayDiffusion**, PlayHT (2025) | discrete-diffusion inpainting of a masked token span; BigVGAN decoder conditioned on a speaker embedding | makes the case that the alternatives (regenerate whole, replace word, regenerate from midpoint) all *"compromise both the coherence and naturalness"* ([repo](https://github.com/playht/playdiffusion); [blog](https://play.ht/blog/play-diffusion/)) | **Apache-2.0** code and weights ([HF](https://huggingface.co/PlayHT/PlayDiffusion)) | Docker targets NVIDIA; MPS unverified; needs ASR and word timings (OpenAI key by default, replaceable) | **the most commercially usable today** |
| **VoiceCraft-X** (Nov 2025) | multilingual editing and TTS on Qwen3 | 11 languages ([arXiv](https://arxiv.org/pdf/2511.12347)) | weights **CC-BY-NC-4.0** ([HF](https://huggingface.co/zhisheng01/VoiceCraft-X)) | not verified | – |
| **Ming-UniAudio-Edit**, inclusionAI (Sep 2025) | instruction-based free-form edits, no timestamps | English insertion accuracy about 62–71% on its own benchmark ([HF](https://huggingface.co/inclusionAI/Ming-UniAudio-16B-A3B-Edit)) | **Apache-2.0** | 16B-A3B MoE; heavy | accuracy too low for unattended use |
| **Step-Audio-EditX**, StepFun (Nov 2025) | emotion, style and paralinguistic editing plus TTS (3B) | beats MiniMax and Doubao on emotion editing ([arXiv](https://arxiv.org/html/2511.03601)) | not checked | vLLM/CUDA | **no word insertion**; not our use |
| **2026 research wave** | CosyEdit ([2601.05329](https://arxiv.org/html/2601.05329v2)), CosyEdit2 ([2605.25930](https://arxiv.org/html/2605.25930v2)), LLaDA-TTS (*"zero-shot speech editing … word-level insertion, deletion, and substitution—without any additional training"*, [2603.26364](https://arxiv.org/abs/2603.26364v1)), AST (*"Latent Recomposition to stitch preserved source segments with synthesized targets"*, [2604.16056](https://arxiv.org/html/2604.16056v2)), SIEDD ([2608.06424](https://arxiv.org/html/2608.06424)), EditVoice ([2609.29889](https://arxiv.org/abs/2609.29889)), dots.tts.edit (pause and prosody editing via XML tags, [2608.02673](https://arxiv.org/html/2608.02673v1)) | papers and demos | mostly no weights yet | – | the field is converging on "keep the source, regenerate a small span" |

**Related non-neural baseline.** Morrison et al. (Adobe and Northwestern, ICASSP 2021, [arXiv](http://arxiv.org/pdf/2102.08328v1); [PDF](https://njb.github.io/research/icassp2021_prosody.pdf)) cut and paste real words, then impose context-predicted pitch and duration with TD-PSOLA and clean up with a denoiser. Context awareness improved MOS by 0.41. They warn: *"TD-PSOLA creates larger artifacts during larger manipulations."*

**Fit.**
- **Not as the main path.** The weights of every model good at word insertion are non-commercial, except PlayDiffusion and the heavy Ming. The 16 kHz models would audibly dull the word next to 44.1 kHz carriers. Each render also needs our Whisper and Praat QA, because these models hallucinate (VoiceCraft's own "long silence and scratching" note).
- **A good offline tool for seam repair.** Build the sentence by splicing: carrier cut + harvested word + carrier tail. Then mask only about 60–120 ms around each join *on the carrier and word side* and let an inpainter regenerate that window. This is Morrison's context-aware correction done with a stronger model, and AST's "latent recomposition". Two conditions: the pure-sound regions stay masked out (house rule), and the repaired sentence is shipped whole. There's no runtime cost.
- **Try order:**
  - First, PlayDiffusion (Apache-2.0), on a GPU box if MPS fails.
  - For a quick local quality probe, F5-TTS edit on the M4 Max. Its weights are CC-BY-NC, so it's a probe only, not for shipping unless the product is non-commercial.
- **Evaluate** with our existing judge plus a join-cost metric (§7).

---

## 6. TTS APIs for batch-rendering thousands of short British sentences in one voice

| vendor / model | British voice | controls that matter for slots | consistency levers | cost (Sep 2026) | limits and caveats |
|---|---|---|---|---|---|
| **Gemini 3.8 Flash TTS** (current: `scripts/tts.ts` uses `gemini-3.8-flash-tts`, Sulafat, en-GB) | prebuilt voices, plus Voice design and **Voice replication** | the transcript is read **verbatim** (*"Gemini 3.8 TTS models treat input text strictly as a verbatim transcript"*); style goes in a separate `speech_metadata.style`; inline `<short pause>` / `<long pause>`; *"Capitalize specific words … to place natural vocal stress"* | *"Long-form 'Audio Profile' paragraphs … are the most common cause of voice drift"*; *"Do not include instructions telling the model to hold the voice steady … extra prompt text increases drift"*; *"let the model vary naturally around the stable point"* ([docs](https://ai.google.dev/gemini-api/docs/speech-generation)) | **$9 per 1M audio tokens (25 tokens/s) = $0.00225 per 10 s** until 31 Dec 2026, then $0.0045 ([pricing](https://ai.google.dev/gemini-api/docs/pricing)) | I found no seed parameter in the TTS docs; renders vary by design; stored custom voices max 200 per project, 1-year TTL |
| **ElevenLabs** Multilingual v2/v3, Flash | many British library voices; cloning | **`previous_text` / `next_text`**: *"Can be used to improve the speech's continuity when concatenating together multiple generations"*; `previous_request_ids` / `next_request_ids` (max 3, *"no older than two hours"*) ([API](https://elevenlabs.io/docs/api-reference/text-to-speech/convert); [stitching guide](https://elevenlabs.io/docs/eleven-api/guides/how-to/text-to-speech/request-stitching)) | `seed` (*"Determinism is not guaranteed"*); `stability`; up to 3 pronunciation dictionaries | $0.10 per 1K characters (v2/v3), $0.05 (Flash) ([pricing](https://elevenlabs.io/pricing/api)) | the only API with **explicit "render this fragment as if inside that sentence"** controls; switching voice would break continuity with 2,700 existing clips |
| **OpenAI gpt-4o-mini-tts** | 13 voices *"optimized for English"*; accent steerable via `instructions` | `instructions` for tone and accent | none beyond the prompt | $0.60 per 1M text tokens in, $12 per 1M audio tokens out ([model page](https://platform.openai.com/docs/models/gpt-4o-mini-tts)) | usage policy: *"provide a clear disclosure to end users that the TTS voice they are hearing is AI-generated"* ([guide](https://platform.openai.com/docs/guides/text-to-speech)) |
| **Azure Speech** neural and HD (for example en-GB neural voices) | many en-GB voices | full **SSML**: `<break>`, `<prosody>`, **`<phoneme alphabet="ipa">`**, **custom lexicon (PLS, ≤ 100 KB)**; batch synthesis API ([pronunciation docs](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-pronunciation)) | non-LLM neural voices are likely the most repeatable (my inference, not measured); *"Some voices don't support all Speech Synthesis Markup Language (SSML) tags. This includes neural text to speech HD voices"* ([overview](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/text-to-speech)) | about $16 per 1M characters for standard neural; HD cut to $22 per 1M from March 2026 ([Microsoft](https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/azure-speech-%E2%80%93-neural-hd-text-to-speech-recent-voice-updates/4505380); [review](https://litmustools.com/review/azure-speech/)) | the most controllable, and less warm than LLM TTS |

**What the cost is at our scale.** A 1.5 s sentence costs about $0.00034 on Gemini 3.8 Flash TTS. **10,000 renders is about $3.40, and 50,000 about $17.** Money doesn't decide the architecture.

**Fit.** Stay on Gemini/Sulafat: the voice is the brand, and Black & Lenzo's lesson is never to mix sources. Four levers are worth testing:
- (1) **Voice replication.** Clone a reference built from the best existing Sensei clips into a stored voice, a "master sentence" in the MÁV sense, to reduce drift across thousands of renders.
- (2) The documented **`speech_metadata.style`** field, if the API path we use exposes it. It would let delivery hints ("calm, warm, unhurried") ride outside the transcript, which fixes the old problem of Sensei reading instructions aloud. This is unverified against our `generateContent` call shape; test before relying on it.
- (3) **CAPS emphasis** to put the nucleus on the slot word in harvest renders ("Say MAT slowly.").
- (4) `<short pause>` in harvest renders where we *want* a boundary.

ElevenLabs' `previous_text`/`next_text` is the best industry precedent for "render the filler as if in context". With Gemini we get the same effect by rendering the whole sentence and cutting, which A3T found better anyway.

---

## 7. DSP join smoothing

### What listeners notice
- **Joins are most audible where the spectrum is changing.** Syrdal (AT&T, Eurospeech 2001, [PDF](https://www.isca-archive.org/eurospeech_2001/syrdal01_eurospeech.pdf)): *"A reliably higher rate of detection of discontinuities was observed for diphthongs than for monophthong vowels. Post-vocalic consonants influenced concatenation discontinuities significantly more than pre-vocalic consonants, and post-vocalic sonorants were associated with higher detection rates than post-vocalic non-sonorants … highly audible discontinuity is related to concatenation in regions of spectral change."*
- **Which objective measure predicts them.** Stylianou & Syrdal (2002, [summary](https://exa.ai/library/publication/fcr6l5xhkk9)): *"the Kullback-Leibler distance on power spectra has the higher detection rate followed by the Euclidean distance on Mel-frequency cepstral coefficients (MFCC)."* Vepa & King built join costs on line spectral frequencies ([CSTR 2002](https://www.cstr.inf.ed.ac.uk/downloads/publications/2002/vepa_tts02.pdf); [Interspeech 2004](https://www.isca-archive.org/interspeech_2004/vepa04_interspeech.pdf)). Kirkpatrick et al. note that measures correlate only weakly with perception across studies ([SSW 2007](https://www.isca-archive.org/ssw_2007/kirkpatrick07_ssw.pdf)). Use them as a filter, not a verdict.
- **Pauses mark boundaries more than anything else.**
  - [PLOS One 2014](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0102166), with Mandarin listeners: *"Pause was a more powerful perceptual cue than both final lengthening and pitch reset."*
  - For English listeners, in a list task ("coffee, cake" vs "coffee cake"): *"The odds of a no-boundary percept are 7.6 times greater for a 0 ms duration than for an 80 ms duration"* ([Zhang 2012](https://exa.ai/library/publication/0l6ms7k7lzk)). The same work found English listeners *"attending more to pause than the other two cues"*.
  - Kuang (Speech Prosody 2022, [PDF](https://www.isca-archive.org/speechprosody_2022/kuang22_speechprosody.pdf)), for English and Mandarin: *"boundary perception was heavily driven by the presence of pause; pause also modulated the contribution of other acoustic cues."* Final lengthening and pitch reset weighed more for English listeners.
  - So a gap of about 80 ms or more inside "Say mat slowly" will be heard as a break.

### Techniques and what the evidence says
- **Cut in stop closures, voiceless consonants or breaths.** Dialogue editors: *"If you cut within a word on a hard clicky consonant like a t or a k, or on a sibilant, you can mask a great deal of cutting"* ([Sound Design StackExchange](https://sound.stackexchange.com/questions/15533/dealing-with-fillers)). Jay Rose on stop consonants: *"There's a moment of silence in the middle of each stop consonant, right before the pressure is released"*. On vowels and voiced consonants: *"make sure the pitch doesn't jump unnaturally. If it does, try moving the edit to a nearby unvoiced consonant instead. As a last resort, varispeed or pitch-shift a few words one or two percent"* ([Bryan Pugh's summary of Rose](https://bryanpugh.com/vo-editing)).
- **Crossfades: short, equal-power, at zero crossings.** *"Hard cuts can create clicks, especially when they interrupt a waveform away from a zero crossing. Add short fades at each edit point"* ([Mike's Mix Master](https://www.mikesmixmaster.com/how-to-fix-plosives-cleaning-up-p-and-b-pops-in-vocals)). A long overlap *"can blur consonants or briefly produce two voices"*, and *"Do not adopt a fixed duration for every dialogue cut"* ([VocalCopyCat](https://www.vocalcopycat.com/articles/crossfade-dialogue-edits)). Use an equal-power curve (`gain = cos(p·π/2)`) to avoid the mid-fade dip ([Smus, *Web Audio API*, ch. 3](https://webaudioapi.com/book/Web_Audio_API_Boris_Smus_html/ch03.html)).
  - **Implication for us:** today's baked 25 ms fade-to-silence at *both* ends of every clip is right for stand-alone playback but wrong for a tight medial join. It carves an amplitude dip plus about 120 ms of silence into the middle of the phrase.
- **Pitch matching at the boundary.** Use TD-PSOLA (Moulines & Charpentier) or WORLD.
  - Praat implements TD-PSOLA as "overlap-add" ([Praat manual](https://praat.org/manual/overlap-add.html); [Manipulation](https://praat.org/manual/Manipulation.html)), and we already use Praat.
  - WORLD splits speech into F0, spectral envelope and aperiodicity. It resynthesises at high quality and is *"over ten times faster than the conventional systems"* ([Morise et al. 2016](https://www.jstage.jst.go.jp/article/transinf/E99.D/7/E99.D_2015EDP7457/_article); [pyworld](https://github.com/JeremyCCHsu/Python-Wrapper-for-World-Vocoder)).
  - Keep shifts small: Morrison found *"TD-PSOLA creates larger artifacts during larger manipulations"* (§5). F0 shaping is only ever applied to the carrier and word sides, never to a pure sound.
- **Loudness and spectral tilt.** Match the **local** level around the join, not integrated LUFS per clip. A word normalised on its own to −16 LUFS doesn't sit at the level it would have inside a sentence normalised as a whole, which is why EA plays one commentator's line to the other *"so my levels are the same"*. Take the harvested word's gain from its harvest sentence, and check the spectral distance (KL/MFCC) across the join.
- **Pause insertion as a designed boundary.** Nuance's `silence.*.precpr` / `postcpr` files (§1b) and the MTA's deliberate gap (§1c) show the approach. When the carrier is recorded with an open, continuing ending (the ellipsis convention), a pause before the slot reads as intended phrasing, not a glitch. Without that intonation it reads as a hiccup. Pause is the strongest boundary cue, so **use a pause exactly where the sentence wants a boundary and nowhere else.**
- **Gapless scheduling on the web.** Web Audio's `AudioBufferSourceNode.start(when)` schedules sample-accurately on the context clock. Chaining through `onended` callbacks adds main-thread latency. MP3 priming and padding differ between decoders (§4), so sample-accurate joins need offsets measured after decoding, or trim metadata stored at build time.

**Fit.** Essential whatever else we choose. The biggest cheap win is timing: offset-accurate scheduling with per-join gap types.
- **tight:** 0–20 ms with a 5–10 ms equal-power crossfade in a closure.
- **breath:** about 120–200 ms.
- **beat:** 300 ms or more.

Next comes cut-point choice (closures, voiceless sounds). F0 and level matching are refinements after that.

---

## Synthesis: what the prior art says to do in Super Ninja

### The patterns, mapped

| game pattern | example | prior-art verdict | recommended build |
|---|---|---|---|
| carrier + **pure sound** at the end | "Say the sound… /a/", "Find this sound… /m/" | natural with a pause: teachers, TYMTR and announcers all bound isolated items with pauses | carrier **rendered with a placeholder sound in place** ("Say the sound mmm."), cut at the placeholder's onset so the carrier has pre-nuclear, open intonation. Then a designed **breath** gap (tune about 150–250 ms by ear and the judge), then the QA'd pure clip, **never** resynthesised |
| **pure sound** mid-sentence | "Put all the ducks in the /s/ pond", "/m/ is in the middle of mop" | TYMTR does it; acceptable when the sound is pause-bounded on both sides | two carrier pieces, each rendered around a placeholder; breath gaps either side |
| carrier + **word** at the end | "Tap the word… mat", "Your word is sock." | Nuance, ScotRail and SNCF all use a **final-variant** filler | harvested **final** variant of the word (cut from a render like "The word is mat."); a **breath** or **tight** join depending on whether the carrier ends in a closure |
| **word mid-phrase**, no boundary | "Say mat slowly", "Can you find mat in the picture?" | the hardest case; nobody in kids' apps splices it; IVR needs medial variants plus coarticulation design (AT&T) | **whole-sentence render** per template × word, packed into **per-unit sprites**. The harvest-and-tight-join route is allowed only where the join audit passes (both sides of each join land in a closure or voiceless consonant) |
| stretched word | "Say it slowly… m-a-t" | the stretch is a separate event with its own pause | keep splicing `x/` clips after a breath gap |
| lists of words | "mat, map, man…" | ScotRail mid/end variants; Setter's r/p tones | **continuation** variant for non-final items, **final** variant for the last |
| names and small numbers | fm_name_<w>, counts | ACIxD: record the common range whole | whole sentences (the current approach) for the small closed sets |
| example words in explanations | teach-lines.gen.ts | Black & Lenzo frequency weighting; the 26 Sep decision | keep whole sentences; they're the "frequent forms" |

### The slot-filler library (the harvest)

- **Three prosodic classes per word**, following Nuance's initial/internal/final:
  - **F**, final and falling ("The word is mat.");
  - **M**, medial and accented with no pause ("Say mat slowly.");
  - **C**, continuation or list ("mat, …").
  - At 2,100 words that's about 6,300 short clips, around 28 MB at today's bitrate. It could be fewer if some templates can live with F alone.
- **Harvest by rendering the word inside a class carrier and cutting it with forced alignment.** Our Whisper/Praat stack can do this; A3T and Black & Lenzo say to do exactly this rather than render the word alone.
  - Choose harvest carriers whose neighbouring phones at the cut are stops or voiceless consonants, per the AT&T coarticulation design: "Put mat down.", "Say mat please." rather than "Say mat…" with a vowel on the left.
  - Keep the harvest render's level: no per-word −16 LUFS normalisation.
- **Two or more takes** of the most frequent carriers and fillers, rotated without replacement (AT&T patent), so repetition doesn't sound canned.
- **Automatic join QA** on every template × filler pair actually used. Check the gap length, the F0 jump across the join (Praat), the spectral KL or MFCC distance (Stylianou & Syrdal), and the energy step. Any pair that fails is **promoted to a whole-sentence render** (Black & Lenzo's back-off). Then run the treadmill's judge on a sample.

### What stays as it is
- Pure sounds are **only ever** the QA'd `public/a/p/` clips (house rule). This matches the prior art, which never resynthesises the one item whose exact form matters. It's also exactly where a pause is natural.
- The whole-sentence families already built (tv_your_word_, fm_name_, tg_…_way, teach-lines) are ACIxD's "record the common range whole". Keep them, and move them into sprites if file count bites.

### Risks and open questions
- **Gemini render drift** across thousands of renders. Mitigate with Voice replication or a master reference, a speaker-similarity check against a reference embedding in QA, and short or empty style strings (Google's own advice).
- **The judge's ear vs Jonas's ear.** Prior art is unanimous that listening, not metrics, is the final check (Kirkpatrick: weak metric–perception correlation). Keep Jonas's ear in the loop for the first templates.
- **Safari decoding.** Sprite offsets and MP3 priming must be verified on iOS Safari before trusting tight joins.
- **Licences.** Any shipped audio touched by a neural editor must come from a commercially licensed model (PlayDiffusion, Apache-2.0). F5, VoiceCraft and SSR-Speech weights are non-commercial.

---

## Requests for changes to files I may not edit

These files belong to the other live workflow (teacher-voice-petals-scroll) or are shared, so I haven't touched them.

1. **`src/engine/audio.ts`.**
   - Schedule consecutive speech pieces on the AudioContext clock (`start(when)`), with per-clip trim offsets (the true speech start and end), instead of `onended` → `start()` chaining.
   - Add join types to `say()` items: `tight` (0–20 ms, 5–10 ms equal-power crossfade), `breath` (about 120–200 ms), `beat` (300 ms or more). The current `sleep(it.gap ?? 320)` between blend sounds can stay as `beat`.
   - Support sprite members (`{sprite, key}`), with offsets measured on the decoded buffer.
2. **`scripts/tts.ts` (`finishAudio`).**
   - Add a mode that keeps a WAV master and writes **trim metadata** instead of baking 25 ms fades and silence tails into clips meant for tight joins.
   - For harvested fillers, take gain from the harvest sentence, not per-clip −16 LUFS.
   - Expose Gemini `speech_metadata.style` and `<short pause>` if our API path supports them (to be tested).
3. **`scripts/gen-audio.ts`.**
   - Add a harvest step: render the class carriers per word, force-align, cut F/M/C variants at closure points, and store the cut times.
   - Render carriers with placeholders and cut them.
   - Pack whole-sentence families into per-unit sprites, with a decoded-offset manifest.
4. **`src/content/lines.ts`.**
   - Annotate each carrier with its slot position, the class it needs (F/M/C/pure) and its join type.
   - Reword "Say this sound:" to "Say the sound…" and "Say this word slowly:" to a whole-sentence "Say mat slowly." family (medial slot).
5. **`scripts/treadmill/*`.**
   - Add a join-audit metric (gap ms, F0 jump, spectral KL/MFCC distance, energy step) to the script audit.
   - Add a judge prompt that plays spliced vs whole-sentence versions blind.
6. **Service worker / deploy.** If sentence families grow, cache per unit lazily rather than precaching all of `public/a`. Watch the 20,000-file (Free) and 100,000-file (Paid) per-version limits.

---

## Evidence produced for this document

- `playtest/speech-templates/join-silence.py` measures leading and trailing near-silence in shipped clips (standard library only), and `playtest/speech-templates/join-silence.txt` holds its output. Lines trail a median of 95 ms; words lead with 25 ms.
- Code reads, without edits: `scripts/tts.ts` (`TTS_MODEL = "gemini-3.8-flash-tts"`, `finishAudio` trim and fade settings) and `src/engine/audio.ts` (`onended` chaining; `sleep(it.gap ?? 320)` between blend sounds).
