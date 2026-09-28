# Soak soak-phone

12 levels in one page (reloads: none), fast=2, phone emulation (844×390, DPR 3), CPU throttled 4×, served prod from http://127.0.0.1:4801 (snapshot built 2026-09-27T05:14:04.889Z). Longest streak: 51. Page errors: 0.

## Budgets: **FAIL** (3: fps, flowerMain, flowerTask)

docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §11.1 and docs/PERF.md §5. "n/a": not judged on this run. Owners are the fix plan's lanes; an offending animation names the file that defines it.

| result | when | check | budget | measured | owner |
|---|---|---|---|---|---|
| pass | after each level, back on the map (GC'd) | DOM nodes (CDP, attached + detached) | ≤ start + 600 (765) | start 165, worst 356 (after w1-13) | all |
| pass | after each level, back on the map (GC'd) | JS heap, MB | ≤ start + 8 (12.1) | start 4.1, worst 9.6 (after w1-13) | all |
| pass | after each level, back on the map (GC'd) | event listeners | ≤ start + 40 (289) | start 249, worst 277 (after w1-9) | all |
| pass | after each level, back on the map (GC'd) | animations on the map | ≤ start + 5 (34) | start 29, worst 30 (after w1-6) | all |
| pass | after each level, back on the map (GC'd) | live intervals | ≤ start + 1 (2) | start 1, worst 1 (after start) | all |
| pass | after each level, back on the map (GC'd) | particles on the canvas | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | nodes in the fx layer | ≤ 0 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | rAF requests/s on the still map | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | live decoded audio, MB | ≤ 64 | start 0.9, worst 40 (after w1-7) | F1, B1 |
| pass | after each level, back on the map (GC'd) | Web Audio nodes (AudioHandlers) | ≤ start + 8 (19) | start 11, worst 11 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | &lt;audio> elements alive | ≤ start + 2 (4) | start 2, worst 2 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | window.__snNavLog entries | ≤ 500 | start 0, worst 51 (after w1-13) | F3 |
| pass | after each level, back on the map (GC'd) | the save's adjustLog entries | ≤ 200 | start 0, worst 0 (after start) | F1 |
| pass | on the title, untouched for 5 s | live decoded audio, MB | ≤ 2 | 0.1 MB in 1 clip | B1 |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations the compositor can't run | ≤ 2 | max 0; over in 0 of 76 samples | F1, B, C, D (by file) |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations running on hidden elements | ≤ 2 | max 0; over in 0 of 76 samples | F1, D2 (by file) |
| pass | the still map, 60 s untouched | rAF requests/s, median | ≤ 5 | 0 (max 0); main thread 1.4 % | F1, B1 |
| pass | a held Next (a reward), 40 s untouched, the idle nudge included | rAF requests/s, median | ≤ 5 | 4.4 (max 14); main thread 3.9 % | F1, F3 (nav.tsx), B1 |
| **FAIL** | phone ×4, while playing | every screen's median fps | ≥ 50 | under on level:w1-9 (43.7) | D5 (the runner); otherwise the screen's owner |
| pass | phone ×4, the still map | main thread %, median | ≤ 5 % | 1.4 % | F1 |
| pass | phone ×4, a held Next (a reward), the idle nudge included | main thread %, median | ≤ 6 % | 3.9 % (5.5, 4.6, 3.2, 3.2) | F1 (the ninja), F3 (the nudge), B1 (the reward) |
| pass | phone ×4, the ninja standing still | main thread % at streak 0, mean | ≤ 6 % | 2.6 % (3.9, 1.3) | F1 |
| pass | phone ×4, the ninja standing still | main thread % at streak 10, mean | ≤ 14 % | 5.7 % (7.1, 4.2) | F1 |
| **FAIL** | phone ×4, the World Flower | main thread %, median | ≤ 30 % | 41.6 % over 4 samples (26.3, 33.7, 51.4, 49.4) | B2 |
| **FAIL** | phone ×4, the World Flower | longest task, ms | ≤ 120 ms | 123 ms | B2 |
| pass | the strike stress (150 streak-10 strikes, 7 a second) | particles at the peak | ≤ 350 | 288 (fx nodes 89) | F1 |
| pass | 10 s after the stress | particles / fx nodes left | 0 / 0 | 0 / 0 | F1 |
| pass | the whole soak | page reloads | 0 | 0 | all |
| pass | the whole soak | levels the bot finished | all | 12 of 12 | the scene's owner (or bot.ts) |

## After each level (on the map, after a forced GC)

| metric | start | per level → | last | slope / level | budget |
|---|---|---|---|---|---|
| heapMB | 4.1 | 4.1 7.1 7.5 7.9 8.1 8.4 8.5 8.7 9.2 9.3 9.4 9.5 9.6 | 9.6 | 0.33 | ok (≤ start + 8 (12.1)) |
| nodes | 165 | 165 189 209 223 233 245 255 265 316 326 336 346 356 | 356 | 16.12 | ok (≤ start + 600 (765)) |
| detachedNodes | 9 | 9 23 33 37 37 37 37 37 78 78 78 78 78 | 78 | 5.9 |  |
| attachedNodes | 156 | 156 166 176 186 196 208 218 228 238 248 258 268 278 | 278 | 10.22 |  |
| listeners | 249 | 249 275 275 275 275 275 275 275 277 277 277 277 277 | 277 | 1.08 | ok (≤ start + 40 (289)) |
| globalListeners | 17 | 17 30 30 30 30 30 30 30 30 30 30 30 30 | 30 | 0.43 |  |
| animations | 29 | 29 29 29 29 29 30 30 30 30 30 30 30 30 | 30 | 0.11 | ok (≤ start + 5 (34)) |
| animInfinite | 9 | 9 9 9 9 9 10 10 10 10 10 10 10 10 | 10 | 0.11 |  |
| animHiddenInfinite | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| animMainThreadInfinite | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| fxDomNodes | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 0) |
| particles | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| rafPerSec | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| intervals | 1 | 1 1 1 1 1 1 1 1 1 1 1 1 1 | 1 | 0 | ok (≤ start + 1 (2)) |
| pendingTimeouts | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mediaAlive | 2 | 2 2 2 2 2 2 2 2 2 2 2 2 2 | 2 | 0 | ok (≤ start + 2 (4)) |
| decodedMB | 0.9 | 0.9 15.7 22.6 32 34.1 37.3 40 39.9 39.8 39.7 39.8 39.9 39.9 | 39.9 | 2.53 | ok (≤ 64) |
| decodedTotalMB | 0.9 | 0.9 15.7 22.6 32 34.1 37.3 45.1 50.4 52.6 62.8 67.8 73.2 76.4 | 76.4 | 5.85 |  |
| decodedClips | 2 | 2 47 73 98 106 112 118 116 111 126 131 137 135 | 135 | 8.67 |  |
| audioHandlers | 11 | 11 11 11 11 11 11 11 11 11 11 11 11 11 | 11 | 0 | ok (≤ start + 8 (19)) |
| arrayBuffers | 4 | 4 49 75 100 108 114 120 118 113 128 133 139 137 | 137 | 8.67 |  |
| layoutObjects | 116 | 116 132 142 155 165 178 188 198 208 218 228 238 248 | 248 | 10.77 |  |
| navLog | 0 | 0 9 18 22 23 24 31 32 33 42 49 50 51 | 51 | 3.97 | ok (≤ 500) |
| adjustLog | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 200) |
| imagesFetched | 56 | 56 74 89 89 89 89 92 94 97 106 108 108 108 | 108 | 3.46 |  |
| audioFetched | 3 | 3 50 76 101 109 116 139 152 157 181 197 208 211 | 211 | 15.9 |  |
| imgInDomMB | 22.5 | 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 | 22.5 | 0 |  |
| rendererRssMB | 407 | 407 779 907 944 974 1015 1067 1100 1133 1169 1175 1172 1172 | 1172 | 47.83 |  |
| gpuRssMB | 80 | 80 94 97 105 107 107 109 109 109 109 109 109 109 | 109 | 1.73 |  |
| footprintMB | 76 | 76 145.2 189.4 224.4 258.4 281.4 322.6 341 354.3 361 366.6 361.9 364.7 | 364.7 | 23 |  |
| gpuFootprintMB | 15 | 15 15.2 15.7 16 15.6 15.6 15.8 16.4 15.5 15.7 15.6 15.9 16.2 | 16.2 | 0.05 |  |
| mem_blink_gc | 4.1 | 4.1 15.5 23.3 28.4 32.2 36.2 38.2 44.4 44.7 49.4 51.8 61.1 62.5 | 62.5 | 4.33 |  |
| mem_blink_objects | 1.5 | 1.5 2.1 2.3 2.9 3 3.1 3 3.5 3.5 3.6 3.7 4.6 4.1 | 4.1 | 0.2 |  |
| mem_canvas | 3.5 | 3.5 3.6 3.8 3.8 3.8 3.8 3.8 3.8 3.8 3.8 3.8 3.8 3.8 | 3.8 | 0.02 |  |
| mem_cc | 176.5 | 176.5 470.5 531.7 504.5 509.4 514.6 505.9 505.3 508.9 513.9 511.5 486.6 491.8 | 491.8 | 10.49 |  |
| mem_discardable | 192.2 | 192.2 451.4 513.9 507 503.4 508.1 512.1 513 509.7 512.5 512.3 497.3 495.5 | 495.5 | 11.41 |  |
| mem_malloc | 49.6 | 49.6 51.6 59.1 56 57.8 58.8 64.4 63.1 66.7 68.5 72 68.7 69.7 | 69.7 | 1.74 |  |
| mem_media | 2.4 | 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 | 2.4 | 0 |  |
| mem_mojo | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_images | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_strings | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_partition_alloc | 16.2 | 16.2 66.2 105.2 141.8 172.3 194.8 231.9 249.4 261 267.5 268 270.5 266.9 | 266.9 | 20.8 |  |
| mem_shared_memory | 219.6 | 219.6 496.2 559.6 545.3 541.2 546.5 542.8 550.8 545.7 557.8 552.3 530.1 533.8 | 533.8 | 11.41 |  |
| mem_site_storage | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_skia | 0.5 | 0.5 4.4 5.1 4.4 4.3 4.5 5.4 9.8 10 10.7 10.1 16.4 13.7 | 13.7 | 1.07 |  |
| mem_v8 | 6 | 6 9.2 9.7 10.2 10.4 10.8 11.3 11.3 12 12.2 12 12.2 12.4 | 12.4 | 0.4 |  |
| mem_web_cache | 1.2 | 1.2 1.3 1.3 1.3 1.3 1.3 1.3 1.3 2.4 1.9 1.9 1.7 1.7 | 1.7 | 0.06 |  |

## While playing (periodic samples): first half vs second half

| metric | first half | second half |
|---|---|---|
| fps | 60.5 | 58.2 |
| slowFramePct | 0.3 | 5.7 |
| mainThreadPct | 28.2 | 43.3 |
| scriptPct | 2.3 | 3.5 |
| stylePct | 5.3 | 6 |
| layoutPct | 0.4 | 0.5 |
| recalcPerSec | 63.4 | 61.8 |
| layoutPerSec | 9.3 | 9.8 |
| rendererPct | 95.1 | 96.6 |
| gpuPct | 20.5 | 32.2 |
| longTaskMs | 11.4 | 138 |
| rafPerSec | 75.3 | 77.6 |
| rafPerFrame | 1.1 | 1.3 |
| animHiddenInfinite | 0 | 0 |
| animMainThreadInfinite | 0 | 0 |
| animations | 65.8 | 59.1 |
| animInfinite | 51.3 | 41.3 |
| particles | 1.3 | 24.7 |
| particlesPeak | 107.5 | 124.5 |

## Phases (the title, the still map, a held Next, the ninja's aura, the strike stress)

| phase | what | fps | main % | style % | recalcs/s | rAF/s | renderer CPU % | GPU CPU % | particles (now / peak) | fx nodes | animations | decoded MB | Nodes | heap MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| title | the title, 5 s, untouched | 60.7 | 1.1 | 0.4 | 20.3 | 0 | 80 | 10 | 0 / 0 | 0 | 19 (17 inf, 0 main) | 0.1 | 89 | 3.9 |
| idle-map | map | 60.3 | 2.4 | 0.8 | 23.8 | 0 | 84 | 14 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.9 | 356 | 9.5 |
| idle-map | map | 60 | 2.2 | 0.7 | 23.7 | 0 | 83 | 13 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.9 | 356 | 9.6 |
| idle-map | map | 60.9 | 1.5 | 0.5 | 23.8 | 0 | 80 | 9 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.9 | 356 | 9.7 |
| idle-map | map | 60.8 | 1.3 | 0.4 | 23.8 | 0 | 80 | 9 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.9 | 356 | 9.8 |
| idle-map | map | 60.8 | 1.2 | 0.4 | 23.8 | 0 | 80 | 8 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.9 | 356 | 10 |
| idle-map | map | 60.8 | 1.2 | 0.4 | 23.6 | 0 | 80 | 9 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.9 | 356 | 10.1 |
| settled | after soak | 60.2 | 1.1 | 0.3 | 19.9 | 0 | 80 | 7 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.9 | 356 | 9.6 |
| settled | the reward (w1-13), Next ready | 60.3 | 10.1 | 2 | 59.6 | 0 | 84 | 7 | 0 / 0 | 0 | 20 (11 inf, 0 main) | 39.9 | 299 | 9.5 |
| idle-next | the reward (w1-13), a held Next, untouched | 60.7 | 5.5 | 1.2 | 32.1 | 14 | 82 | 8 | 0 / 56 | 0 | 20 (12 inf, 0 main) | 39.9 | 322 | 9.6 |
| idle-next | the reward (w1-13), a held Next, untouched | 60.8 | 4.6 | 0.9 | 30 | 8.7 | 81 | 7 | 0 / 0 | 0 | 20 (12 inf, 0 main) | 39.9 | 312 | 9.5 |
| idle-next | the reward (w1-13), a held Next, untouched | 60.8 | 3.2 | 0.7 | 25.2 | 0 | 80 | 7 | 0 / 0 | 0 | 20 (12 inf, 0 main) | 39.9 | 302 | 9.5 |
| idle-next | the reward (w1-13), a held Next, untouched | 60.7 | 3.2 | 0.7 | 25.3 | 0 | 80 | 7 | 0 / 0 | 0 | 20 (12 inf, 0 main) | 39.9 | 302 | 9.5 |
| aura-t0 | ninja demo, streak 0, idle | 60.5 | 3.9 | 0.8 | 31.9 | 11.6 | 82 | 8 | 0 / 0 | 0 | 4 (3 inf, 0 main) | 39.9 | 215 | 9.4 |
| aura-t0 | ninja demo, streak 0, idle | 60.8 | 1.3 | 0.3 | 24.3 | 0 | 80 | 6 | 0 / 0 | 0 | 4 (3 inf, 0 main) | 39.9 | 215 | 9.5 |
| aura-t3 | ninja demo, streak 10, idle | 60.6 | 7.1 | 2.1 | 31.8 | 15 | 83 | 11 | 0 / 99 | 0 | 60 (49 inf, 0 main) | 39.9 | 311 | 9.5 |
| aura-t3 | ninja demo, streak 10, idle | 60.2 | 4.2 | 1.5 | 21.5 | 0 | 82 | 11 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 39.9 | 311 | 9.5 |
| settled | before stress | 61 | 4.3 | 1.5 | 20.3 | 0 | 83 | 11 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 39.9 | 311 | 9.7 |
| stress | strike 1/150 | 60.5 | 14.5 | 4.9 | 60.7 | 0 | 85 | 11 | 0 / 0 | 0 | 63 (49 inf, 0 main) | 39.9 | 363 | 10 |
| stress | strike 65/150 | 61.4 | 84 | 8.7 | 118.7 | 191.2 | 129 | 22 | 174 / 280 | 89 | 82 (51 inf, 0 main) | 39.9 | 691 | 11.8 |
| stress | strike 129/150 | 60.9 | 85.8 | 9.1 | 114.3 | 187.7 | 130 | 22 | 228 / 276 | 78 | 82 (49 inf, 0 main) | 39.9 | 758 | 11 |
| stress | last strike | 61 | 77.8 | 8.7 | 105.4 | 169.2 | 124 | 21 | 177 / 265 | 76 | 84 (49 inf, 0 main) | 39.9 | 490 | 11.1 |
| settled | 10 s after the stress | 60.4 | 4.6 | 2 | 22.8 | 0 | 84 | 12 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 39.9 | 311 | 9.9 |
| settled | map after the stress | 60.2 | 1.3 | 0.4 | 20.9 | 0 | 81 | 9 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.9 | 356 | 9.6 |

## Levels

| level | kind | secs | finished | max streak | streak at end | stuck |
|---|---|---|---|---|---|---|
| w1-2 | firstsound | 73 | yes | 4 | 3 |  |
| w1-3 | firstsound | 62 | yes | 11 | 11 |  |
| w1-4 | dojo | 61 | yes | 18 | 18 |  |
| w1-5 | dojo | 65 | yes | 28 | 28 |  |
| w1-6 | battle | 29 | yes | 38 | 38 |  |
| w1-7 | soundhunt | 78 | yes | 45 | 45 |  |
| w1-8 | swap | 56 | yes | 51 | 5 |  |
| w1-9 | run | 52 | yes | 11 | 11 |  |
| w1-10 | firstsound | 96 | yes | 24 | 24 |  |
| w1-11 | soundhunt | 81 | yes | 32 | 32 |  |
| w1-12 | swap | 115 | yes | 38 | 1 |  |
| w1-13 | battle | 30 | yes | 6 | 6 |  |

## Last boundary: what is still running

```
{
 "animations": {
  "total": 30,
  "running": 10,
  "infinite": 10,
  "hiddenInfinite": 0,
  "mainThreadInfinite": 0,
  "finishedKept": 20,
  "top": [
   [
    "@popin",
    19
   ],
   [
    "@drift",
    6
   ],
   [
    "@mapnext",
    1
   ],
   [
    "@taphint",
    1
   ],
   [
    "@bob",
    1
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
  "100ms at http://127.0.0.1:4801/assets/play-879Fb1Cs.js:1:971": 1
 },
 "mods": {
  "visemeListeners": 1,
  "bufferCache": 135,
  "captionListeners": 3,
  "clipListeners": 0,
  "sayListeners": 1,
  "music": 1,
  "speaking": 0,
  "decodedLruMB": 39.9,
  "musicDecks": 2,
  "storeListeners": 4,
  "attemptSubs": 0,
  "saveBytes": 3129,
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
  "streakN": 6,
  "owned": 0,
  "ownedConnected": 0,
  "busy": 0,
  "spotMounted": 0,
  "moveRunning": 0,
  "spotGen": 28,
  "navStack": 1,
  "navSubs": 2,
  "nudgeSubs": 0,
  "holds": 0,
  "narrateSubs": 0
 }
}
```

