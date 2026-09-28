# Soak soak-desktop

14 levels in one page (reloads: none), fast=2, desktop 844×390, served prod from http://127.0.0.1:4801 (snapshot built 2026-09-27T05:33:35.982Z). Longest streak: 93. Page errors: 0.

## Budgets: pass

docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §11.1 and docs/PERF.md §5. "n/a": not judged on this run (the phone rows are judged only with --mobile --cpu 4; their desktop values are shown). Owners are the fix plan's lanes; an offending animation names the file that defines it.

| result | when | check | budget | measured | owner |
|---|---|---|---|---|---|
| pass | after each level, back on the map (GC'd) | DOM nodes (CDP, attached + detached) | ≤ start + 600 (766) | start 166, worst 367 (after w1-14) | all |
| pass | after each level, back on the map (GC'd) | JS heap, MB | ≤ start + 8 (12.1) | start 4.1, worst 9.9 (after w1-14) | all |
| pass | after each level, back on the map (GC'd) | event listeners | ≤ start + 40 (289) | start 249, worst 277 (after w1-9) | all |
| pass | after each level, back on the map (GC'd) | animations on the map | ≤ start + 5 (34) | start 29, worst 30 (after w1-6) | all |
| pass | after each level, back on the map (GC'd) | live intervals | ≤ start + 1 (2) | start 1, worst 1 (after start) | all |
| pass | after each level, back on the map (GC'd) | particles on the canvas | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | nodes in the fx layer | ≤ 0 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | rAF requests/s on the still map | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | live decoded audio, MB | ≤ 64 | start 0.9, worst 40 (after w1-7) | F1, B1 |
| pass | after each level, back on the map (GC'd) | Web Audio nodes (AudioHandlers) | ≤ start + 8 (19) | start 11, worst 11 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | &lt;audio> elements alive | ≤ start + 2 (4) | start 2, worst 2 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | window.__snNavLog entries | ≤ 500 | start 0, worst 78 (after w1-15) | F3 |
| pass | after each level, back on the map (GC'd) | the save's adjustLog entries | ≤ 200 | start 0, worst 0 (after start) | F1 |
| pass | on the title, untouched for 5 s | live decoded audio, MB | ≤ 2 | 0.1 MB in 1 clip | B1 |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations the compositor can't run | ≤ 2 | max 0; over in 0 of 81 samples | F1, B, C, D (by file) |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations running on hidden elements | ≤ 2 | max 0; over in 0 of 81 samples | F1, D2 (by file) |
| pass | the still map, 60 s untouched | rAF requests/s, median | ≤ 5 | 0 (max 0); main thread 0.5 % (desktop) | F1, B1 |
| pass | a held Next (a reward), 40 s untouched, the idle nudge included | rAF requests/s, median | ≤ 5 | 4.3 (max 13.8); main thread 1.4 % (desktop) | F1, F3 (nav.tsx), B1 |
| n/a | phone ×4, while playing | every screen's median fps | ≥ 50 | lowest level:w1-15 (60.2) (not judged: desktop) | D5 (the runner); otherwise the screen's owner |
| n/a | phone ×4, the still map | main thread %, median | ≤ 5 % | 0.5 % (not judged: desktop) | F1 |
| n/a | phone ×4, a held Next (a reward), the idle nudge included | main thread %, median | ≤ 6 % | 1.4 % (1.9, 1.6, 1.2, 1.1) (not judged: desktop) | F1 (the ninja), F3 (the nudge), B1 (the reward) |
| n/a | phone ×4, the ninja standing still | main thread % at streak 0, mean | ≤ 6 % | 1.2 % (1.6, 0.7) (not judged: desktop) | F1 |
| n/a | phone ×4, the ninja standing still | main thread % at streak 10, mean | ≤ 14 % | 2.2 % (2.7, 1.6) (not judged: desktop) | F1 |
| n/a | phone ×4, the World Flower | main thread %, median | ≤ 30 % | 9.6 % over 4 samples (10.3, 11.6, 8.8, 8.7) (not judged: desktop) | B2 |
| n/a | phone ×4, the World Flower | longest task, ms | ≤ 120 ms | 0 ms (not judged: desktop) | B2 |
| pass | the strike stress (150 streak-10 strikes, 7 a second) | particles at the peak | ≤ 350 | 288 (fx nodes 89) | F1 |
| pass | 10 s after the stress | particles / fx nodes left | 0 / 0 | 0 / 0 | F1 |
| pass | the whole soak | page reloads | 0 | 0 | all |
| pass | the whole soak | levels the bot finished | all | 14 of 14 | the scene's owner (or bot.ts) |

## After each level (on the map, after a forced GC)

| metric | start | per level → | last | slope / level | budget |
|---|---|---|---|---|---|
| heapMB | 4.1 | 4.1 7.2 7.5 8 8.1 8.5 8.5 8.8 9.4 9.5 9.6 9.7 9.7 9.9 9.9 | 9.9 | 0.29 | ok (≤ start + 8 (12.1)) |
| nodes | 166 | 166 193 211 224 234 246 256 266 317 327 337 347 357 367 207 | 207 | 11.02 | ok (≤ start + 600 (766)) |
| detachedNodes | 9 | 9 26 34 37 37 37 37 37 78 78 78 78 78 78 77 | 77 | 5.06 |  |
| attachedNodes | 157 | 157 167 177 187 197 209 219 229 239 249 259 269 279 289 130 | 130 | 5.95 |  |
| listeners | 249 | 249 275 275 275 275 275 275 275 277 277 277 277 277 277 238 | 238 | -0.12 | ok (≤ start + 40 (289)) |
| globalListeners | 17 | 17 30 30 30 30 30 30 30 30 30 30 30 30 30 30 | 30 | 0.33 |  |
| animations | 29 | 29 29 29 29 29 30 30 30 30 30 30 30 30 30 16 | 16 | -0.26 | ok (≤ start + 5 (34)) |
| animInfinite | 9 | 9 9 9 9 9 10 10 10 10 10 10 10 10 10 7 | 7 | 0.01 |  |
| animHiddenInfinite | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| animMainThreadInfinite | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| fxDomNodes | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 0) |
| particles | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| rafPerSec | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| intervals | 1 | 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 | 1 | 0 | ok (≤ start + 1 (2)) |
| pendingTimeouts | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mediaAlive | 2 | 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 | 2 | 0 | ok (≤ start + 2 (4)) |
| decodedMB | 0.9 | 0.9 16.2 23.1 32.3 34.2 37.7 40 39.9 39.9 39.5 39.8 39.5 39.8 39.7 39.7 | 39.7 | 1.95 | ok (≤ 64) |
| decodedTotalMB | 0.9 | 0.9 16.2 23.1 32.3 34.2 37.7 45.3 50.6 52.7 63.4 68.6 74.4 76.2 86.8 96 | 96 | 6.02 |  |
| decodedClips | 2 | 2 48 74 98 105 111 116 115 110 127 133 136 138 119 105 | 105 | 6.17 |  |
| audioHandlers | 11 | 11 11 11 11 11 11 11 11 11 11 11 11 11 11 11 | 11 | 0 | ok (≤ start + 8 (19)) |
| arrayBuffers | 4 | 4 50 76 100 107 113 118 117 112 129 135 138 140 121 107 | 107 | 6.17 |  |
| layoutObjects | 117 | 117 133 143 156 166 179 189 199 209 219 229 239 249 259 98 | 98 | 6.34 |  |
| navLog | 0 | 0 9 18 22 23 24 31 32 33 42 49 50 51 67 78 | 78 | 4.6 | ok (≤ 500) |
| adjustLog | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 200) |
| imagesFetched | 56 | 56 78 89 89 89 89 92 94 97 106 109 109 109 116 128 | 128 | 3.61 |  |
| audioFetched | 3 | 3 51 77 101 108 115 136 149 154 177 196 208 210 228 244 | 244 | 15.17 |  |
| imgInDomMB | 22.5 | 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 15.6 | 15.6 | -0.17 |  |
| rendererRssMB | 392 | 392 763 905 936 967 1003 1060 1088 1120 1142 1149 1148 1148 1163 1190 | 1190 | 39.05 |  |
| gpuRssMB | 79 | 79 94 96 105 105 106 106 107 106 107 108 108 109 109 110 | 110 | 1.41 |  |
| footprintMB | 71.9 | 71.9 143 188.9 221.4 256 277.3 325.8 347.4 358.3 360.6 362.7 362.4 356.8 357.5 362 | 362 | 18.72 |  |
| gpuFootprintMB | 15.2 | 15.2 15.4 15.4 15.5 14.9 15.7 15.8 16.2 15.4 15.8 15.8 16.3 16.9 17.4 16.1 | 16.1 | 0.11 |  |
| mem_blink_gc | 4.4 | 4.4 13.6 21.6 26.1 30.1 33.1 35.6 41.5 40.7 46.7 49.9 58 61.1 60.8 62.9 | 62.9 | 3.96 |  |
| mem_blink_objects | 1.5 | 1.5 2.1 2.3 2.9 3 3.3 3.1 3.7 3.5 3.6 3.7 4.4 4.6 4.8 3.8 | 3.8 | 0.19 |  |
| mem_canvas | 3.5 | 3.5 3.7 3.8 3.8 3.8 3.8 3.8 3.8 3.8 3.8 3.8 3.8 3.8 3.8 3.8 | 3.8 | 0.01 |  |
| mem_cc | 180.8 | 180.8 460.9 526.5 506.7 493.4 511.7 514.4 501.4 490 491 489.2 482.8 478.4 486.8 508.8 | 508.8 | 7.27 |  |
| mem_discardable | 182.6 | 182.6 439.6 514.5 507.3 502.5 507.7 508.9 502.9 508.3 513.5 510.6 498.8 495 498.7 509.8 | 509.8 | 9.1 |  |
| mem_malloc | 45.7 | 45.7 53.2 59.7 55 54.1 56.1 62 63.4 64.8 64 68.2 64.8 63.6 65.4 60.4 | 60.4 | 1.06 |  |
| mem_media | 2.4 | 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 | 2.4 | 0 |  |
| mem_mojo | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_images | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_strings | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_partition_alloc | 16.3 | 16.3 66.3 104.9 142.1 174.5 198 235.3 259.3 265.4 266.9 266.8 267.5 267.6 267.8 269.6 | 269.6 | 16.94 |  |
| mem_shared_memory | 214.3 | 214.3 486 558.6 544.4 532.8 546.2 551.5 540.7 546.8 560.8 555.1 536.9 533.4 542.8 549.8 | 549.8 | 9.37 |  |
| mem_site_storage | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_skia | 0.3 | 0.3 3.8 6.4 6.8 5 4.7 4.7 10.8 10.6 11.7 11.2 16.5 15.1 14.5 10.6 | 10.6 | 0.92 |  |
| mem_v8 | 6.2 | 6.2 9.4 9.8 10.4 10.7 11 11.1 11.5 12.2 12.1 12.2 12.3 12.5 12.5 12.7 | 12.7 | 0.33 |  |
| mem_web_cache | 1.2 | 1.2 1.3 1.3 1.3 1.3 1.3 1.3 1.3 2.4 1.9 1.9 1.9 1.9 1.7 1.4 | 1.4 | 0.05 |  |

## While playing (periodic samples): first half vs second half

| metric | first half | second half |
|---|---|---|
| fps | 60.7 | 60.5 |
| slowFramePct | 0 | 0 |
| mainThreadPct | 6.7 | 8.7 |
| scriptPct | 0.6 | 0.9 |
| stylePct | 1.1 | 1.2 |
| layoutPct | 0.1 | 0.1 |
| recalcPerSec | 63.8 | 67.1 |
| layoutPerSec | 10 | 12.9 |
| rendererPct | 16.9 | 20.2 |
| gpuPct | 18.5 | 20.2 |
| longTaskMs | 0 | 0 |
| rafPerSec | 76 | 90.3 |
| rafPerFrame | 1.1 | 1.5 |
| animHiddenInfinite | 0 | 0 |
| animMainThreadInfinite | 0 | 0 |
| animations | 61.2 | 67.8 |
| animInfinite | 46.6 | 50.3 |
| particles | 6 | 19.7 |
| particlesPeak | 100.5 | 139.9 |

## Phases (the title, the still map, a held Next, the ninja's aura, the strike stress)

| phase | what | fps | main % | style % | recalcs/s | rAF/s | renderer CPU % | GPU CPU % | particles (now / peak) | fx nodes | animations | decoded MB | Nodes | heap MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| title | the title, 5 s, untouched | 60.6 | 0.4 | 0.2 | 20.9 | 0 | 2 | 10 | 0 / 0 | 0 | 19 (17 inf, 0 main) | 0.1 | 90 | 3.9 |
| idle-map | map | 60.6 | 0.6 | 0.2 | 23.8 | 0 | 4 | 6 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 39.7 | 207 | 9.8 |
| idle-map | map | 60.6 | 0.5 | 0.2 | 23.8 | 0 | 3 | 6 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 39.7 | 207 | 9.9 |
| idle-map | map | 60.8 | 0.5 | 0.2 | 23.8 | 0 | 3 | 7 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 39.7 | 207 | 10 |
| idle-map | map | 60.7 | 0.6 | 0.2 | 23.6 | 0 | 3 | 8 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 39.7 | 207 | 10.1 |
| idle-map | map | 60.7 | 0.5 | 0.2 | 23.7 | 0 | 3 | 7 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 39.7 | 207 | 10.2 |
| idle-map | map | 60.6 | 0.5 | 0.2 | 23.8 | 0 | 3 | 7 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 39.7 | 207 | 10.3 |
| settled | after soak | 60.5 | 0.4 | 0.2 | 20.9 | 0 | 3 | 7 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 39.7 | 207 | 9.9 |
| settled | the reward (w1-15), Next ready | 60.7 | 2.8 | 0.5 | 60.7 | 0 | 8 | 7 | 0 / 0 | 0 | 12 (4 inf, 0 main) | 39.7 | 244 | 10 |
| idle-next | the reward (w1-15), a held Next, untouched | 60.8 | 1.9 | 0.3 | 31.8 | 13.8 | 6 | 10 | 0 / 54 | 0 | 10 (5 inf, 0 main) | 39.7 | 271 | 10.2 |
| idle-next | the reward (w1-15), a held Next, untouched | 61 | 1.6 | 0.3 | 30.3 | 8.6 | 5 | 10 | 0 / 0 | 0 | 10 (5 inf, 0 main) | 39.7 | 259 | 9.9 |
| idle-next | the reward (w1-15), a held Next, untouched | 60.9 | 1.2 | 0.2 | 25.6 | 0 | 5 | 9 | 0 / 0 | 0 | 10 (5 inf, 0 main) | 39.7 | 247 | 9.8 |
| idle-next | the reward (w1-15), a held Next, untouched | 60.7 | 1.1 | 0.2 | 24.6 | 0 | 4 | 10 | 0 / 0 | 0 | 12 (5 inf, 0 main) | 39.7 | 247 | 10 |
| aura-t0 | ninja demo, streak 0, idle | 60.8 | 1.6 | 0.4 | 32.2 | 11.6 | 6 | 11 | 0 / 0 | 0 | 4 (3 inf, 0 main) | 39.7 | 711 | 10.1 |
| aura-t0 | ninja demo, streak 0, idle | 60.8 | 0.7 | 0.2 | 24.9 | 0 | 4 | 10 | 0 / 0 | 0 | 4 (3 inf, 0 main) | 39.7 | 711 | 10.2 |
| aura-t3 | ninja demo, streak 10, idle | 61 | 2.7 | 0.7 | 33.9 | 15.1 | 9 | 16 | 0 / 99 | 0 | 60 (49 inf, 0 main) | 39.9 | 322 | 10 |
| aura-t3 | ninja demo, streak 10, idle | 60.3 | 1.6 | 0.6 | 24.8 | 0 | 7 | 15 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 39.9 | 312 | 10 |
| settled | before stress | 60.4 | 1.2 | 0.5 | 21.4 | 0 | 6 | 14 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 39.9 | 312 | 10.2 |
| stress | strike 1/150 | 60.8 | 4.4 | 1.2 | 60.7 | 0 | 9 | 14 | 0 / 0 | 0 | 63 (49 inf, 0 main) | 39.9 | 364 | 10.5 |
| stress | strike 70/150 | 60.7 | 25.4 | 2.4 | 119.9 | 209.3 | 68 | 30 | 279 / 318 | 74 | 81 (51 inf, 0 main) | 39.9 | 478 | 11 |
| stress | strike 139/150 | 61 | 27.8 | 2.6 | 118.2 | 207.1 | 75 | 33 | 224 / 298 | 39 | 77 (55 inf, 0 main) | 39.9 | 416 | 10.4 |
| stress | last strike | 60.9 | 21.1 | 2.2 | 106.1 | 170.8 | 58 | 28 | 256 / 263 | 32 | 72 (49 inf, 0 main) | 39.9 | 383 | 11.2 |
| settled | 10 s after the stress | 60.7 | 1.3 | 0.5 | 20.9 | 0 | 6 | 16 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 39.9 | 312 | 10.3 |
| settled | map after the stress | 60.2 | 0.6 | 0.2 | 20.8 | 0 | 4 | 14 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.9 | 377 | 10 |

## Levels

| level | kind | secs | finished | max streak | streak at end | stuck |
|---|---|---|---|---|---|---|
| w1-2 | firstsound | 72 | yes | 8 | 8 |  |
| w1-3 | firstsound | 61 | yes | 16 | 16 |  |
| w1-4 | dojo | 60 | yes | 23 | 23 |  |
| w1-5 | dojo | 67 | yes | 33 | 33 |  |
| w1-6 | battle | 30 | yes | 33 | 8 |  |
| w1-7 | soundhunt | 78 | yes | 15 | 15 |  |
| w1-8 | swap | 53 | yes | 19 | 7 |  |
| w1-9 | run | 47 | yes | 13 | 13 |  |
| w1-10 | firstsound | 94 | yes | 26 | 26 |  |
| w1-11 | soundhunt | 77 | yes | 34 | 34 |  |
| w1-12 | swap | 98 | yes | 60 | 60 |  |
| w1-13 | battle | 25 | yes | 70 | 70 |  |
| w1-14 | story | 29 | yes | 72 | 72 |  |
| w1-15 | boss | 58 | yes | 93 | 93 |  |

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
  "100ms at http://127.0.0.1:4801/assets/play-DPSLZU_4.js:1:971": 1
 },
 "mods": {
  "visemeListeners": 1,
  "bufferCache": 105,
  "captionListeners": 3,
  "clipListeners": 1,
  "sayListeners": 2,
  "music": 1,
  "speaking": 0,
  "decodedLruMB": 39.7,
  "musicDecks": 2,
  "storeListeners": 4,
  "attemptSubs": 0,
  "saveBytes": 3260,
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
  "streakN": 93,
  "owned": 0,
  "ownedConnected": 0,
  "busy": 0,
  "spotMounted": 0,
  "moveRunning": 0,
  "spotGen": 33,
  "navStack": 1,
  "navSubs": 2,
  "nudgeSubs": 0,
  "holds": 0,
  "narrateSubs": 0
 }
}
```

