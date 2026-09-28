# Sound display: --check

Run playtest/runs/fix/F4/bite-sound, cases w1-2, w2-1, w5-1, w5-6, w3-6, personas perfect, learner.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `petal-visible` "petal" clips with their petal visible as they start | 100 % | 2 of 11 | **FAIL** |
| `petal-for-hidden` "hidden" clips with a petal of their sound visible | 0 % | no hidden clips | n/a |
| `unclassified` sounds with no job (§3.1) | 0 | 419 of 554 | **FAIL** |
| `talk-without-petal` "You won back…" and two-letter lines with no petal (SD r58, r28) | 0 | 10 of 29 | **FAIL** |
| `petal-picture-size` visible badge pictures (non-mini), smallest, at 844×390 | ≥ 38 px (report only) | min 30 px; 133 of 371 clips with one < 38 px | n/a |

## petal-visible

- w5-1 learn /th/ after ‹t_same_spelling_sometimes› ×2 = SD r20 (< th >: /th/ beside /dh/) (frames/w5-1-perfect-023-sound-th-NONE.png)
- w3-6 learn /k/ after ‹t_one_spelling_two_sounds› ×2 = SD r19 (< x >: /k/ + /s/) (frames/w3-6-perfect-005-sound-k-NONE.png)
- w3-6 learn /s/ after ‹t_one_spelling_two_sounds› ×2 = SD r19 (< x >: /k/ + /s/) (frames/w3-6-perfect-006-sound-s-NONE.png)
- w5-6 build /th/ after ‹t_this_can_be› ×1 (frames/w5-6-perfect-055-sound-th-NONE.png)
- w5-6 build /dh/ after ‹t_but_in_this_word› ×1 (frames/w5-6-perfect-056-sound-dh-NONE.png)
- w5-6 build /sh/ after ‹t_two_letters› ×1 (frames/w5-6-learner-042-sound-sh-NONE.png)

## unclassified

