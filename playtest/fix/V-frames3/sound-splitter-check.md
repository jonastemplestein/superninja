# Sound display: --check

Run playtest/runs/fix/V-frames3/sound-splitter, cases w6-br1, w6-2, w6-1, w2-1, w5-1, w5-6, w3-6, trial, personas splitter.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `petal-visible` "petal" clips with their petal visible as they start | 100 % | 204 of 204 | pass |
| `petal-for-hidden` "hidden" clips with a petal of their sound visible | 0 % | no hidden clips | n/a |
| `unclassified` sounds with no job (§3.1) | 0 | 0 of 432 | pass |
| `talk-without-petal` "You won back…" and two-letter lines with no petal (SD r58, r28) | 0 | 0 of 20 | pass |
| `petal-picture-size` visible badge pictures (non-mini), smallest, at 844×390 | ≥ 38 px (report only) | min 22 px; 12 of 324 clips with one < 38 px | n/a |
| `split-petal` the splitter's corrections: every sound and two-letter line after a split with its petal | 100 % | 4 of 4 splits (4 with a two-letter line; 0 with neither a sound nor the line after them) | pass |
| `fs-badges` the tortoise lit as every slow slot starts, the rabbit on the fast word after a fast lead (games with a fast/slow moment) | 100 % | tortoise 15 of 15, rabbit 10 of 10 | pass |
| `fs-rabbit-size` Move 1's live rabbit, grown (stage px) | ≥ 100 stage px | min 112 px in 30 looks | pass |
| `fs-badge-overlap` the nav layer's tortoise or rabbit over ▶, the paw, a petal or the caption | 0 | 0 | pass |

## unclassified

- 0 of them would show no petal once DEFAULT_SHOW is "petal" (plan I.1):

## petal-picture-size

- w6-1 build /a/ after ‹thats› ×2 (frames/w6-1-splitter-036-sound-a-petal.png)
- w6-1 build /ae/ after ‹we_need› ×2 (frames/w6-1-splitter-037-sound-ae-petal.png)
- w5-1 find /ch/ after ‹tv_which_write› ×1
- w5-1 find /dh/ after ‹tv_now_find› ×1 (frames/w5-1-splitter-045-sound-dh-petal.png)
- w5-1 build /s/ after ‹thats› ×1 (frames/w5-1-splitter-053-sound-s-petal.png)
- w5-1 build /sh/ after ‹we_need› ×1 (frames/w5-1-splitter-054-sound-sh-petal.png)

