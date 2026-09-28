# before-first-visit: /play/?scene=tree&visit=spelling:m>m,s>s (phone 844×390 DPR 3, CPU 4×)

| step | main thread % (while it plays) | longest task ms | fps (1 s in) | at rest: rAF/s | endless animations | on the main thread | on hidden elements |
|---|---|---|---|---|---|---|---|
| flower-intro#0 | 12.3 | 0 | 60 | 0.0 | 1: pulse×1 | 0 | 0 |
| flower-intro#1 | 12.6 | 0 | 60 | 0.0 | 1: pulse×1 | 0 | 0 |
| flower-intro#2 | 11.3 | 0 | 60 | 0.0 | 2: gem-slosh×1, pulse×1 | 0 | 0 |
| flower-intro#3 | 27.2 | 0 | 60 | 0.0 | 2: gem-slosh×1, pulse×1 | 0 | 0 |
| flower-intro#4 | 13.3 | 0 | 60 | 0.0 | 3: gemready×1, glow-pulse×1, pulse×1 | 0 | 0 |
| flower-intro#5 | 27.2 | 0 | 60 | 0.0 | 2: wf-turn×1, pulse×1 | 0 | 0 |
| gem-found#0 | 24.6 | 0 | 60 | 0.0 | 7: gvturn×1, bpfocus×1, dc-glint×3, nj-breathe×1, pulse×1 | 0 | 0 |
| gem-found#1 | 16.6 | 0 | 60 | 0.0 | 7: gvturn×1, bpfocus×1, dc-glint×3, nj-breathe×1, pulse×1 | 0 | 0 |
| gem-found#2 | 18.2 | 0 | 60 | 0.0 | 11: gvturn×1, bpfocus×1, dc-glint×7, nj-breathe×1, pulse×1 | 0 | 0 |

long tasks (ms, all): 544, 50