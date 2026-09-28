# Sound display: --check

Run playtest/runs/fix/C2/sound, cases w1-wu6, w1-wu5, w1-wu1, w1-wu2, w1-wu3, personas perfect, learner.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `petal-visible` "petal" clips with their petal visible as they start | 100 % | 60 of 60 | pass |
| `petal-for-hidden` "hidden" clips with a petal of their sound visible | 0 % | 0 of 27 | pass |
| `unclassified` sounds with no job (§3.1) | 0 | 0 of 87 | pass |
| `talk-without-petal` "You won back…" and two-letter lines with no petal (SD r58, r28) | 0 | 0 of 0 | n/a |
| `petal-picture-size` visible badge pictures (non-mini), smallest, at 844×390 | ≥ 38 px (report only) | min 39 px; 0 of 50 clips with one < 38 px | n/a |
| `fs-badges` the tortoise lit as every slow slot starts, the rabbit on the fast word after a fast lead (games with a fast/slow moment) | 100 % | tortoise 26 of 26, rabbit 10 of 10 | pass |
| `fs-rabbit-size` Move 1's live rabbit, grown (stage px) | ≥ 100 stage px | min 128 px in 3 looks | pass |
| `fs-badge-overlap` the nav layer's tortoise or rabbit over ▶, the paw, a petal or the caption | 0 | 0 | pass |

## unclassified

- 0 of them would show no petal once DEFAULT_SHOW is "petal" (plan I.1):

