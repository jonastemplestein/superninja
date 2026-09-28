# w6-br1 Sorting (the Bridging Unit)

https://superninja.templestein.com/play/?level=w6-br1 · recorded 2026-09-27T08:58:53.855Z · 844×390, touch, real speed · times are seconds from the video's first frame

| t (s) | what | detail |
|---|---|---|
| 0.23 | pose | pose idle |
| 0.23 | beat | — sort — |
| 1.05 | sfx | sfx pop |
| 1.21 | sfx | sfx pop |
| 1.37 | sfx | sfx pop |
| 1.49 | say | **You know this sound! Now let's look at the different ways we spell it.** (audit_bridging_first, until 5.24) |
| 5.54 | say | **Sorting time! These words have the same sound, but it's spelt in different ways.** (audit_sort_first, until 10.57) |
| 10.88 | say | **This sound can be spelt in three ways.** (audit_sort_three, until 13.39) |
| 13.64 | sfx | sfx pop |
| 13.64 | state | c (tile) +hint  |
| 13.79 | say | **/k/** (sound:k, until 13.98) |
| 14.38 | sfx | sfx pop |
| 14.38 | state | c (tile)  -hint |
| 14.38 | state | k (tile) +hint  |
| 14.53 | say | **/k/** (sound:k, until 14.72) |
| 15.12 | sfx | sfx pop |
| 15.12 | state | k (tile)  -hint |
| 15.12 | state | ck (tile) +hint  |
| 15.27 | say | **/k/** (sound:k, until 15.45) |
| 15.48 | pose | pose ready |
| 15.76 | say | **It's two letters, but it's one sound.** (t_two_letters, until 18.62) |
| 16.36 | pose | pose idle |
| 19.02 | state | ck (tile)  -hint |
| 19.06 | say | **Tap the chest with the same spelling as the word.** (help_sort, until 21.99) |
| 22.09 | turn | the child's turn opens (answer: k) |
| 22.31 | say | **"desk"** (word:desk, until 23.00) |
| 23.59 | tap | CHILD TAPS **basket k** |
| 23.59 | sfx | sfx good |
| 23.60 | ninja | ninja.pose(power) |
| 23.60 | pose | pose power |
| 23.60 | state | so-power on (so-power) +on  |
| 23.60 | state | so-power on (so-power) +on  |
| 23.60 | state | k (tile) +right  |
| 23.72 | say | **/d/** (sound:d, until 24.09) |
| 23.72 | state | sb dot lit (sb) +lit  |
| 23.72 | state |  lit now () +lit  |
| 24.34 | say | **/e/** (sound:e, until 25.06) |
| 24.35 | state | sb dot  (sb)  -lit |
| 24.35 | state |    ()  -lit |
| 24.35 | state | sb dot lit (sb) +lit  |
| 24.35 | state |  lit now () +lit  |
| 25.33 | say | **/s/** (sound:s, until 26.11) |
| 25.33 | state | sb dot  (sb)  -lit |
| 25.33 | state |    ()  -lit |
| 25.33 | state | sb dot lit (sb) +lit  |
| 25.33 | state |  lit now () +lit  |
| 26.37 | say | **/k/** (sound:k, until 26.56) |
| 26.37 | state | sb dot  (sb)  -lit |
| 26.37 | state |    ()  -lit |
| 26.37 | state | sb dot lit (sb) +lit  |
| 26.37 | state | hl lit now (hl) +lit  |
| 26.82 | state | sb dot lit (sb) +lit  |
| 26.82 | state |  lit  () +lit  |
| 26.82 | state | sb dot lit (sb) +lit  |
| 26.82 | state |  lit  () +lit  |
| 26.82 | state | sb dot lit (sb) +lit  |
| 26.82 | state |  lit  () +lit  |
| 26.97 | say | **"desk"** (word:desk, until 27.66) |
| 27.67 | ninja | ninja.strike(kick → so-panel yes blend) |
| 27.67 | ninja | ninja.act(kick → so-panel yes blend) |
| 27.67 | state | so-power go (so-power)  -on |
| 27.67 | state | so-power go (so-power)  -on |
| 27.67 | state | so-power go (so-power)  -on |
| 27.67 | pose | pose ready |
| 27.76 | sfx | sfx kick |
| 27.76 | pose | pose kick |
| 28.00 | pose | pose jump |
| 28.05 | sfx | sfx thwack |
| 28.06 | pose | pose idle |
| 28.47 | sfx | sfx coin |
| 28.47 | sfx | sfx place |
| 28.47 | sfx | sfx sparkle |
| 28.51 | say | **Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up.** (audit_gem_first, until 35.88) |
| 29.68 | state | gem-liquid on (gem-liquid) +on  |
| 35.89 | hold | held on Next (gem-energy) |
| 37.11 | tap | CHILD TAPS **Next** |
| 37.11 | state | k (tile)  -right |
| 37.11 | state | ck (tile) +right  |
| 37.11 | state | sb dot  (sb)  -lit |
| 37.11 | state |    ()  -lit |
| 37.11 | state | sb dot  (sb)  -lit |
| 37.11 | state |    ()  -lit |
| 37.11 | state | sb bar  (sb)  -lit |
| 37.11 | state |    ()  -lit |
| 37.11 | state | ck (tile)  -right |
| 37.19 | turn | the child's turn opens (answer: ck) |
| 37.43 | say | **"neck"** (word:neck, until 38.02) |
| 38.73 | sfx | sfx good |
| 38.73 | tap | CHILD TAPS **basket ck** |
| 38.73 | ninja | ninja.pose(power) |
| 38.73 | pose | pose power |
| 38.73 | state | so-power on (so-power) +on  |
| 38.73 | state | so-power on (so-power) +on  |
| 38.73 | state | ck (tile) +right  |
| 38.85 | say | **/n/** (sound:n, until 39.44) |
| 38.85 | state | sb dot lit (sb) +lit  |
| 38.85 | state |  lit now () +lit  |
| 39.70 | say | **/e/** (sound:e, until 40.42) |
| 39.70 | state | sb dot  (sb)  -lit |
| 39.70 | state |    ()  -lit |
| 39.70 | state | sb dot lit (sb) +lit  |
| 39.70 | state |  lit now () +lit  |
| 40.68 | say | **/k/** (sound:k, until 40.87) |
| 40.68 | state | sb dot  (sb)  -lit |
| 40.68 | state |    ()  -lit |
| 40.68 | state | sb bar lit (sb) +lit  |
| 40.68 | state | hl lit now (hl) +lit  |
| 41.13 | state | sb dot lit (sb) +lit  |
| 41.13 | state |  lit  () +lit  |
| 41.13 | state | sb dot lit (sb) +lit  |
| 41.13 | state |  lit  () +lit  |
| 41.28 | say | **"neck"** (word:neck, until 41.88) |
| 41.88 | ninja | ninja.strike(punch → so-panel yes blend) |
| 41.88 | ninja | ninja.act(punch → so-panel yes blend) |
| 41.88 | state | so-power go (so-power)  -on |
| 41.88 | state | so-power go (so-power)  -on |
| 41.88 | state | so-power go (so-power)  -on |
| 41.88 | pose | pose ready |
| 41.96 | pose | pose punch |
| 42.02 | sfx | sfx swish |
| 42.19 | pose | pose power |
| 42.20 | sfx | sfx thwack |
| 42.35 | pose | pose idle |
| 42.62 | sfx | sfx coin |
| 42.62 | sfx | sfx place |
| 42.62 | state | c (tile) +right  |
| 42.62 | state | ck (tile)  -right |
| 42.62 | state | sb dot  (sb)  -lit |
| 42.62 | state |    ()  -lit |
| 42.62 | state | sb dot  (sb)  -lit |
| 42.62 | state |    ()  -lit |
| 42.62 | state | sb bar  (sb)  -lit |
| 42.62 | state |    ()  -lit |
| 42.62 | state | c (tile)  -right |
| 42.69 | turn | the child's turn opens (answer: c) |
| 42.94 | say | **"catch"** (word:catch, until 43.55) |
