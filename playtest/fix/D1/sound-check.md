# Sound display: --check

Run playtest/runs/fix/D1/sound3, cases w6-1, w2-1, w5-1, w5-6, w3-6, personas perfect, learner.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `petal-visible` "petal" clips with their petal visible as they start | 100 % | 370 of 370 | pass |
| `petal-for-hidden` "hidden" clips with a petal of their sound visible | 0 % | no hidden clips | n/a |
| `unclassified` sounds with no job (§3.1) | 0 | 0 of 680 | pass |
| `talk-without-petal` "You won back…" and two-letter lines with no petal (SD r58, r28) | 0 | 0 of 27 | pass |
| `petal-picture-size` visible badge pictures (non-mini), smallest, at 844×390 | ≥ 38 px (report only) | min 22 px; 32 of 528 clips with one < 38 px | n/a |
| `fs-badges` the tortoise lit as every slow slot starts, the rabbit on the fast word after a fast lead (games with a fast/slow moment) | 100 % | tortoise 25 of 25, rabbit 15 of 15 | pass |
| `fs-rabbit-size` Move 1's live rabbit, grown (stage px) | ≥ 100 stage px | min 112 px in 9 looks | pass |
| `fs-badge-overlap` the nav layer's tortoise or rabbit over ▶, the paw, a petal or the caption | 0 | 0 | pass |

## unclassified

- 0 of them would show no petal once DEFAULT_SHOW is "petal" (plan I.1):

## petal-picture-size

- w3-6 learn ‹tv_learn_another› ×4 = SD r19 (< x >: /k/ + /s/) (frames/w3-6-perfect-022-talk-s-petal.png)
- w2-1 learn ‹tv_learn_another› ×2 (frames/w2-1-perfect-021-talk-b-petal.png)
- w2-1 learn ‹tv_learn_last› ×2 (frames/w2-1-perfect-028-talk-b-petal.png)
- w3-6 learn ‹tv_learn_next› ×2 = SD r19 (< x >: /k/ + /s/)
- w3-6 learn ‹tv_learn_last› ×2 = SD r19 (< x >: /k/ + /s/) (frames/w3-6-perfect-048-talk-s-petal.png)
- w2-1 learn ‹tv_learn_first› ×1 (frames/w2-1-perfect-002-talk-b-petal.png)

