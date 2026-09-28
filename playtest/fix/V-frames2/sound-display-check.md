# Sound display: --check

Run playtest/runs/fix/V-frames2/sound, cases w1-wu6, w1-wu5, w1-wu1, w1-wu3, reward2, w1-6, w1-4, w1-2, w1-9, w1-8, w1-14, w1-7, w6-br1, w2-1, w3-6, w6-1, w5-6, w5-1, w6-2, tree-free, tree-petal, placement, flower-intro, tree-found, tree-found-th, tree-world, fs-demo, fs-demo-column, tree-victory, trial, personas perfect, learner.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `petal-visible` "petal" clips with their petal visible as they start | 100 % | 544 of 544 | pass |
| `petal-for-hidden` "hidden" clips with a petal of their sound visible | 0 % | 0 of 54 | pass |
| `unclassified` sounds with no job (§3.1) | 0 | 0 of 1353 | pass |
| `talk-without-petal` "You won back…" and two-letter lines with no petal (SD r58, r28) | 0 | 0 of 47 | pass |
| `petal-picture-size` visible badge pictures (non-mini), smallest, at 844×390 | ≥ 38 px (report only) | min 22 px; 88 of 912 clips with one < 38 px | n/a |
| `fs-badges` the tortoise lit as every slow slot starts, the rabbit on the fast word after a fast lead (games with a fast/slow moment) | 100 % | tortoise 119 of 119, rabbit 53 of 53 | pass |
| `fs-rabbit-size` Move 1's live rabbit, grown (stage px) | ≥ 100 stage px | min 112 px in 136 looks | pass |
| `fs-badge-overlap` the nav layer's tortoise or rabbit over ▶, the paw, a petal or the caption | 0 | 0 | pass |

## unclassified

- 0 of them would show no petal once DEFAULT_SHOW is "petal" (plan I.1):

## petal-picture-size

- w3-6 learn ‹tv_next_sound_known› ×4 = SD r19 (< x >: /k/ + /s/) (frames/w3-6-perfect-023-talk-s-petal.png)
- w3-6 learn ‹tv_here_sound› ×4 = SD r19 (< x >: /k/ + /s/) (frames/w3-6-perfect-034-talk-s-petal.png)
- w5-6 learn ‹tv_here_sound› ×4 (frames/w5-6-perfect-002-talk-w-petal.png)
- w5-6 learn ‹tv_next_sound_known› ×4 (frames/w5-6-perfect-014-talk-k-petal.png)
- w1-8 swap /m/ after ‹tv_swap_kick› ×2 (frames/w1-8-perfect-009-sound-m-petal.png)
- w2-1 learn ‹tv_learn_first› ×2 (frames/w2-1-perfect-002-talk-b-petal.png)

