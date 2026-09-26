Rebuilt 20 phoneme clips from spoken words and archived each previous clip in [.trash/phonemes-2026-09-26](/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/.trash/phonemes-2026-09-26). **All 46 current clips pass** the [Praat and Whisper QA](/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/playtest/phonemes/qa.json). The [listening page](/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/playtest/phonemes/index.html) has before and after playback for every sound. Blind [Gemini results](/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/playtest/phonemes/gemini-blind.json) were contradictory, so Jonas’s listening review remains important.

Added [qa.py](/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/scripts/phonemes/qa.py) and documented its use in [TREADMILL.md](/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/docs/TREADMILL.md). Its broad female British vowel ranges are anchored to [Deterding’s Standard Southern British measurements](https://repository.nie.edu.sg/server/api/core/bitstreams/846cf9d9-c799-4773-a96a-0026e608613c/content). The [spoken-line scan](/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/playtest/phonemes/letter-name-lines.md) found no offending line IDs; `audit_special_i` intentionally says the word “I”. No commit was made.

| Phoneme | Before QA | After | Method |
|---|---|---|---|
| /a/ | PASS | PASS | Kept |
| /i/ | FAIL: F1 drifted 1743 Hz | PASS | Vowel from *pig*, stretched |
| /m/ | PASS | PASS | Kept |
| /s/ | PASS | PASS | Kept |
| /t/ | FAIL: 420 ms stop | PASS | Initial *tip* cut |
| /n/ | PASS | PASS | Kept |
| /o/ | FAIL: F2 drifted 2221 Hz; Whisper heard “Oh” | PASS | Vowel from *dog*, stretched |
| /p/ | FAIL: 170 ms stop | PASS | Initial *pig* cut |
| /b/ | FAIL: 330 ms, 310 ms voiced; Whisper heard “B” | PASS | Initial *bed* cut |
| /k/ | FAIL: 420 ms, 280 ms voiced | PASS | Initial *kit* cut |
| /g/ | FAIL: 210 ms, 150 ms voiced | PASS | Initial *gap* cut |
| /h/ | FAIL: 36.6 dB internal rise | PASS | Initial *hat* cut, stretched |
| /d/ | FAIL: 280 ms, 170 ms voiced | PASS | Initial *dog* cut |
| /e/ | PASS | PASS | Kept |
| /f/ | PASS | PASS | Kept |
| /v/ | PASS | PASS | Kept |
| /l/ | PASS | PASS | Kept |
| /r/ | FAIL: F1/F2 rose into a vowel | PASS | Initial *red* cut, smoothed and stretched |
| /u/ | FAIL: F1 outside target and drifting | PASS | Vowel from *cut*, stretched |
| /j/ | FAIL: 450 ms, 250 ms voiced | PASS | Initial *jam* cut |
| /w/ | FAIL: open vowel after /w/ | PASS | Initial *wet* cut, smoothed and stretched |
| /z/ | PASS | PASS | Kept |
| /ks/ | FAIL: Whisper heard “X” | PASS | Final /ks/ from *box* |
| /y/ | PASS | PASS | Kept |
| /sh/ | PASS | PASS | Kept |
| /ch/ | FAIL: 360 ms affricate | PASS | Initial *chip* cut |
| /th/ | PASS | PASS | Kept |
| /dh/ | PASS | PASS | Kept |
| /ng/ | PASS | PASS | Kept |
| /kw/ | FAIL: 110 ms voiced | PASS | Initial *quick* cut |
| /ae/ | PASS | PASS | Kept |
| /ee/ | PASS | PASS | Kept |
| /ie/ | PASS | PASS | Kept |
| /oe/ | PASS | PASS | Kept |
| /oo/ | FAIL: F1/F2 drifted | PASS | Vowel from *food*, stretched |
| /ar/ | PASS | PASS | Kept |
| /or/ | PASS | PASS | Kept |
| /er/ | PASS | PASS | Kept |
| /ou/ | FAIL: F2 rose instead of falling | PASS | Diphthong from *cow* |
| /oy/ | PASS | PASS | Kept |
| /ue/ | PASS | PASS | Kept |
| /uu/ | PASS | PASS | Kept |
| /air/ | PASS | PASS | Vowel from *chair*, stretched |
| /eer/ | PASS | PASS | Kept |
| /zh/ | PASS | PASS | Kept |
| /schwa/ | FAIL: F1/F2 drifted | PASS | Final vowel from *sofa*, stretched |