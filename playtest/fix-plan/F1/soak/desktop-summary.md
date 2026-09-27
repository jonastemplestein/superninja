# Soak after-core-desktop

20 levels in one page (reloads: none), fast=2, desktop 844×390, served none from http://127.0.0.1:4401. Longest streak: 74. Page errors: 0.

## Budgets: **FAIL** (1: animHiddenInfinite)

docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §11.1 and docs/PERF.md §5. "n/a": not judged on this run (the phone rows are judged only with --mobile --cpu 4; their desktop values are shown). Owners are the fix plan's lanes; an offending animation names the file that defines it.

| result | when | check | budget | measured | owner |
|---|---|---|---|---|---|
| pass | after each level, back on the map (GC'd) | DOM nodes (CDP, attached + detached) | ≤ start + 600 (765) | start 165, worst 362 (after w1-14) | all |
| pass | after each level, back on the map (GC'd) | JS heap, MB | ≤ start + 8 (11.7) | start 3.7, worst 9.9 (after w2-4) | all |
| pass | after each level, back on the map (GC'd) | event listeners | ≤ start + 40 (289) | start 249, worst 277 (after w1-9) | all |
| pass | after each level, back on the map (GC'd) | animations on the map | ≤ start + 5 (34) | start 29, worst 30 (after w1-5) | all |
| pass | after each level, back on the map (GC'd) | live intervals | ≤ start + 1 (2) | start 1, worst 1 (after start) | all |
| pass | after each level, back on the map (GC'd) | particles on the canvas | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | nodes in the fx layer | ≤ 0 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | rAF requests/s on the still map | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | live decoded audio, MB | ≤ 64 | start 0.9, worst 40 (after w2-4) | F1, B1 |
| pass | after each level, back on the map (GC'd) | Web Audio nodes (AudioHandlers) | ≤ start + 8 (19) | start 11, worst 11 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | &lt;audio> elements alive | ≤ start + 2 (4) | start 2, worst 2 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | window.__snNavLog entries | ≤ 500 | start 0, worst 108 (after w2-6) | F3 |
| pass | after each level, back on the map (GC'd) | the save's adjustLog entries | ≤ 200 | start 0, worst 0 (after start) | F1 |
| pass | on the title, untouched for 5 s | live decoded audio, MB | ≤ 2 | 0.1 MB in 1 clip | B1 |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations the compositor can't run | ≤ 2 | max 0; over in 0 of 108 samples | F1, B, C, D (by file) |
| **FAIL** | while playing, and on still screens (title, map, a held Next), every sample | endless animations running on hidden elements | ≤ 2 | max 4; over in 3 of 108 samples<br>wave ×3 (src/styles.css), gem-slosh ×3 (src/styles.css), bt-orbit ×3 (src/styles/battle.css). On level:w2-2, reward:w2-3, level:w2-6 | F1, D2 (by file) |
| pass | the still map, 60 s untouched | rAF requests/s, median | ≤ 5 | 0 (max 0); main thread 0.5 % (desktop) | F1, B1 |
| pass | a held Next (a reward), 40 s untouched, the idle nudge included | rAF requests/s, median | ≤ 5 | 3.2 (max 11.8); main thread 1.3 % (desktop) | F1, F3 (nav.tsx), B1 |
| n/a | phone ×4, while playing | every screen's median fps | ≥ 50 | lowest reward:w2-5 (60.1) (not judged: desktop) | D5 (the runner); otherwise the screen's owner |
| n/a | phone ×4, the still map | main thread %, median | ≤ 5 % | 0.5 % (not judged: desktop) | F1 |
| n/a | phone ×4, a held Next (a reward), the idle nudge included | main thread %, median | ≤ 6 % | 1.3 % (1.6, 1.4, 1.1, 1.1) (not judged: desktop) | F1 (the ninja), F3 (the nudge), B1 (the reward) |
| n/a | phone ×4, the ninja standing still | main thread % at streak 0, mean | ≤ 6 % | 1 % (1.4, 0.5) (not judged: desktop) | F1 |
| n/a | phone ×4, the ninja standing still | main thread % at streak 10, mean | ≤ 14 % | 1.5 % (1.9, 1.1) (not judged: desktop) | F1 |
| n/a | phone ×4, the World Flower | main thread %, median | ≤ 30 % | 7.9 % over 9 samples (6.8, 8.3, 6.9, 7.9, 7.8, 5.6, 8.5, 10.7, 10.6) (not judged: desktop) | B2 |
| n/a | phone ×4, the World Flower | longest task, ms | ≤ 120 ms | 0 ms (not judged: desktop) | B2 |
| pass | the strike stress (150 streak-10 strikes, 7 a second) | particles at the peak | ≤ 350 | 305 (fx nodes 86) | F1 |
| pass | 10 s after the stress | particles / fx nodes left | 0 / 0 | 0 / 0 | F1 |
| pass | the whole soak | page reloads | 0 | 0 | all |
| pass | the whole soak | levels the bot finished | all | 20 of 20 | the scene's owner (or bot.ts) |

## After each level (on the map, after a forced GC)

| metric | start | per level → | last | slope / level | budget |
|---|---|---|---|---|---|
| heapMB | 3.7 | 3.7 6.6 7 7.4 7.7 7.9 8 8.3 8.8 8.9 8.9 9 9.1 9.3 9.3 9.6 9.6 9.8 9.9 9.9 9.9 | 9.9 | 0.21 | ok (≤ start + 8 (11.7)) |
| nodes | 165 | 165 188 206 219 231 241 251 261 312 322 332 342 352 362 202 212 222 254 264 274 284 | 284 | 3.48 | ok (≤ start + 600 (765)) |
| detachedNodes | 9 | 9 22 30 33 33 33 33 33 74 74 74 74 74 74 73 73 73 95 95 95 95 | 95 | 4.15 |  |
| attachedNodes | 156 | 156 166 176 186 198 208 218 228 238 248 258 268 278 288 129 139 149 159 169 179 189 | 189 | -0.67 |  |
| listeners | 249 | 249 275 275 275 275 275 275 275 277 277 277 277 277 277 238 238 238 238 238 238 238 | 238 | -2.01 | ok (≤ start + 40 (289)) |
| globalListeners | 17 | 17 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 | 30 | 0.17 |  |
| animations | 29 | 29 29 29 29 30 30 30 30 30 30 30 30 30 30 16 16 16 16 16 16 16 | 16 | -0.85 | ok (≤ start + 5 (34)) |
| animInfinite | 9 | 9 9 9 9 10 10 10 10 10 10 10 10 10 10 7 7 7 7 7 7 7 | 7 | -0.15 |  |
| animHiddenInfinite | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| animMainThreadInfinite | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| fxDomNodes | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 0) |
| particles | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| rafPerSec | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| intervals | 1 | 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 | 1 | 0 | ok (≤ start + 1 (2)) |
| pendingTimeouts | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mediaAlive | 2 | 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 | 2 | 0 | ok (≤ start + 2 (4)) |
| decodedMB | 0.9 | 0.9 15.2 20.4 30.6 33.1 35.6 39.8 39.3 39.9 39.9 39.7 39.9 39.2 39.7 39.8 39.8 39.9 39.4 40 39.8 39.2 | 39.2 | 1.15 | ok (≤ 64) |
| decodedTotalMB | 0.9 | 0.9 15.2 20.4 30.6 33.1 35.6 42 47.3 49.9 58.8 64.4 68.6 70.8 81.6 94.6 102.6 105.9 109.6 112.4 117.7 118.1 | 118.1 | 5.87 |  |
| decodedClips | 2 | 2 47 68 94 102 107 122 118 115 125 129 135 137 119 107 104 105 112 122 123 126 | 126 | 3.22 |  |
| audioHandlers | 11 | 11 11 11 11 11 11 11 11 11 11 11 11 11 11 11 11 11 11 11 11 11 | 11 | 0 | ok (≤ start + 8 (19)) |
| arrayBuffers | 4 | 4 49 70 96 104 109 124 120 117 127 131 137 139 121 109 106 107 114 124 125 128 | 128 | 3.22 |  |
| layoutObjects | 116 | 116 132 142 155 168 178 188 198 208 218 228 238 248 258 97 107 117 127 137 147 157 | 157 | -0.57 |  |
| navLog | 0 | 0 9 18 22 23 24 31 32 33 42 49 50 51 67 78 91 92 93 106 107 108 | 108 | 5.52 | ok (≤ 500) |
| adjustLog | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 200) |
| imagesFetched | 54 | 54 75 86 86 86 86 90 92 95 104 108 108 108 115 127 134 137 142 149 153 153 | 153 | 4.39 |  |
| audioFetched | 3 | 3 50 71 97 105 111 133 146 152 176 195 208 212 230 249 269 275 279 293 300 304 | 304 | 14.27 |  |
| imgInDomMB | 22.5 | 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 15.6 15.6 15.6 15.6 15.6 15.6 15.6 | 15.6 | -0.44 |  |
| rendererRssMB | 452 | 452 805 935 982 1039 1072 1137 1164 1215 1237 1260 1257 1274 1291 1329 1366 1362 1380 1409 1413 1410 | 1410 | 34.19 |  |
| gpuRssMB | 79 | 79 93 95 105 105 105 106 105 106 107 106 106 106 106 108 111 110 110 110 111 110 | 110 | 0.91 |  |
| footprintMB | 82.9 | 82.9 164.4 212.3 253.4 304.7 338.8 392.2 421.6 426.8 441.1 446.7 467.4 466.9 464.2 486.2 503.2 503.8 495.8 524 523.3 526.7 | 526.7 | 18.81 |  |
| gpuFootprintMB | 14.3 | 14.3 14.9 15.5 14.7 14.8 14.7 15 15.3 14.9 15.2 14.8 15.3 15.3 15.8 14.6 15.9 16.3 16.4 15.9 16.5 16 | 16 | 0.08 |  |
| mem_blink_gc | 5.2 | 5.2 16 22.1 27.8 32.7 35.3 38 42.6 43.3 48.8 52.3 61.1 62.2 62.7 66.4 71.9 75.5 75.3 80.2 84.4 86.1 | 86.1 | 3.75 |  |
| mem_blink_objects | 1.6 | 1.6 2.3 2.6 3.1 3.7 3.6 3.5 3.9 3.9 4 4.2 4.9 5 5.1 4.5 4.7 5.1 4.9 5.1 5.5 5.5 | 5.5 | 0.16 |  |
| mem_canvas | 3.5 | 3.5 3.6 3.8 3.8 3.8 3.8 3.8 3.8 3.8 3.8 3.8 3.8 3.8 3.8 3.8 3.8 3.8 3.8 3.8 3.8 3.8 | 3.8 | 0.01 |  |
| mem_cc | 214.3 | 214.3 474.3 530 511.9 516 507.7 516.5 486.2 475.2 503.7 483.2 468.4 469.4 474.5 497.1 517 497.4 498.8 505.2 484.9 492.2 | 492.2 | 3.06 |  |
| mem_discardable | 215.8 | 215.8 450.6 516.9 509.1 511.1 510.2 516.8 505.4 513 511.4 511.1 491.5 498.3 496.8 511.2 516 505.3 514.2 511.3 505.5 501.1 | 501.1 | 4.2 |  |
| mem_malloc | 43.4 | 43.4 55.7 63 59 60.2 64.3 71.2 68.6 69.1 68.9 70.9 72.2 71.8 63.1 67.8 73.4 72.5 70.4 75.7 73.7 76.6 | 76.6 | 1 |  |
| mem_media | 2.4 | 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 | 2.4 | 0 |  |
| mem_mojo | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_images | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_strings | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_partition_alloc | 30.2 | 30.2 83.4 128.9 171.7 221.5 250 297.7 324 328.9 344.2 349.6 366.9 371.7 380.3 392.5 404.8 411.5 407.2 427.9 432 433 | 433 | 17.89 |  |
| mem_shared_memory | 250.9 | 250.9 499.5 567.1 545.7 547.8 547.5 560.8 542 549.2 559.9 557.9 528.6 535 535.5 551.1 561.1 537 549.6 549.5 541.5 537.1 | 537.1 | 3.91 |  |
| mem_site_storage | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_skia | 0.3 | 0.3 3.4 4.8 4.5 3.9 4.1 4.8 11.3 10.6 11.4 11.2 17.5 15.2 14.1 11 9.5 8.3 4.2 3.4 8.5 8.7 | 8.7 | 0.28 |  |
| mem_v8 | 6 | 6 9.1 9.8 10.1 10.5 10.8 11 11.1 11.7 11.9 12 12.1 12.5 12.3 12.5 12.9 12.6 13.1 13.2 13.3 13.2 | 13.2 | 0.25 |  |
| mem_web_cache | 1.1 | 1.1 1.1 1.1 1.1 1.1 1.1 1.1 1.1 2.2 1.7 1.7 1.7 1.7 1.5 1.2 1.2 1.2 2.3 1.7 1.7 1.7 | 1.7 | 0.03 |  |

## While playing (periodic samples): first half vs second half

| metric | first half | second half |
|---|---|---|
| fps | 60.6 | 60.6 |
| slowFramePct | 0 | 0 |
| mainThreadPct | 5.7 | 7.4 |
| scriptPct | 0.6 | 0.7 |
| stylePct | 0.8 | 1 |
| layoutPct | 0.1 | 0.1 |
| recalcPerSec | 64.5 | 67.5 |
| layoutPerSec | 9.5 | 15.2 |
| rendererPct | 13.3 | 18.6 |
| gpuPct | 14.6 | 16 |
| longTaskMs | 0 | 0 |
| rafPerSec | 80.7 | 92.6 |
| rafPerFrame | 1.2 | 1.3 |
| animHiddenInfinite | 0.1 | 0.3 |
| animMainThreadInfinite | 0 | 0 |
| animations | 61.8 | 79.6 |
| animInfinite | 48.7 | 60.7 |
| particles | 10.4 | 26.2 |
| particlesPeak | 114.2 | 151.9 |

## Phases (the title, the still map, a held Next, the ninja's aura, the strike stress)

| phase | what | fps | main % | style % | recalcs/s | rAF/s | renderer CPU % | GPU CPU % | particles (now / peak) | fx nodes | animations | decoded MB | Nodes | heap MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| title | the title, 5 s, untouched | 60.6 | 0.4 | 0.1 | 20.4 | 0 | 2 | 10 | 0 / 0 | 0 | 19 (17 inf, 0 main) | 0.1 | 89 | 3.5 |
| idle-map | map | 61 | 0.6 | 0.2 | 21.9 | 0 | 4 | 9 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 39.2 | 284 | 9.9 |
| idle-map | map | 60.8 | 0.5 | 0.2 | 21.4 | 0 | 3 | 9 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 39.2 | 284 | 10 |
| idle-map | map | 60.6 | 0.5 | 0.1 | 20.2 | 0 | 3 | 8 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 39.2 | 284 | 10.1 |
| idle-map | map | 60.9 | 0.5 | 0.2 | 21.4 | 0 | 3 | 8 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 39.2 | 284 | 10.2 |
| idle-map | map | 60.6 | 0.5 | 0.2 | 21.6 | 0 | 3 | 7 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 39.2 | 284 | 10.3 |
| idle-map | map | 60.6 | 0.4 | 0.1 | 22.4 | 0 | 3 | 6 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 39.2 | 284 | 10.4 |
| settled | after soak | 60.7 | 0.4 | 0.1 | 18.4 | 0 | 3 | 6 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 39.2 | 284 | 9.9 |
| settled | the reward (w2-6), Next ready | 60.4 | 3.2 | 0.8 | 61.3 | 0 | 7 | 7 | 0 / 0 | 0 | 20 (11 inf, 0 main) | 39.2 | 334 | 10 |
| idle-next | the reward (w2-6), a held Next, untouched | 60.8 | 1.6 | 0.4 | 30.2 | 11.8 | 5 | 8 | 0 / 59 | 0 | 22 (12 inf, 0 main) | 39.4 | 347 | 10 |
| idle-next | the reward (w2-6), a held Next, untouched | 60.7 | 1.4 | 0.4 | 29.4 | 6.4 | 5 | 8 | 0 / 0 | 0 | 20 (12 inf, 0 main) | 39.4 | 337 | 9.9 |
| idle-next | the reward (w2-6), a held Next, untouched | 60.7 | 1.1 | 0.3 | 24.9 | 0 | 4 | 8 | 0 / 0 | 0 | 20 (12 inf, 0 main) | 39.4 | 337 | 9.9 |
| idle-next | the reward (w2-6), a held Next, untouched | 60.8 | 1.1 | 0.3 | 24.6 | 0 | 4 | 8 | 0 / 0 | 0 | 20 (12 inf, 0 main) | 39.4 | 337 | 9.9 |
| aura-t0 | ninja demo, streak 0, idle | 60.2 | 1.4 | 0.3 | 32.3 | 11.6 | 6 | 9 | 0 / 0 | 0 | 4 (3 inf, 0 main) | 39.5 | 469 | 10.3 |
| aura-t0 | ninja demo, streak 0, idle | 60.7 | 0.5 | 0.1 | 25.2 | 0 | 3 | 7 | 0 / 0 | 0 | 4 (3 inf, 0 main) | 39.5 | 469 | 10.4 |
| aura-t3 | ninja demo, streak 10, idle | 60.8 | 1.9 | 0.5 | 33.8 | 14.7 | 7 | 11 | 0 / 99 | 0 | 60 (49 inf, 0 main) | 39.5 | 325 | 10 |
| aura-t3 | ninja demo, streak 10, idle | 60.7 | 1.1 | 0.4 | 24.6 | 0 | 5 | 10 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 39.5 | 325 | 10 |
| settled | before stress | 60.6 | 1.1 | 0.4 | 21.9 | 0 | 5 | 11 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 39.5 | 325 | 10.2 |
| stress | strike 1/150 | 60.6 | 3.2 | 0.9 | 61 | 0 | 7 | 10 | 0 / 0 | 0 | 63 (49 inf, 0 main) | 39.5 | 373 | 10.5 |
| stress | strike 71/150 | 61.1 | 18.9 | 1.8 | 119.7 | 206.2 | 53 | 22 | 204 / 293 | 34 | 71 (49 inf, 0 main) | 39.5 | 580 | 11.9 |
| stress | strike 141/150 | 60.7 | 19.5 | 1.8 | 116.1 | 199.8 | 54 | 22 | 221 / 297 | 45 | 81 (55 inf, 0 main) | 39.5 | 565 | 11.2 |
| stress | last strike | 61 | 14.4 | 1.6 | 99.6 | 140.4 | 40 | 19 | 215 / 277 | 39 | 77 (55 inf, 0 main) | 39.5 | 597 | 11.7 |
| settled | 10 s after the stress | 60.9 | 1.1 | 0.5 | 20.9 | 0 | 5 | 14 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 39.5 | 325 | 10.2 |
| settled | map after the stress | 60.5 | 0.6 | 0.2 | 20.8 | 0 | 4 | 12 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.5 | 394 | 10 |

## Levels

| level | kind | secs | finished | max streak | streak at end | stuck |
|---|---|---|---|---|---|---|
| w1-2 | firstsound | 68 | yes | 8 | 8 |  |
| w1-3 | firstsound | 57 | yes | 16 | 16 |  |
| w1-4 | dojo | 63 | yes | 23 | 23 |  |
| w1-5 | dojo | 94 | yes | 25 | 13 |  |
| w1-6 | battle | 28 | yes | 23 | 23 |  |
| w1-7 | soundhunt | 78 | yes | 30 | 30 |  |
| w1-8 | swap | 56 | yes | 36 | 5 |  |
| w1-9 | run | 50 | yes | 11 | 11 |  |
| w1-10 | firstsound | 95 | yes | 24 | 24 |  |
| w1-11 | soundhunt | 82 | yes | 32 | 32 |  |
| w1-12 | swap | 97 | yes | 58 | 58 |  |
| w1-13 | battle | 26 | yes | 69 | 69 |  |
| w1-14 | story | 31 | yes | 71 | 71 |  |
| w1-15 | boss | 70 | yes | 74 | 16 |  |
| w2-1 | dojo | 60 | yes | 35 | 35 |  |
| w2-2 | battle | 27 | yes | 41 | 2 |  |
| w2-3 | run | 49 | yes | 8 | 8 |  |
| w2-4 | dojo | 68 | yes | 16 | 16 |  |
| w2-5 | swap | 38 | yes | 26 | 26 |  |
| w2-6 | battle | 27 | yes | 38 | 38 |  |

## Last boundary: what is still running

```
{
 "animations": {
  "total": 16,
  "running": 7,
  "infinite": 7,
  "hiddenInfinite": 0,
  "mainThreadInfinite": 0,
  "finishedKept": 9,
  "top": [
   [
    "@popin",
    8
   ],
   [
    "@drift",
    6
   ],
   [
    "@pulse",
    1
   ],
   [
    "@fadeout",
    1
   ]
  ],
  "mainThread": {},
  "hidden": {}
 },
 "globalListeners": {
  "window:pointerdown:capture": 2,
  "window:keydown:capture": 1,
  "document:visibilitychange": 2,
  "window:pagehide": 2,
  "document:gesturestart": 1,
  "document:gesturechange": 1,
  "document:contextmenu": 1,
  "document:dragstart": 1,
  "document:selectstart": 1,
  "document:touchmove": 1,
  "document:selectionchange": 1,
  "window:load": 1,
  "window:beforeinstallprompt": 1,
  "window:resize": 1,
  "window:orientationchange": 1,
  "window:__playwright_global_listeners_check__": 1,
  "window:mousemove:capture": 1,
  "window:pointerup:capture": 1,
  "window:touchstart:capture": 1,
  "window:touchend:capture": 1,
  "window:touchcancel:capture": 1,
  "window:mousedown:capture": 1,
  "window:mouseup:capture": 1,
  "window:click:capture": 1,
  "window:auxclick:capture": 1,
  "window:dblclick:capture": 1,
  "window:contextmenu:capture": 1
 },
 "intervals": {
  "100ms at http://127.0.0.1:4401/assets/play-DkLKsdi-.js:1:971": 1
 },
 "mods": {
  "visemeListeners": 1,
  "bufferCache": 126,
  "captionListeners": 3,
  "clipListeners": 0,
  "sayListeners": 1,
  "music": 1,
  "speaking": 0,
  "decodedLruMB": 39.2,
  "musicDecks": 2,
  "storeListeners": 4,
  "attemptSubs": 0,
  "saveBytes": 5355,
  "adjustLog": 0,
  "poseSubs": 1,
  "particles": 0,
  "particleKinds": {},
  "glowCache": 15,
  "helpStack": 1,
  "nudgeListeners": 1,
  "uprightSubs": 1,
  "imgCache": 2,
  "fxDomChildren": 0,
  "streakListeners": 1,
  "streakSubs": 0,
  "streakN": 38,
  "owned": 0,
  "ownedConnected": 0,
  "busy": 0,
  "spotMounted": 0,
  "moveRunning": 0,
  "spotGen": 46,
  "navStack": 1,
  "navSubs": 2,
  "nudgeSubs": 0,
  "holds": 0,
  "narrateSubs": 0
 }
}
```

