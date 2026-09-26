# Phoneme QA results

46 clips checked with Praat and faster-whisper. All current clips pass the configured acoustic gate. Blind Gemini output is in `gemini-blind.json` and is a weak signal.

| Phoneme | Before | After | Method |
|---|---|---|---|
| /a/ | PASS: within acoustic limits | PASS | kept |
| /i/ | FAIL: F1 moves +1743 Hz: not a steady vowel | PASS | pig vowel |
| /m/ | PASS: within acoustic limits | PASS | kept |
| /s/ | PASS: within acoustic limits | PASS | kept |
| /t/ | FAIL: stop/affricate is 420 ms (limit 120 ms) | PASS | tip stop |
| /n/ | PASS: within acoustic limits | PASS | kept |
| /o/ | FAIL: F2 moves +2221 Hz: diphthong rather than steady /o/; Whisper hears letter name 'Oh.' | PASS | dog vowel |
| /p/ | FAIL: stop/affricate is 170 ms (limit 120 ms) | PASS | pig stop |
| /b/ | FAIL: stop/affricate is 330 ms (limit 120 ms); 310 ms voiced (limit 100 ms); 310 ms continuous voicing indicates a following vowel; Whisper hears letter name 'B.' | PASS | bed stop |
| /k/ | FAIL: stop/affricate is 420 ms (limit 120 ms); 280 ms voiced (limit 60 ms); 280 ms continuous voicing indicates a following vowel | PASS | kit stop |
| /g/ | FAIL: stop/affricate is 210 ms (limit 120 ms); 150 ms voiced (limit 100 ms) | PASS | gap stop |
| /h/ | FAIL: 36.6 dB internal rise suggests a following vowel | PASS | hat unvoiced |
| /d/ | FAIL: stop/affricate is 280 ms (limit 120 ms); 170 ms voiced (limit 100 ms) | PASS | dog stop |
| /e/ | PASS: within acoustic limits | PASS | kept |
| /f/ | PASS: within acoustic limits | PASS | kept |
| /v/ | PASS: within acoustic limits | PASS | kept |
| /l/ | PASS: within acoustic limits | PASS | kept |
| /r/ | FAIL: F1/F2 rise +868/+1051 Hz indicates /r/ moving into a vowel | PASS | red continuant |
| /u/ | FAIL: F1/F2 1127/1566 Hz outside /u/ target 420–980/850–2050; F1 moves +548 Hz: not a steady vowel | PASS | cut vowel |
| /j/ | FAIL: stop/affricate is 450 ms (limit 175 ms); 250 ms voiced (limit 100 ms); 160 ms continuous voicing indicates a following vowel | PASS | jam stop |
| /w/ | FAIL: late F1 1215 Hz indicates an open vowel after /w/ (target wwoo) | PASS | wet continuant |
| /z/ | PASS: within acoustic limits | PASS | kept |
| /ks/ | FAIL: Whisper hears letter name 'X.' | PASS | box pair |
| /y/ | PASS: within acoustic limits | PASS | kept |
| /sh/ | PASS: within acoustic limits | PASS | kept |
| /ch/ | FAIL: stop/affricate is 360 ms (limit 175 ms) | PASS | chip stop |
| /th/ | PASS: within acoustic limits | PASS | kept |
| /dh/ | PASS: within acoustic limits | PASS | kept |
| /ng/ | PASS: within acoustic limits | PASS | kept |
| /kw/ | FAIL: 110 ms voicing in /kw/ pair | PASS | quick pair |
| /ae/ | PASS: within acoustic limits | PASS | kept |
| /ee/ | PASS: within acoustic limits | PASS | kept |
| /ie/ | PASS: within acoustic limits | PASS | kept |
| /oe/ | PASS: within acoustic limits | PASS | kept |
| /oo/ | FAIL: F2 moves +927 Hz: diphthong rather than steady /oo/; F1 moves +405 Hz: not a steady vowel | PASS | food vowel |
| /ar/ | PASS: within acoustic limits | PASS | kept |
| /or/ | PASS: within acoustic limits | PASS | kept |
| /er/ | PASS: within acoustic limits | PASS | kept |
| /ou/ | FAIL: F2 fall +1313 Hz is too small for /ou/ | PASS | cow diphthong |
| /oy/ | PASS: within acoustic limits | PASS | kept |
| /ue/ | PASS: within acoustic limits | PASS | kept |
| /uu/ | PASS: within acoustic limits | PASS | kept |
| /air/ | PASS: within acoustic limits | PASS | chair diphthong |
| /eer/ | PASS: within acoustic limits | PASS | kept |
| /zh/ | PASS: within acoustic limits | PASS | kept |
| /schwa/ | FAIL: F2 moves +726 Hz: diphthong rather than steady /schwa/; F1 moves +431 Hz: not a steady vowel | PASS | sofa vowel |
