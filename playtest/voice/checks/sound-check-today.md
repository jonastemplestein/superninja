# Sound display: --check

Run playtest/runs/voice/baseline/sound, cases w2-1, w5-1, w5-6, w3-6, personas perfect, learner.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `petal-visible` "petal" clips with their petal visible as they start | 100 % | no petal clips | n/a |
| `petal-for-hidden` "hidden" clips with a petal of their sound visible | 0 % | no hidden clips | n/a |
| `unclassified` sounds with no job (§3.1) | 0 | 360 of 484 | **FAIL** |
| `talk-without-petal` "You won back…" and two-letter lines with no petal (SD r58, r28) | 0 | 11 of 29 | **FAIL** |
| `petal-picture-size` visible badge pictures (non-mini), smallest, at 844×390 | ≥ 38 px (report only) | min 30 px; 49 of 287 clips with one < 38 px | n/a |

## unclassified

- 66 of them would show no petal once DEFAULT_SHOW is "petal" (plan I.1):
- w5-1 learn /th/ after ‹t_same_spelling_sometimes› ×2 = SD r20 (< th >: /th/ beside /dh/) (frames/w5-1-perfect-023-sound-th-NONE.png)
- w5-1 build /sh/ after ‹dojo_build› ×2 (frames/w5-1-perfect-032-sound-sh-NONE.png)
- w3-6 learn /k/ after ‹t_one_spelling_two_sounds› ×2 = SD r19 (< x >: /k/ + /s/) (frames/w3-6-perfect-005-sound-k-NONE.png)
- w3-6 build /h/ after ‹audit_listen_next› ×2 (frames/w3-6-learner-069-sound-h-NONE.png)
- w2-1 build /k/ after ‹dojo_build› ×1 (frames/w2-1-perfect-026-sound-k-NONE.png)
- w2-1 build /h/ after ‹w/hob› ×1 (frames/w2-1-perfect-033-sound-h-NONE.png)
- w2-1 build /t/ after ‹w/top› ×1 (frames/w2-1-perfect-039-sound-t-NONE.png)
- w2-1 build /k/ after ‹w/cab› ×1 (frames/w2-1-perfect-045-sound-k-NONE.png)
- w2-1 build /k/ after ‹w/cot› ×1 (frames/w2-1-perfect-051-sound-k-NONE.png)
- w2-1 find /g/ after ‹thats› ×1 = SD r23 (Find's wrong tile) (frames/w2-1-learner-026-sound-g-NONE.png)
- w2-1 build /h/ after ‹dojo_build› ×1 (frames/w2-1-learner-029-sound-h-NONE.png)
- w2-1 build /i/ after ‹w/hit› ×1 (frames/w2-1-learner-030-sound-i-NONE.png)
- w2-1 build /p/ after ‹w/pan› ×1 (frames/w2-1-learner-036-sound-p-NONE.png)
- w2-1 build /a/ after ‹audit_listen_slowly› ×1 (frames/w2-1-learner-037-sound-a-NONE.png)
- w2-1 build /k/ after ‹w/can› ×1 (frames/w2-1-learner-042-sound-k-NONE.png)
- w2-1 build /a/ after ‹w/can› ×1 (frames/w2-1-learner-043-sound-a-NONE.png)
- w2-1 build /g/ after ‹w/got› ×1 (frames/w2-1-learner-048-sound-g-NONE.png)
- w2-1 build /o/ after ‹audit_listen_next› ×1 (frames/w2-1-learner-050-sound-o-NONE.png)
- w2-1 build /k/ after ‹w/cob› ×1 (frames/w2-1-learner-055-sound-k-NONE.png)
- w2-1 build /o/ after ‹w/cob› ×1 (frames/w2-1-learner-056-sound-o-NONE.png)
- w5-1 build /dh/ after ‹w/this› ×1 (frames/w5-1-perfect-039-sound-dh-NONE.png)
- w5-1 build /dh/ after ‹w/then› ×1 (frames/w5-1-perfect-045-sound-dh-NONE.png)
- w5-1 build /t/ after ‹w/trim› ×1 (frames/w5-1-perfect-051-sound-t-NONE.png)
- w5-1 build /w/ after ‹w/with› ×1 (frames/w5-1-perfect-059-sound-w-NONE.png)
- w5-6 build /b/ after ‹dojo_build› ×1 (frames/w5-6-perfect-033-sound-b-NONE.png)
- w5-6 build /w/ after ‹w/with› ×1 (frames/w5-6-perfect-042-sound-w-NONE.png)
- w5-6 build /th/ after ‹t_this_can_be› ×1 (frames/w5-6-perfect-048-sound-th-NONE.png)
- w5-6 build /dh/ after ‹t_but_in_this_word› ×1 (frames/w5-6-perfect-049-sound-dh-NONE.png)
- w5-6 build /r/ after ‹w/rush› ×1 (frames/w5-6-perfect-050-sound-r-NONE.png)
- w5-6 build /s/ after ‹w/sketch› ×1 (frames/w5-6-perfect-057-sound-s-NONE.png)
- w5-6 build /s/ after ‹w/sing› ×1 (frames/w5-6-perfect-065-sound-s-NONE.png)
- w3-6 build /f/ after ‹dojo_build› ×1 (frames/w3-6-perfect-050-sound-f-NONE.png)
- w3-6 build /k/ after ‹w/cut› ×1 (frames/w3-6-perfect-057-sound-k-NONE.png)
- w3-6 build /l/ after ‹w/less› ×1 (frames/w3-6-perfect-063-sound-l-NONE.png)
- w3-6 build /y/ after ‹w/yell› ×1 (frames/w3-6-perfect-069-sound-y-NONE.png)
- w3-6 build /m/ after ‹w/mix› ×1 (frames/w3-6-perfect-075-sound-m-NONE.png)
- w3-6 find /o/ after ‹thats› ×1 = SD r23 (Find's wrong tile) (frames/w3-6-learner-048-sound-o-NONE.png)
- w3-6 find /ks/ after ‹thats› ×1 = SD r23 (Find's wrong tile) (frames/w3-6-learner-050-sound-ks-NONE.png)
- w3-6 build /d/ after ‹dojo_build› ×1 (frames/w3-6-learner-055-sound-d-NONE.png)

## talk-without-petal

- w5-6 build ‹t_two_letters› ×3 = SD r28 (the read-back's two-letter line) (frames/w5-6-perfect-056-talk-t_two_letters-NONE.png)
- w2-1 reward ‹petals_got› ×2 = SD r58 (the reward's won sounds) (frames/w2-1-perfect-057-talk-petals_got-NONE.png)
- w5-1 reward ‹petals_got› ×2 = SD r58 (the reward's won sounds) (frames/w5-1-perfect-065-talk-petals_got-NONE.png)
- w5-6 reward ‹petals_got› ×2 = SD r58 (the reward's won sounds) (frames/w5-6-perfect-071-talk-petals_got-NONE.png)
- w3-6 reward ‹petals_got› ×2 = SD r58 (the reward's won sounds) (frames/w3-6-perfect-081-talk-petals_got-NONE.png)

## petal-picture-size

- w5-6 find /w/ after ‹dojo_find› ×3
- w2-1 find /b/ after ‹dojo_find› ×2 (frames/w2-1-perfect-021-sound-b-petal.png)
- w2-1 find /k/ after ‹dojo_find› ×2
- w2-1 find /g/ after ‹dojo_find› ×2
- w5-1 find /sh/ after ‹dojo_find› ×2 (frames/w5-1-perfect-027-sound-sh-petal.png)
- w5-1 find /ch/ after ‹dojo_find› ×2

