# Sound display: --check

Run playtest/runs/fix/D3/r8/sound, cases w1-8, personas perfect, learner.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `petal-visible` "petal" clips with their petal visible as they start | 100 % | 8 of 8 | pass |
| `petal-for-hidden` "hidden" clips with a petal of their sound visible | 0 % | no hidden clips | n/a |
| `unclassified` sounds with no job (§3.1) | 0 | 0 of 50 | pass |
| `talk-without-petal` "You won back…" and two-letter lines with no petal (SD r58, r28) | 0 | 0 of 0 | n/a |
| `petal-picture-size` visible badge pictures (non-mini), smallest, at 844×390 | ≥ 38 px (report only) | min 29 px; 8 of 17 clips with one < 38 px | n/a |
| `fs-badges` the tortoise lit as every slow slot starts, the rabbit on the fast word after a fast lead (games with a fast/slow moment) | 100 % | tortoise 26 of 26, rabbit 2 of 2 | pass |
| `fs-rabbit-size` Move 1's live rabbit, grown (stage px) | ≥ 100 stage px | min 112 px in 2 looks | pass |
| `fs-badge-overlap` the nav layer's tortoise or rabbit over ▶, the paw, a petal or the caption | 0 | 0 | pass |

## unclassified

- 0 of them would show no petal once DEFAULT_SHOW is "petal" (plan I.1):

## petal-picture-size

- w1-8 swap /m/ after ‹tv_swap_kick› ×2 (frames/w1-8-perfect-009-sound-m-petal.png)
- w1-8 swap /a/ after ‹thats› ×2
- w1-8 swap /t/ after ‹tv_swap_in› ×1 (frames/w1-8-perfect-013-sound-t-NONE.png)
- w1-8 swap /s/ after ‹tv_swap_in› ×1 (frames/w1-8-learner-010-sound-s-petal.png)
- w1-8 swap /s/ after ‹thats› ×1 (frames/w1-8-learner-022-sound-s-petal.png)
- w1-8 swap /t/ after ‹thats› ×1

