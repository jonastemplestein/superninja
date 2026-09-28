# Sound display: --check

Run playtest/runs/fix/V-frames3/sound, cases w1-wu6, w1-wu5, w1-wu1, w1-wu3, reward2, w1-4, w1-6, w1-8, w1-9, w1-14, w1-2, w1-7, w6-br1, w2-1, w5-1, w3-6, w5-6, w6-2, w6-1, tree-free, tree-petal, placement, flower-intro, tree-found, tree-found-th, tree-world, fs-demo, fs-demo-column, tree-victory, trial, personas perfect, learner.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `petal-visible` "petal" clips with their petal visible as they start | 100 % | 612 of 612 | pass |
| `petal-for-hidden` "hidden" clips with a petal of their sound visible | 0 % | 0 of 59 | pass |
| `unclassified` sounds with no job (§3.1) | 0 | 0 of 1405 | pass |
| `talk-without-petal` "You won back…" and two-letter lines with no petal (SD r58, r28) | 0 | 0 of 47 | pass |
| `petal-picture-size` visible badge pictures (non-mini), smallest, at 844×390 | ≥ 38 px (report only) | min 22 px; 32 of 911 clips with one < 38 px | n/a |
| `fs-badges` the tortoise lit as every slow slot starts, the rabbit on the fast word after a fast lead (games with a fast/slow moment) | 100 % | tortoise 120 of 120, rabbit 49 of 49 | pass |
| `fs-rabbit-size` Move 1's live rabbit, grown (stage px) | ≥ 100 stage px | min 112 px in 136 looks | pass |
| `fs-badge-overlap` the nav layer's tortoise or rabbit over ▶, the paw, a petal or the caption | 0 | 0 | pass |

## unclassified

- 0 of them would show no petal once DEFAULT_SHOW is "petal" (plan I.1):

## petal-picture-size

- w1-6 battle /a/ after ‹tv_first_is› ×2 (frames/w1-6-perfect-001-sound-a-petal.png)
- tree-victory tree ‹t_another_way› ×2 (frames/tree-victory-perfect-002-talk-ae-petal.png)
- trial tree ‹t_another_way› ×2 (frames/trial-perfect-038-talk-ae-petal.png)
- w1-8 swap /s/ after ‹tv_swap_in› ×1 (frames/w1-8-perfect-010-sound-s-petal.png)
- w1-7 build /i/ after ‹tv_next_build› ×1 (frames/w1-7-perfect-021-sound-i-petal.png)
- w2-1 find /g/ after ‹tv_find_write› ×1 (frames/w2-1-perfect-040-sound-g-petal.png)

