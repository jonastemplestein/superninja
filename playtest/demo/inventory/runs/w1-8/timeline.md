# w1-8 Sound Swap

https://superninja.templestein.com/play/?level=w1-8 · recorded 2026-09-27T08:50:25.981Z · 844×390, touch, real speed · times are seconds from the video's first frame

| t (s) | what | detail |
|---|---|---|
| 0.22 | pose | pose idle |
| 0.22 | beat | — swap — |
| 0.75 | say | **Baron Muddle has mixed up these words! Can you fix them? Change one sound at a time.** (swap_start, until 6.75) |
| 6.95 | say | **This is...** (this_is, until 7.84) |
| 7.84 | say | **"mat"** (word:mat, until 8.47) |
| 8.52 | say | **Change it to make...** (swap_make, until 9.47) |
| 9.58 | say | **"sat"** (word:sat, until 10.31) |
| 10.61 | say | **"mat", slowly** (slow:mat, until 11.96) |
| 11.22 | pose | pose ready |
| 12.10 | pose | pose idle |
| 12.31 | say | **"sat", slowly** (slow:sat, until 13.66) |
| 13.91 | say | **What changed? Listen here.** (what_changed, until 16.13) |
| 16.19 | turn | the child's turn opens (answer: s) |
| 17.80 | sfx | sfx tap |
| 17.80 | tap | CHILD TAPS **m** |
| 17.80 | sfx | sfx pop |
| 17.80 | ninja | ninja.act(spin → m) |
| 17.80 | state | m (tile) +right  |
| 17.80 | pose | pose ready |
| 17.91 | pose | pose spin |
| 17.91 | sfx | sfx spin |
| 18.39 | sfx | sfx land |
| 18.39 | pose | pose idle |
| 18.44 | sfx | sfx thwack |
| 18.44 | sfx | sfx whoosh |
| 18.49 | turn | the child's turn opens (answer: s) |
| 18.83 | say | **Yes, the first sound changes! Now pick the new sound.** (audit_swap_first, until 23.07) |
| 24.65 | sfx | sfx tap |
| 24.65 | tap | CHILD TAPS **s** |
| 24.65 | sfx | sfx magic |
| 24.65 | ninja | ninja.carry( → (490, 543)) |
| 24.65 | pose | pose cast |
| 25.05 | sfx | sfx place |
| 25.05 | sfx | sfx petal |
| 25.07 | pose | pose idle |
| 25.25 | sfx | sfx pop |
| 25.54 | say | **/s/** (sound:s, until 26.32) |
| 25.54 | state | s (sb) +lit  |
| 26.58 | say | **/a/** (sound:a, until 26.90) |
| 26.59 | state | s (sb)  -lit |
| 26.59 | state | a (sb) +lit  |
| 27.16 | say | **/t/** (sound:t, until 27.32) |
| 27.16 | state | a (sb)  -lit |
| 27.16 | state | t (sb) +lit  |
| 27.58 | state | t (sb)  -lit |
| 27.73 | say | **"sat"** (word:sat, until 28.47) |
| 28.47 | sfx | sfx good |
| 28.47 | ninja | ninja.act(cast → swap-baron idle) |
| 28.47 | sfx | sfx charge |
| 28.47 | pose | pose cast |
| 28.50 | say | **Wow, great listening!** (yay_8, until 30.11) |
| 28.79 | sfx | sfx magic |
| 29.03 | pose | pose idle |
| 29.39 | sfx | sfx sparkle |
| 30.11 | sfx | sfx sparkle |
| 30.16 | say | **Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up.** (audit_gem_first, until 37.53) |
| 31.32 | state | gem-liquid on (gem-liquid) +on  |
| 37.59 | hold | held on Next (gem-energy) |
| 38.67 | tap | CHILD TAPS **Next** |
| 38.67 | say | **Change it to make...** (swap_make, until 39.62) |
| 39.73 | say | **"sit"** (word:sit, until 40.38) |
| 40.69 | say | **"sat", slowly** (slow:sat, until 42.04) |
| 42.39 | say | **"sit", slowly** (slow:sit, until 43.67) |
| 43.92 | say | **What changed? Listen here.** (what_changed, until 46.14) |
| 46.19 | turn | the child's turn opens (answer: i) |
| 47.64 | sfx | sfx tap |
| 47.64 | sfx | sfx pop |
| 47.64 | tap | CHILD TAPS **a** |
| 47.64 | ninja | ninja.act(punch → a) |
| 47.65 | state | a (tile) +right  |
| 47.65 | pose | pose ready |
| 47.73 | pose | pose punch |
| 47.78 | sfx | sfx swish |
| 47.95 | pose | pose idle |
| 47.97 | sfx | sfx thwack |
| 47.97 | sfx | sfx whoosh |
| 48.12 | pose | pose ready |
| 48.12 | ninja | ninja.act(power) |
| 48.12 | sfx | sfx charge |
| 48.31 | pose | pose power |
| 48.31 | sfx | sfx powerup |
| 48.34 | say | **Three right answers in a row! Your ninja is getting stronger.** (audit_streak_first, until 51.95) |
| 49.02 | pose | pose ready |