- 77 of them would show no petal once DEFAULT_SHOW is "petal" (plan I.1):
- w2-1 build /b/ after ‹dojo_build› ×1 (frames/w2-1-perfect-026-sound-b-NONE.png)
- w2-1 build /b/ after ‹w/bib› ×1 (frames/w2-1-perfect-033-sound-b-NONE.png)
- w2-1 build /h/ after ‹w/him› ×1 (frames/w2-1-perfect-039-sound-h-NONE.png)
- w2-1 build /i/ after ‹w/him› ×1 (frames/w2-1-perfect-040-sound-i-NONE.png)
- w2-1 build /k/ after ‹w/cob› ×1 (frames/w2-1-perfect-044-sound-k-NONE.png)
- w2-1 build /b/ after ‹w/cob› ×1 (frames/w2-1-perfect-046-sound-b-NONE.png)
- w2-1 build /n/ after ‹w/nap› ×1 (frames/w2-1-perfect-050-sound-n-NONE.png)
- w2-1 build /a/ after ‹w/nap› ×1 (frames/w2-1-perfect-051-sound-a-NONE.png)
- w5-1 build /d/ after ‹yay_8› ×1 (frames/w5-1-perfect-036-sound-d-NONE.png)
- w5-1 build /sh/ after ‹yay_8› ×1 (frames/w5-1-perfect-038-sound-sh-NONE.png)
- w5-1 build /m/ after ‹w/munch› ×1 (frames/w5-1-perfect-043-sound-m-NONE.png)
- w5-1 build /ch/ after ‹w/munch› ×1 (frames/w5-1-perfect-046-sound-ch-NONE.png)
- w5-1 build /m/ after ‹w/milk› ×1 (frames/w5-1-perfect-051-sound-m-NONE.png)
- w5-1 build /l/ after ‹w/milk› ×1 (frames/w5-1-perfect-053-sound-l-NONE.png)
- w5-1 build /k/ after ‹w/milk› ×1
- w5-1 build /th/ after ‹w/thump› ×1 = SD r20 (< th >: /th/ beside /dh/) (frames/w5-1-perfect-059-sound-th-NONE.png)
- w5-1 build /r/ after ‹w/rush› ×1 (frames/w5-1-perfect-067-sound-r-NONE.png)
- w5-6 build /k/ after ‹tv_yay_lovely› ×1 (frames/w5-6-perfect-036-sound-k-NONE.png)
- w5-6 build /w/ after ‹tv_yay_lovely› ×1 (frames/w5-6-perfect-037-sound-w-NONE.png)
- w5-6 build /i/ after ‹tv_yay_lovely› ×1
- w5-6 build /w/ after ‹w/win› ×1 (frames/w5-6-perfect-044-sound-w-NONE.png)
- w5-6 build /dh/ after ‹w/that› ×1 (frames/w5-6-perfect-049-sound-dh-NONE.png)
- w5-6 build /a/ after ‹w/that› ×1 (frames/w5-6-perfect-050-sound-a-NONE.png)
- w5-6 build /t/ after ‹w/that› ×1
- w5-6 build /th/ after ‹w/thing› ×1 (frames/w5-6-perfect-057-sound-th-NONE.png)
- w5-6 build /i/ after ‹w/thing› ×1 (frames/w5-6-perfect-058-sound-i-NONE.png)
- w5-6 build /d/ after ‹w/dish› ×1 (frames/w5-6-perfect-063-sound-d-NONE.png)
- w3-6 build /b/ after ‹dojo_build› ×1 (frames/w3-6-perfect-059-sound-b-NONE.png)
- w3-6 build /e/ after ‹dojo_build› ×1 (frames/w3-6-perfect-060-sound-e-NONE.png)
- w3-6 build /k/ after ‹w/cuff› ×1 (frames/w3-6-perfect-066-sound-k-NONE.png)
- w3-6 build /y/ after ‹w/yap› ×1 (frames/w3-6-perfect-072-sound-y-NONE.png)
- w3-6 build /s/ after ‹w/sun› ×1 (frames/w3-6-perfect-078-sound-s-NONE.png)
- w3-6 build /o/ after ‹w/off› ×1 (frames/w3-6-perfect-084-sound-o-NONE.png)
- w2-1 find /h/ after ‹thats› ×1 = SD r23 (Find's wrong tile) (frames/w2-1-learner-021-sound-h-NONE.png)
- w2-1 find /n/ after ‹thats› ×1 = SD r23 (Find's wrong tile) (frames/w2-1-learner-025-sound-n-NONE.png)
- w2-1 find /k/ after ‹thats› ×1 = SD r23 (Find's wrong tile)
- w2-1 build /h/ after ‹dojo_build› ×1 (frames/w2-1-learner-035-sound-h-NONE.png)
- w2-1 build /t/ after ‹tv_listen_here› ×1 (frames/w2-1-learner-037-sound-t-NONE.png)
- w2-1 build /b/ after ‹w/bag› ×1 (frames/w2-1-learner-042-sound-b-NONE.png)

## talk-without-petal

- w1-2 reward ‹petals_got› ×2 = SD r58 (the reward's won sounds) (frames/w1-2-perfect-026-talk-petals_got-NONE.png)
- w2-1 reward ‹petals_got› ×2 = SD r58 (the reward's won sounds) (frames/w2-1-perfect-055-talk-petals_got-NONE.png)
- w5-1 reward ‹petals_got› ×2 = SD r58 (the reward's won sounds) (frames/w5-1-perfect-073-talk-petals_got-NONE.png)
- w5-6 reward ‹petals_got› ×2 = SD r58 (the reward's won sounds) (frames/w5-6-perfect-069-talk-petals_got-NONE.png)
- w3-6 reward ‹petals_got› ×2 = SD r58 (the reward's won sounds) (frames/w3-6-perfect-088-talk-petals_got-NONE.png)

## petal-picture-size

- w1-2 pick /m/ after ‹first_q› ×11 (frames/w1-2-perfect-001-sound-m-petal.png)
- w1-2 pick /s/ after ‹first_q› ×11
- w1-2 pick /s/ after ‹how_we_spell› ×4
- w1-2 pick /s/ after ‹fs_sand› ×4 (frames/w1-2-perfect-017-sound-s-petal.png)
- w5-1 find ‹tut_speaker› ×4 (frames/w5-1-perfect-029-talk-ch-petal.png)
- w1-2 pick /s/ after ‹fs_sun› ×3 (frames/w1-2-perfect-014-sound-s-petal.png)

