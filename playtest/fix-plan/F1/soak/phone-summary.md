# Soak after-core-phone

12 levels in one page (reloads: none), fast=2, phone emulation (844×390, DPR 3), CPU throttled 4×, served none from http://127.0.0.1:4401. Longest streak: 37. Page errors: 0.

## Budgets: **FAIL** (1: animHiddenInfinite)

docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §11.1 and docs/PERF.md §5. "n/a": not judged on this run. Owners are the fix plan's lanes; an offending animation names the file that defines it.

| result | when | check | budget | measured | owner |
|---|---|---|---|---|---|
| pass | after each level, back on the map (GC'd) | DOM nodes (CDP, attached + detached) | ≤ start + 600 (765) | start 165, worst 352 (after w1-13) | all |
| pass | after each level, back on the map (GC'd) | JS heap, MB | ≤ start + 8 (11.7) | start 3.7, worst 9.2 (after w1-13) | all |
| pass | after each level, back on the map (GC'd) | event listeners | ≤ start + 40 (289) | start 249, worst 277 (after w1-9) | all |
| pass | after each level, back on the map (GC'd) | animations on the map | ≤ start + 5 (34) | start 29, worst 30 (after w1-5) | all |
| pass | after each level, back on the map (GC'd) | live intervals | ≤ start + 1 (2) | start 1, worst 1 (after start) | all |
| pass | after each level, back on the map (GC'd) | particles on the canvas | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | nodes in the fx layer | ≤ 0 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | rAF requests/s on the still map | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | live decoded audio, MB | ≤ 64 | start 0.9, worst 40 (after w1-12) | F1, B1 |
| pass | after each level, back on the map (GC'd) | Web Audio nodes (AudioHandlers) | ≤ start + 8 (19) | start 11, worst 11 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | &lt;audio> elements alive | ≤ start + 2 (4) | start 2, worst 2 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | window.__snNavLog entries | ≤ 500 | start 0, worst 51 (after w1-13) | F3 |
| pass | after each level, back on the map (GC'd) | the save's adjustLog entries | ≤ 200 | start 0, worst 0 (after start) | F1 |
| pass | on the title, untouched for 5 s | live decoded audio, MB | ≤ 2 | 0.1 MB in 1 clip | B1 |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations the compositor can't run | ≤ 2 | max 0; over in 0 of 81 samples | F1, B, C, D (by file) |
| **FAIL** | while playing, and on still screens (title, map, a held Next), every sample | endless animations running on hidden elements | ≤ 2 | max 3; over in 1 of 81 samples<br>gem-slosh ×3 (src/styles.css). On reward:w1-6 | F1, D2 (by file) |
| pass | the still map, 60 s untouched | rAF requests/s, median | ≤ 5 | 0 (max 0); main thread 1.4 % | F1, B1 |
| pass | a held Next (a reward), 40 s untouched, the idle nudge included | rAF requests/s, median | ≤ 5 | 3.2 (max 11.2); main thread 3.8 % | F1, F3 (nav.tsx), B1 |
| pass | phone ×4, while playing | every screen's median fps | ≥ 50 | lowest level:w1-7 (60.3) | D5 (the runner); otherwise the screen's owner |
| pass | phone ×4, the still map | main thread %, median | ≤ 5 % | 1.4 % | F1 |
| pass | phone ×4, a held Next (a reward), the idle nudge included | main thread %, median | ≤ 6 % | 3.8 % (4.9, 4.3, 3.3, 3.3) | F1 (the ninja), F3 (the nudge), B1 (the reward) |
| pass | phone ×4, the ninja standing still | main thread % at streak 0, mean | ≤ 6 % | 2.6 % (4.2, 1) | F1 |
| pass | phone ×4, the ninja standing still | main thread % at streak 10, mean | ≤ 14 % | 5.2 % (6.3, 4) | F1 |
| pass | phone ×4, the World Flower | main thread %, median | ≤ 30 % | 26.9 % over 5 samples (26.9, 31.4, 24.1, 22.2, 34.4) | B2 |
| pass | phone ×4, the World Flower | longest task, ms | ≤ 120 ms | 63 ms | B2 |
| pass | the strike stress (150 streak-10 strikes, 7 a second) | particles at the peak | ≤ 350 | 294 (fx nodes 85) | F1 |
| pass | 10 s after the stress | particles / fx nodes left | 0 / 0 | 0 / 0 | F1 |
| pass | the whole soak | page reloads | 0 | 0 | all |
| pass | the whole soak | levels the bot finished | all | 12 of 12 | the scene's owner (or bot.ts) |

## After each level (on the map, after a forced GC)

| metric | start | per level → | last | slope / level | budget |
|---|---|---|---|---|---|
| heapMB | 3.7 | 3.7 6.6 7 7.5 7.6 7.9 8.1 8.3 8.9 9 9 9.1 9.2 | 9.2 | 0.34 | ok (≤ start + 8 (11.7)) |
| nodes | 165 | 165 188 206 219 231 241 251 261 312 322 332 342 352 | 352 | 15.86 | ok (≤ start + 600 (765)) |
| detachedNodes | 9 | 9 22 30 33 33 33 33 33 74 74 74 74 74 | 74 | 5.66 |  |
| attachedNodes | 156 | 156 166 176 186 198 208 218 228 238 248 258 268 278 | 278 | 10.2 |  |
| listeners | 249 | 249 275 275 275 275 275 275 275 277 277 277 277 277 | 277 | 1.08 | ok (≤ start + 40 (289)) |
| globalListeners | 17 | 17 30 30 30 30 30 30 30 30 30 30 30 30 | 30 | 0.43 |  |
| animations | 29 | 29 29 29 29 30 30 30 30 30 30 30 30 30 | 30 | 0.1 | ok (≤ start + 5 (34)) |
| animInfinite | 9 | 9 9 9 9 10 10 10 10 10 10 10 10 10 | 10 | 0.1 |  |
| animHiddenInfinite | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| animMainThreadInfinite | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| fxDomNodes | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 0) |
| particles | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| rafPerSec | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| intervals | 1 | 1 1 1 1 1 1 1 1 1 1 1 1 1 | 1 | 0 | ok (≤ start + 1 (2)) |
| pendingTimeouts | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mediaAlive | 2 | 2 2 2 2 2 2 2 2 2 2 2 2 2 | 2 | 0 | ok (≤ start + 2 (4)) |
| decodedMB | 0.9 | 0.9 15.3 20.7 30.8 32.8 35.1 39.9 39.9 39.9 39.3 39 40 40 | 40 | 2.61 | ok (≤ 64) |
| decodedTotalMB | 0.9 | 0.9 15.3 20.7 30.8 32.8 35.1 43.2 48.4 51 60.7 66.5 74.2 77.7 | 77.7 | 5.92 |  |
| decodedClips | 2 | 2 48 69 96 103 107 121 117 111 124 129 137 139 | 139 | 8.88 |  |
| audioHandlers | 11 | 11 11 11 11 11 11 11 11 11 11 11 11 11 | 11 | 0 | ok (≤ start + 8 (19)) |
| arrayBuffers | 4 | 4 50 71 98 105 109 123 119 113 126 131 139 141 | 141 | 8.88 |  |
| layoutObjects | 116 | 116 132 142 155 168 178 188 198 208 218 228 238 248 | 248 | 10.74 |  |
| navLog | 0 | 0 9 18 22 23 24 31 32 33 42 49 50 51 | 51 | 3.97 | ok (≤ 500) |
| adjustLog | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 200) |
| imagesFetched | 54 | 54 76 88 88 88 88 91 93 96 106 108 108 108 | 108 | 3.51 |  |
| audioFetched | 3 | 3 51 72 99 106 111 137 147 153 179 196 211 217 | 217 | 16.21 |  |
| imgInDomMB | 22.5 | 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 | 22.5 | 0 |  |
| rendererRssMB | 534 | 534 887 948 994 1036 1072 1132 1168 1199 1221 1242 1242 1256 | 1256 | 46.08 |  |
| gpuRssMB | 83 | 83 94 96 105 105 105 105 105 105 107 106 106 106 | 106 | 1.34 |  |
| footprintMB | 93.8 | 93.8 170.8 219.9 266.1 304.2 332.2 386.9 417.5 424.8 443.7 456.1 468.3 469.9 | 469.9 | 30.48 |  |
| gpuFootprintMB | 14.5 | 14.5 15.3 15.3 15.4 15.2 15.6 14.9 16 15.8 15.3 15.2 16.3 16.4 | 16.4 | 0.1 |  |
| mem_blink_gc | 5.2 | 5.2 15.8 23.4 29 32.3 35.7 38 44.3 44.7 50.2 55.1 63.7 65.5 | 65.5 | 4.53 |  |
| mem_blink_objects | 1.6 | 1.6 2.3 2.6 3.3 3.5 3.6 3.4 4 3.9 4.1 4.2 5 4.9 | 4.9 | 0.24 |  |
| mem_canvas | 3.5 | 3.5 3.6 3.8 3.8 3.8 3.8 3.8 3.8 3.8 3.8 3.8 3.8 3.8 | 3.8 | 0.02 |  |
| mem_cc | 255.9 | 255.9 541.3 537.8 509.3 510 515.3 523.1 490.7 458.8 500.7 476.8 477.1 478.5 | 478.5 | 3.39 |  |
| mem_discardable | 282.6 | 282.6 517 515.1 505.1 505.6 509.5 508.7 504.3 512.1 506.4 514.1 490.5 494 | 494 | 6.28 |  |
| mem_malloc | 54.9 | 54.9 63.5 63.4 62.9 60.1 64.8 68.9 67.2 66.7 69.5 74.5 70 71 | 71 | 1.15 |  |
| mem_media | 2.4 | 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 | 2.4 | 0 |  |
| mem_mojo | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_images | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_strings | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_partition_alloc | 29.8 | 29.8 85.7 132.4 179.2 218.1 242 291.2 323.6 327.3 345.7 355.8 368 371.3 | 371.3 | 28.32 |  |
| mem_shared_memory | 312.5 | 312.5 566.2 564.7 543.5 543.1 546.5 558 542.2 548.2 554.6 560.5 528.1 530.5 | 530.5 | 6.26 |  |
| mem_site_storage | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_skia | 0.5 | 0.5 3.6 5.6 4.9 3.9 4.1 5.1 10.3 10.8 11.3 10.3 15 13.5 | 13.5 | 1.06 |  |
| mem_v8 | 6 | 6 9.3 9.8 10.3 10.6 10.7 11 11.4 11.8 12.1 12.2 12.4 12.3 | 12.3 | 0.39 |  |
| mem_web_cache | 1.2 | 1.2 1.2 1.2 1.2 1.2 1.2 1.2 1.2 2.3 1.6 1.6 1.6 1.6 | 1.6 | 0.05 |  |

## While playing (periodic samples): first half vs second half

| metric | first half | second half |
|---|---|---|
| fps | 60.6 | 60.4 |
| slowFramePct | 0 | 0.5 |
| mainThreadPct | 18.4 | 28.9 |
| scriptPct | 1.7 | 2.3 |
| stylePct | 3.3 | 3.8 |
| layoutPct | 0.3 | 0.3 |
| recalcPerSec | 63.3 | 64.3 |
| layoutPerSec | 8.9 | 11.3 |
| rendererPct | 89.5 | 93.3 |
| gpuPct | 12.8 | 13.7 |
| longTaskMs | 5.1 | 11.9 |
| rafPerSec | 76.1 | 82.8 |
| rafPerFrame | 1 | 1.3 |
| animHiddenInfinite | 0.1 | 0.1 |
| animMainThreadInfinite | 0 | 0 |
| animations | 62.1 | 61.6 |
| animInfinite | 49.5 | 44.4 |
| particles | 7.3 | 17 |
| particlesPeak | 106 | 130.1 |

## Phases (the title, the still map, a held Next, the ninja's aura, the strike stress)

| phase | what | fps | main % | style % | recalcs/s | rAF/s | renderer CPU % | GPU CPU % | particles (now / peak) | fx nodes | animations | decoded MB | Nodes | heap MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| title | the title, 5 s, untouched | 60.2 | 1 | 0.3 | 19.4 | 0 | 79 | 10 | 0 / 0 | 0 | 19 (17 inf, 0 main) | 0.1 | 89 | 3.5 |
| idle-map | map | 60.8 | 1.4 | 0.4 | 23.8 | 0 | 80 | 9 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 40 | 352 | 9.3 |
| idle-map | map | 60.7 | 1.5 | 0.5 | 23.8 | 0 | 81 | 8 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 40 | 352 | 9.4 |
| idle-map | map | 60.9 | 1.4 | 0.4 | 23.8 | 0 | 81 | 9 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 40 | 352 | 9.6 |
| idle-map | map | 60.8 | 1.3 | 0.4 | 23.6 | 0 | 80 | 8 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 40 | 352 | 9.7 |
| idle-map | map | 60.8 | 1.4 | 0.4 | 23.7 | 0 | 81 | 9 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 40 | 352 | 9.8 |
| idle-map | map | 60.9 | 1.4 | 0.4 | 23.8 | 0 | 81 | 9 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 40 | 352 | 9.1 |
| settled | after soak | 60.9 | 1.2 | 0.3 | 20.9 | 0 | 81 | 7 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 40 | 352 | 9.2 |
| settled | the reward (w1-13), Next ready | 61 | 9.5 | 1.8 | 59.7 | 0 | 84 | 7 | 0 / 0 | 0 | 16 (9 inf, 0 main) | 40 | 254 | 9.1 |
| idle-next | the reward (w1-13), a held Next, untouched | 60.7 | 4.9 | 1 | 29.2 | 11.2 | 82 | 7 | 0 / 58 | 0 | 16 (10 inf, 0 main) | 40 | 257 | 9 |
| idle-next | the reward (w1-13), a held Next, untouched | 60.8 | 4.3 | 1 | 28.4 | 6.4 | 81 | 7 | 0 / 0 | 0 | 16 (10 inf, 0 main) | 40 | 267 | 9.1 |
| idle-next | the reward (w1-13), a held Next, untouched | 60.7 | 3.3 | 0.8 | 24.5 | 0 | 81 | 7 | 0 / 0 | 0 | 18 (10 inf, 0 main) | 40 | 257 | 9.1 |
| idle-next | the reward (w1-13), a held Next, untouched | 60.8 | 3.3 | 0.8 | 24.7 | 0 | 81 | 7 | 0 / 0 | 0 | 16 (10 inf, 0 main) | 40 | 257 | 9.1 |
| aura-t0 | ninja demo, streak 0, idle | 60.6 | 4.2 | 1 | 32.3 | 11.6 | 82 | 8 | 0 / 0 | 0 | 4 (3 inf, 0 main) | 40 | 447 | 9.4 |
| aura-t0 | ninja demo, streak 0, idle | 60.8 | 1 | 0.2 | 24.8 | 0 | 80 | 6 | 0 / 0 | 0 | 4 (3 inf, 0 main) | 40 | 447 | 9.5 |
| aura-t3 | ninja demo, streak 10, idle | 60.5 | 6.3 | 1.8 | 33.3 | 14.6 | 84 | 11 | 0 / 99 | 0 | 60 (49 inf, 0 main) | 40 | 313 | 9.2 |
| aura-t3 | ninja demo, streak 10, idle | 60.9 | 4 | 1.5 | 24.9 | 0 | 82 | 11 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 40 | 303 | 9.2 |
| settled | before stress | 60.5 | 4.1 | 1.8 | 24.3 | 0 | 83 | 11 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 40 | 303 | 9.4 |
| stress | strike 1/150 | 60.5 | 13.4 | 4.3 | 60.9 | 0 | 85 | 11 | 0 / 0 | 0 | 63 (49 inf, 0 main) | 40 | 351 | 9.6 |
| stress | strike 66/150 | 61.5 | 82.7 | 8.8 | 115.7 | 190.9 | 130 | 22 | 176 / 290 | 35 | 81 (55 inf, 0 main) | 40 | 532 | 10.5 |
| stress | strike 131/150 | 60.6 | 83.5 | 8.6 | 115.1 | 188.5 | 130 | 23 | 285 / 291 | 37 | 73 (49 inf, 0 main) | 40 | 518 | 9.8 |
| stress | last strike | 61 | 71.5 | 7.7 | 108.6 | 173.3 | 123 | 21 | 212 / 277 | 26 | 73 (55 inf, 0 main) | 40 | 541 | 10.4 |
| settled | 10 s after the stress | 60.3 | 3.9 | 1.3 | 22.3 | 0 | 83 | 11 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 40 | 303 | 9.4 |
| settled | map after the stress | 60.2 | 1.4 | 0.3 | 20.3 | 0 | 81 | 9 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 40 | 352 | 9.2 |

## Levels

| level | kind | secs | finished | max streak | streak at end | stuck |
|---|---|---|---|---|---|---|
| w1-2 | firstsound | 70 | yes | 8 | 8 |  |
| w1-3 | firstsound | 61 | yes | 16 | 16 |  |
| w1-4 | dojo | 79 | yes | 21 | 5 |  |
| w1-5 | dojo | 68 | yes | 15 | 15 |  |
| w1-6 | battle | 25 | yes | 25 | 25 |  |
| w1-7 | soundhunt | 90 | yes | 27 | 7 |  |
| w1-8 | swap | 52 | yes | 19 | 19 |  |
| w1-9 | run | 48 | yes | 25 | 25 |  |
| w1-10 | firstsound | 107 | yes | 37 | 3 |  |
| w1-11 | soundhunt | 83 | yes | 11 | 11 |  |
| w1-12 | swap | 134 | yes | 21 | 15 |  |
| w1-13 | battle | 27 | yes | 27 | 27 |  |

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
  "100ms at http://127.0.0.1:4401/assets/play-DkLKsdi-.js:1:971": 1
 },
 "mods": {
  "visemeListeners": 1,
  "bufferCache": 139,
  "captionListeners": 3,
  "clipListeners": 0,
  "sayListeners": 1,
  "music": 1,
  "speaking": 0,
  "decodedLruMB": 40,
  "musicDecks": 2,
  "storeListeners": 4,
  "attemptSubs": 0,
  "saveBytes": 3122,
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
  "streakN": 27,
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

