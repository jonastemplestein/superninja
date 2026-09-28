# Sound display: --check

Run playtest/fix/D1/verify2/sound, cases w6-1, w2-1, w5-6, w3-6, personas perfect, learner.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `petal-visible` "petal" clips with their petal visible as they start | 100 % | 307 of 307 | pass |
| `petal-for-hidden` "hidden" clips with a petal of their sound visible | 0 % | no hidden clips | n/a |
| `unclassified` sounds with no job (§3.1) | 0 | 0 of 541 | pass |
| `talk-without-petal` "You won back…" and two-letter lines with no petal (SD r58, r28) | 0 | 0 of 21 | pass |
| `petal-picture-size` visible badge pictures (non-mini), smallest, at 844×390 | ≥ 38 px (report only) | min 22 px; 10 of 431 clips with one < 38 px | n/a |
| `fs-badges` the tortoise lit as every slow slot starts, the rabbit on the fast word after a fast lead (games with a fast/slow moment) | 100 % | tortoise 20 of 20, rabbit 12 of 12 | pass |
| `fs-rabbit-size` Move 1's live rabbit, grown (stage px) | ≥ 100 stage px | min 112 px in 13 looks | pass |
| `fs-badge-overlap` the nav layer's tortoise or rabbit over ▶, the paw, a petal or the caption | 0 | 0 | pass |

## unclassified

- 0 of them would show no petal once DEFAULT_SHOW is "petal" (plan I.1):

## petal-picture-size

- w5-6 build /th/ after ‹t_this_can_be› ×1 (frames/w5-6-perfect-097-sound-th-petal.png)
- w2-1 find /n/ after ‹tv_thats_write› ×1 = SD r23 (Find's wrong tile)
- w2-1 find /p/ after ‹tv_find_write› ×1 (frames/w2-1-learner-045-sound-p-petal.png)
- w3-6 find /g/ after ‹tv_thats_write› ×1 = SD r23 (Find's wrong tile) (frames/w3-6-learner-059-sound-g-petal.png)
- w3-6 find /z/ after ‹tv_thats_write› ×1 = SD r23 (Find's wrong tile)
- w3-6 find /s/ after ‹tv_now_find› ×1

