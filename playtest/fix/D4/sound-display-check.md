# Sound display: --check

Run playtest/runs/fix/D4/r8/sound, cases w6-2, w6-br1, personas perfect, learner.

| Metric | Target | Value | Verdict |
|---|---|---|---|
| `petal-visible` "petal" clips with their petal visible as they start | 100 % | 8 of 8 | pass |
| `petal-for-hidden` "hidden" clips with a petal of their sound visible | 0 % | no hidden clips | n/a |
| `unclassified` sounds with no job (§3.1) | 0 | 0 of 115 | pass |
| `talk-without-petal` "You won back…" and two-letter lines with no petal (SD r58, r28) | 0 | 0 of 4 | pass |
| `petal-picture-size` visible badge pictures (non-mini), smallest, at 844×390 | ≥ 38 px (report only) | min 39 px; 0 of 139 clips with one < 38 px | n/a |
| `fs-badges` the tortoise lit as every slow slot starts, the rabbit on the fast word after a fast lead (games with a fast/slow moment) | 100 % | no slow slots | n/a |
| `fs-rabbit-size` Move 1's live rabbit, grown (stage px) | ≥ 100 stage px | never live | n/a |
| `fs-badge-overlap` the nav layer's tortoise or rabbit over ▶, the paw, a petal or the caption | 0 | 0 | pass |

## unclassified

- 0 of them would show no petal once DEFAULT_SHOW is "petal" (plan I.1):

