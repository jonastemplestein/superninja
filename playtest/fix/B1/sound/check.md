# Sound display: --check

Run playtest/runs/fix/B1/sound-final, cases w1-2, reward2, w6-1, w2-1, personas perfect, learner.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `petal-visible` "petal" clips with their petal visible as they start | 100 % | 156 of 156 | pass |
| `petal-for-hidden` "hidden" clips with a petal of their sound visible | 0 % | no hidden clips | n/a |
| `unclassified` sounds with no job (§3.1) | 0 | 0 of 285 | pass |
| `talk-without-petal` "You won back…" and two-letter lines with no petal (SD r58, r28) | 0 | 0 of 10 | pass |
| `petal-picture-size` visible badge pictures (non-mini), smallest, at 844×390 | ≥ 38 px (report only) | min 24 px; 10 of 240 clips with one < 38 px | n/a |
| `fs-badges` the tortoise lit as every slow slot starts, the rabbit on the fast word after a fast lead (games with a fast/slow moment) | 100 % | tortoise 13 of 13, rabbit 7 of 7 | pass |
| `fs-rabbit-size` Move 1's live rabbit, grown (stage px) | ≥ 100 stage px | min 112 px in 4 looks | pass |
| `fs-badge-overlap` the nav layer's tortoise or rabbit over ▶, the paw, a petal or the caption | 0 | 0 | pass |

## unclassified

- 0 of them would show no petal once DEFAULT_SHOW is "petal" (plan I.1):

## petal-picture-size

- w6-1 learn ‹tv_learn_next› ×2 (frames/w6-1-perfect-013-talk-ae-petal.png)
- w2-1 learn ‹tv_learn_next› ×2 (frames/w2-1-perfect-012-talk-b-petal.png)
- w2-1 learn ‹tv_learn_another› ×2 (frames/w2-1-perfect-020-talk-b-petal.png)
- w1-2 pick /m/ after ‹tv_thats_write› ×1
- w2-1 learn ‹tv_learn_first› ×1 (frames/w2-1-learner-002-talk-b-petal.png)
- w2-1 learn ‹tv_learn_last› ×1 (frames/w2-1-learner-027-talk-b-petal.png)

