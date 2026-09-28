# Soak soak-phone

4 levels in one page (reloads: none), fast=2, phone emulation (844×390, DPR 3), CPU throttled 4×, served none from http://127.0.0.1:4744. Longest streak: 41. Page errors: 0.

## Budgets: **FAIL** (2: flowerMain, stressAfter)

docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §11.1 and docs/PERF.md §5. "n/a": not judged on this run. Owners are the fix plan's lanes; an offending animation names the file that defines it.

| result | when | check | budget | measured | owner |
|---|---|---|---|---|---|
| pass | after each level, back on the map (GC'd) | DOM nodes (CDP, attached + detached) | ≤ start + 600 (839) | start 239, worst 305 (after w6-2) | all |
| pass | after each level, back on the map (GC'd) | JS heap, MB | ≤ start + 8 (13.3) | start 5.3, worst 10 (after w6-2) | all |
| pass | after each level, back on the map (GC'd) | event listeners | ≤ start + 40 (292) | start 252, worst 256 (after w6-br1) | all |
| pass | after each level, back on the map (GC'd) | animations on the map | ≤ start + 5 (34) | start 29, worst 29 (after start) | all |
| pass | after each level, back on the map (GC'd) | live intervals | ≤ start + 1 (2) | start 1, worst 1 (after start) | all |
| pass | after each level, back on the map (GC'd) | particles on the canvas | ≤ 5 | start 0, worst 2 (after w6-1) | F1 |
| pass | after each level, back on the map (GC'd) | nodes in the fx layer | ≤ 0 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | rAF requests/s on the still map | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | live decoded audio, MB | ≤ 64 | start 1, worst 40 (after w6-2) | F1, B1 |
| pass | after each level, back on the map (GC'd) | Web Audio nodes (AudioHandlers) | ≤ start + 8 (19) | start 11, worst 11 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | &lt;audio> elements alive | ≤ start + 2 (4) | start 2, worst 2 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | window.__snNavLog entries | ≤ 500 | start 0, worst 48 (after w6-2) | F3 |
| pass | after each level, back on the map (GC'd) | the save's adjustLog entries | ≤ 200 | start 0, worst 0 (after start) | F1 |
| pass | on the title, untouched for 5 s | live decoded audio, MB | ≤ 2 | 0.7 MB in 2 clips | B1 |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations the compositor can't run | ≤ 2 | max 0; over in 0 of 31 samples | F1, B, C, D (by file) |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations running on hidden elements | ≤ 2 | max 0; over in 0 of 31 samples | F1, D2 (by file) |
| pass | the still map, 60 s untouched | rAF requests/s, median | ≤ 5 | 0 (max 0); main thread 1.4 % | F1, B1 |
| pass | a held Next (a reward), 40 s untouched, the idle nudge included | rAF requests/s, median | ≤ 5 | 4.4 (max 14); main thread 4.5 % | F1, F3 (nav.tsx), B1 |
| pass | phone ×4, while playing | every screen's median fps | ≥ 50 | lowest reward:w6-br1 (60.4) | D5 (the runner); otherwise the screen's owner |
| pass | phone ×4, the still map | main thread %, median | ≤ 5 % | 1.4 % | F1 |
| pass | phone ×4, a held Next (a reward), the idle nudge included | main thread %, median | ≤ 6 % | 4.5 % (5.6, 5.2, 3.8, 3.5) | F1 (the ninja), F3 (the nudge), B1 (the reward) |
| pass | phone ×4, the ninja standing still | main thread % at streak 0, mean | ≤ 6 % | 2.7 % (4.2, 1.2) | F1 |
| pass | phone ×4, the ninja standing still | main thread % at streak 10, mean | ≤ 14 % | 5.9 % (7.5, 4.2) | F1 |
| **FAIL** | phone ×4, the World Flower | main thread %, median | ≤ 30 % | 33.4 % over 2 samples (39.7, 27) | B2 |
| pass | phone ×4, the World Flower | longest task, ms | ≤ 120 ms | 0 ms | B2 |
| pass | the strike stress (150 streak-10 strikes, 7 a second) | particles at the peak | ≤ 350 | 225 (fx nodes 82) | F1 |
| **FAIL** | 10 s after the stress | particles / fx nodes left | 0 / 0 | 1 / 0 | F1 |
| pass | the whole soak | page reloads | 0 | 0 | all |
| pass | the whole soak | levels the bot finished | all | 4 of 4 | the scene's owner (or bot.ts) |

## After each level (on the map, after a forced GC)

| metric | start | per level → | last | slope / level | budget |
|---|---|---|---|---|---|
| heapMB | 5.3 | 5.3 8.1 8.4 9.9 10 | 10 | 1.12 | ok (≤ start + 8 (13.3)) |
| nodes | 239 | 239 245 260 295 305 | 305 | 18.2 | ok (≤ start + 600 (839)) |
| detachedNodes | 76 | 76 89 94 119 119 | 119 | 11.6 |  |
| attachedNodes | 163 | 163 156 166 176 186 | 186 | 6.6 |  |
| listeners | 252 | 252 256 256 256 256 | 256 | 0.8 | ok (≤ start + 40 (292)) |
| globalListeners | 20 | 20 32 32 32 32 | 32 | 2.4 |  |
| animations | 29 | 29 21 21 21 21 | 21 | -1.6 | ok (≤ start + 5 (34)) |
| animInfinite | 9 | 9 6 6 6 6 | 6 | -0.6 |  |
| animHiddenInfinite | 0 | 0 0 0 0 0 | 0 | 0 |  |
| animMainThreadInfinite | 0 | 0 0 0 0 0 | 0 | 0 |  |
| fxDomNodes | 0 | 0 0 0 0 0 | 0 | 0 | ok (≤ 0) |
| particles | 0 | 0 1 1 2 1 | 1 | 0.3 | ok (≤ 5) |
| rafPerSec | 0 | 0 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| intervals | 1 | 1 1 1 1 1 | 1 | 0 | ok (≤ start + 1 (2)) |
| pendingTimeouts | 1 | 1 0 0 0 0 | 0 | -0.2 |  |
| mediaAlive | 2 | 2 2 2 2 2 | 2 | 0 | ok (≤ start + 2 (4)) |
| decodedMB | 1 | 1 17.5 22 39.9 40 | 40 | 10.04 | ok (≤ 64) |
| decodedTotalMB | 1 | 1 17.5 22 50.9 53.6 | 53.6 | 13.86 |  |
| decodedClips | 2 | 2 52 70 108 110 | 110 | 27.2 |  |
| audioHandlers | 11 | 11 11 11 11 11 | 11 | 0 | ok (≤ start + 8 (19)) |
| arrayBuffers | 10 | 10 60 78 116 118 | 118 | 27.2 |  |
| layoutObjects | 178 | 178 172 182 214 224 | 224 | 13.4 |  |
| navLog | 0 | 0 9 10 47 48 | 48 | 13.4 | ok (≤ 500) |
| adjustLog | 0 | 0 0 0 0 0 | 0 | 0 | ok (≤ 200) |
| imagesFetched | 56 | 56 64 68 94 96 | 96 | 11 |  |
| audioFetched | 3 | 3 55 73 138 149 | 149 | 37.5 |  |
| imgInDomMB | 18 | 18 13 13 13 13 | 13 | -1 |  |
| rendererRssMB | 553 | 553 872 938 1076 1110 | 1110 | 131.8 |  |
| gpuRssMB | 81 | 81 90 95 97 98 | 98 | 4.1 |  |
| footprintMB | 106.6 | 106.6 171.8 223.7 320 349.5 | 349.5 | 63.4 |  |
| gpuFootprintMB | 15.1 | 15.1 14 14.5 15.1 15.1 | 15.1 | 0.11 |  |
| mem_blink_gc | 6.5 | 6.5 18.1 26.2 33.9 38.9 | 38.9 | 8.06 |  |
| mem_blink_objects | 2.2 | 2.2 3 3.2 4.3 4.2 | 4.2 | 0.53 |  |
| mem_canvas | 3.5 | 3.5 3.7 3.8 3.8 3.8 | 3.8 | 0.07 |  |
| mem_cc | 258.2 | 258.2 495.3 505 519.3 503.8 | 503.8 | 51.52 |  |
| mem_discardable | 283.4 | 283.4 482.7 491.1 510.9 499.8 | 499.8 | 46.1 |  |
| mem_malloc | 62.1 | 62.1 52.5 59.1 74.1 74.4 | 74.4 | 4.62 |  |
| mem_media | 2.4 | 2.4 2.2 2.2 2.2 2.2 | 2.2 | -0.04 |  |
| mem_mojo | 0 | 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_images | 0 | 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_strings | 0 | 0 0 0 0 0 | 0 | 0 |  |
| mem_partition_alloc | 30.8 | 30.8 91.1 130.8 211.4 242.3 | 242.3 | 54.33 |  |
| mem_shared_memory | 309.9 | 309.9 519.7 530.7 554.8 538.8 | 538.8 | 49.29 |  |
| mem_site_storage | 0 | 0 0 0 0 0 | 0 | 0 |  |
| mem_skia | 0.5 | 0.5 2.2 2.6 2 3.7 | 3.7 | 0.62 |  |
| mem_v8 | 7.6 | 7.6 10.8 11.1 12.7 13.1 | 13.1 | 1.29 |  |
| mem_web_cache | 1.2 | 1.2 0.9 0.9 1 1 | 1 | -0.03 |  |

## While playing (periodic samples): first half vs second half

| metric | first half | second half |
|---|---|---|
| fps | 60.5 | 60.7 |
| slowFramePct | 0.2 | 0 |
| mainThreadPct | 31.8 | 32.4 |
| scriptPct | 3.8 | 3.1 |
| stylePct | 4.9 | 5.7 |
| layoutPct | 0.7 | 0.5 |
| recalcPerSec | 102.7 | 85.4 |
| layoutPerSec | 16.4 | 15.4 |
| rendererPct | 98.1 | 98.3 |
| gpuPct | 14.5 | 16 |
| longTaskMs | 5.5 | 0 |
| rafPerSec | 114.6 | 105.2 |
| rafPerFrame | 1.6 | 1.3 |
| animHiddenInfinite | 0 | 0 |
| animMainThreadInfinite | 0 | 0 |
| animations | 48.2 | 72.1 |
| animInfinite | 31.4 | 53.4 |
| particles | 26.9 | 7.2 |
| particlesPeak | 108.8 | 142.6 |

## Phases (the title, the still map, a held Next, the ninja's aura, the strike stress)

| phase | what | fps | main % | style % | recalcs/s | rAF/s | renderer CPU % | GPU CPU % | particles (now / peak) | fx nodes | animations | decoded MB | Nodes | heap MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| title | the title, 5 s, untouched | 60.3 | 2.4 | 0.8 | 21.2 | 1.5 | 83 | 19 | 0 / 0 | 0 | 28 (21 inf, 0 main) | 0.7 | 180 | 5.2 |
| idle-map | map | 61 | 1.1 | 0.2 | 23.8 | 0 | 81 | 6 | 1 / 0 | 0 | 21 (6 inf, 0 main) | 40 | 305 | 9.9 |
| idle-map | map | 60.3 | 1.4 | 0.3 | 23.6 | 0 | 82 | 8 | 1 / 0 | 0 | 21 (6 inf, 0 main) | 40 | 305 | 10 |
| idle-map | map | 60.9 | 1.4 | 0.3 | 23.8 | 0 | 82 | 8 | 1 / 0 | 0 | 21 (6 inf, 0 main) | 40 | 305 | 10.1 |
| idle-map | map | 60.3 | 1.5 | 0.3 | 23.8 | 0 | 82 | 8 | 1 / 0 | 0 | 21 (6 inf, 0 main) | 40 | 305 | 10.2 |
| idle-map | map | 61 | 1.4 | 0.3 | 23.7 | 0 | 82 | 8 | 1 / 0 | 0 | 21 (6 inf, 0 main) | 40 | 305 | 10.3 |
| idle-map | map | 60.9 | 1.5 | 0.4 | 23.7 | 0 | 82 | 8 | 1 / 0 | 0 | 21 (6 inf, 0 main) | 40 | 305 | 10.4 |
| settled | after soak | 60.1 | 1 | 0.3 | 20.4 | 0 | 80 | 6 | 1 / 0 | 0 | 21 (6 inf, 0 main) | 40 | 305 | 10 |
| settled | the reward (w6-2), Next ready | 60.6 | 10.3 | 1.1 | 60.1 | 0 | 85 | 8 | 1 / 0 | 0 | 16 (7 inf, 0 main) | 39.6 | 376 | 10 |
| idle-next | the reward (w6-2), a held Next, untouched | 60.9 | 5.6 | 0.7 | 31 | 14 | 83 | 8 | 1 / 56 | 0 | 18 (8 inf, 0 main) | 39.9 | 379 | 9.9 |
| idle-next | the reward (w6-2), a held Next, untouched | 61.1 | 5.2 | 0.7 | 30.4 | 8.7 | 83 | 9 | 1 / 0 | 0 | 16 (8 inf, 0 main) | 39.9 | 389 | 10 |
| idle-next | the reward (w6-2), a held Next, untouched | 61 | 3.8 | 0.6 | 24.7 | 0 | 82 | 9 | 1 / 0 | 0 | 16 (8 inf, 0 main) | 39.9 | 379 | 9.9 |
| idle-next | the reward (w6-2), a held Next, untouched | 60.8 | 3.5 | 0.5 | 24.8 | 0 | 81 | 8 | 1 / 0 | 0 | 16 (8 inf, 0 main) | 39.9 | 379 | 9.9 |
| aura-t0 | ninja demo, streak 0, idle | 60.4 | 4.2 | 0.9 | 30.8 | 8.5 | 82 | 8 | 1 / 0 | 0 | 4 (3 inf, 0 main) | 39.9 | 408 | 10.1 |
| aura-t0 | ninja demo, streak 0, idle | 60.7 | 1.2 | 0.3 | 24.5 | 0 | 80 | 6 | 1 / 0 | 0 | 4 (3 inf, 0 main) | 39.9 | 408 | 10.2 |
| aura-t3 | ninja demo, streak 10, idle | 60.6 | 7.5 | 2.3 | 34.4 | 15 | 84 | 11 | 1 / 99 | 0 | 60 (49 inf, 0 main) | 39.9 | 366 | 10.1 |
| aura-t3 | ninja demo, streak 10, idle | 60.2 | 4.2 | 1.6 | 24.5 | 0 | 82 | 11 | 1 / 0 | 0 | 60 (49 inf, 0 main) | 39.9 | 356 | 10 |
| settled | before stress | 60.9 | 4.6 | 1.7 | 23.3 | 0 | 82 | 11 | 1 / 0 | 0 | 60 (49 inf, 0 main) | 39.9 | 356 | 10.2 |
| stress | strike 1/150 | 60.4 | 14 | 4.7 | 60.6 | 0 | 84 | 11 | 1 / 0 | 0 | 63 (49 inf, 0 main) | 39.9 | 408 | 10.5 |
| stress | strike 67/150 | 60.4 | 81.8 | 8.6 | 117.4 | 197.9 | 128 | 22 | 225 / 277 | 35 | 75 (55 inf, 0 main) | 39.9 | 532 | 10.6 |
| stress | strike 132/150 | 61.4 | 85.2 | 8.7 | 113.6 | 187.1 | 129 | 22 | 188 / 283 | 45 | 77 (49 inf, 0 main) | 39.9 | 565 | 11.6 |
| stress | last strike | 61 | 72 | 7.7 | 105 | 158 | 123 | 20 | 158 / 259 | 76 | 82 (49 inf, 0 main) | 39.9 | 822 | 11.1 |
| settled | 10 s after the stress | 60.9 | 4.5 | 1.7 | 22.8 | 0 | 82 | 11 | 1 / 0 | 0 | 60 (49 inf, 0 main) | 39.9 | 356 | 10.3 |
| settled | map after the stress | 60.3 | 3.4 | 0.7 | 30.8 | 15.9 | 82 | 8 | 1 / 0 | 0 | 32 (12 inf, 0 main) | 39.9 | 294 | 10.2 |

## Levels

| level | kind | secs | finished | max streak | streak at end | stuck |
|---|---|---|---|---|---|---|
| w6-br1 | sort | 57 | yes | 8 | 8 |  |
| w6-br2 | sort | 36 | yes | 16 | 16 |  |
| w6-1 | dojo | 104 | yes | 33 | 33 |  |
| w6-2 | sort | 39 | yes | 41 | 41 |  |

## Last boundary: what is still running

```
{
 "animations": {
  "total": 21,
  "running": 6,
  "infinite": 6,
  "hiddenInfinite": 0,
  "mainThreadInfinite": 0,
  "finishedKept": 15,
  "top": [
   [
    "@popin",
    14
   ],
   [
    "@petal-drift-l",
    4
   ],
   [
    "@petal-drift-r",
    2
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
  "window:pointerdown:capture": 3,
  "window:keydown:capture": 2,
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
  "100ms at http://127.0.0.1:4744/assets/play-D1mjPIN9.js:2:342": 1
 },
 "mods": {}
}
```

