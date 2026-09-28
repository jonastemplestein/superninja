# Sound display: --check

Run playtest/fix/F4/sound-w5-6, cases w5-6, w3-6, personas perfect.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `petal-visible` "petal" clips with their petal visible as they start | 100 % | 0 of 3 | **FAIL** |
| `petal-for-hidden` "hidden" clips with a petal of their sound visible | 0 % | no hidden clips | n/a |
| `unclassified` sounds with no job (§3.1) | 0 | 91 of 124 | **FAIL** |
| `talk-without-petal` "You won back…" and two-letter lines with no petal (SD r58, r28) | 0 | 2 of 9 | **FAIL** |
| `petal-picture-size` visible badge pictures (non-mini), smallest, at 844×390 | ≥ 38 px (report only) | min 30 px; 12 of 83 clips with one < 38 px | n/a |

## petal-visible

- w5-6 build /ch/ after ‹t_two_letters› ×1 (frames/w5-6-perfect-042-sound-ch-NONE.png)
- w3-6 learn /k/ after ‹t_one_spelling_two_sounds› ×1 = SD r19 (< x >: /k/ + /s/) (frames/w3-6-perfect-005-sound-k-NONE.png)
- w3-6 learn /s/ after ‹t_one_spelling_two_sounds› ×1 = SD r19 (< x >: /k/ + /s/) (frames/w3-6-perfect-006-sound-s-NONE.png)

## unclassified

- 10 of them would show no petal once DEFAULT_SHOW is "petal" (plan I.1):
- w5-6 build /ch/ after ‹dojo_build› ×1 (frames/w5-6-perfect-035-sound-ch-NONE.png)
- w5-6 build /w/ after ‹w/wish› ×1 (frames/w5-6-perfect-044-sound-w-NONE.png)
- w5-6 build /r/ after ‹w/rag› ×1 (frames/w5-6-perfect-050-sound-r-NONE.png)
- w5-6 build /d/ after ‹w/duck› ×1 (frames/w5-6-perfect-056-sound-d-NONE.png)
- w5-6 build /h/ after ‹w/hutch› ×1 (frames/w5-6-perfect-062-sound-h-NONE.png)
- w3-6 build /b/ after ‹dojo_build› ×1 (frames/w3-6-perfect-050-sound-b-NONE.png)
- w3-6 build /b/ after ‹w/boss› ×1 (frames/w3-6-perfect-057-sound-b-NONE.png)
- w3-6 build /j/ after ‹w/jig› ×1 (frames/w3-6-perfect-063-sound-j-NONE.png)
- w3-6 build /m/ after ‹w/mix› ×1 (frames/w3-6-perfect-069-sound-m-NONE.png)
- w3-6 build /k/ after ‹w/kiss› ×1 (frames/w3-6-perfect-075-sound-k-NONE.png)

## talk-without-petal

- w5-6 reward ‹petals_got› ×1 = SD r58 (the reward's won sounds) (frames/w5-6-perfect-068-talk-petals_got-NONE.png)
- w3-6 reward ‹petals_got› ×1 = SD r58 (the reward's won sounds) (frames/w3-6-perfect-081-talk-petals_got-NONE.png)

## petal-picture-size

- w5-6 find /k/ after ‹dojo_find› ×1 (frames/w5-6-perfect-028-sound-k-petal.png)
- w5-6 find /w/ after ‹dojo_find› ×1
- w5-6 find /v/ after ‹dojo_find› ×1
- w5-6 find /ch/ after ‹dojo_find› ×1
- w5-6 find ‹tut_speaker› ×1 (frames/w5-6-perfect-032-talk-ch-petal.png)
- w5-6 find /ch/ after ‹tut_speaker› ×1 (frames/w5-6-perfect-033-sound-ch-petal.png)

