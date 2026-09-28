# Soak soak

4 levels in one page (reloads: none), fast=2, phone emulation (844×390, DPR 3), CPU throttled 4×, served prod from http://127.0.0.1:4821 (snapshot built 2026-09-27T18:52:49.347Z). Longest streak: 15. Page errors: 0.

## Budgets: **FAIL** (4: rafPerSec, idleRaf, idleNextRaf, idleNextMain)

docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §11.1 and docs/PERF.md §5. "n/a": not judged on this run. Owners are the fix plan's lanes; an offending animation names the file that defines it.

| result | when | check | budget | measured | owner |
|---|---|---|---|---|---|
| pass | after each level, back on the map (GC'd) | DOM nodes (CDP, attached + detached) | ≤ start + 600 (848) | start 248, worst 358 (after w1-5) | all |
| pass | after each level, back on the map (GC'd) | JS heap, MB | ≤ start + 8 (14.7) | start 6.7, worst 10.4 (after w1-5) | all |
| pass | after each level, back on the map (GC'd) | event listeners | ≤ start + 40 (346) | start 306, worst 306 (after start) | all |
| pass | after each level, back on the map (GC'd) | animations on the map | ≤ start + 5 (34) | start 29, worst 33 (after w1-5) | all |
| pass | after each level, back on the map (GC'd) | live intervals | ≤ start + 1 (2) | start 1, worst 1 (after start) | all |
| pass | after each level, back on the map (GC'd) | particles on the canvas | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | nodes in the fx layer | ≤ 0 | start 0, worst 0 (after start) | F1 |
| **FAIL** | after each level, back on the map (GC'd) | rAF requests/s on the still map | ≤ 5 | start 0, worst 46.7 (after w1-3); over after 3 of 5 boundaries, from w1-3 | F1 |
| pass | after each level, back on the map (GC'd) | live decoded audio, MB | ≤ 64 | start 1, worst 39.6 (after w1-4) | F1, B1 |
| pass | after each level, back on the map (GC'd) | Web Audio nodes (AudioHandlers) | ≤ start + 8 (19) | start 11, worst 11 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | &lt;audio> elements alive | ≤ start + 2 (4) | start 2, worst 2 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | window.__snNavLog entries | ≤ 500 | start 0, worst 73 (after w1-5) | F3 |
| pass | after each level, back on the map (GC'd) | the save's adjustLog entries | ≤ 200 | start 0, worst 0 (after start) | F1 |
| pass | on the title, untouched for 5 s | live decoded audio, MB | ≤ 2 | 0.7 MB in 2 clips | B1 |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations the compositor can't run | ≤ 2 | max 0; over in 0 of 34 samples | F1, B, C, D (by file) |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations running on hidden elements | ≤ 2 | max 0; over in 0 of 34 samples | F1, D2 (by file) |
| **FAIL** | the still map, 30 s untouched | rAF requests/s, median | ≤ 5 | 8.1 (max 9.9); main thread 2.4 % | F1, B1 |
| **FAIL** | a held Next (a reward), 30 s untouched, the idle nudge included | rAF requests/s, median | ≤ 5 | 9.6 (max 14.5); main thread 6.3 % | F1, F3 (nav.tsx), B1 |
| pass | phone ×4, while playing | every screen's median fps | ≥ 50 | lowest reward:w1-4 (59.5) | D5 (the runner); otherwise the screen's owner |
| pass | phone ×4, the still map | main thread %, median | ≤ 5 % | 2.4 % | F1 |
| **FAIL** | phone ×4, a held Next (a reward), the idle nudge included | main thread %, median | ≤ 6 % | 6.3 % (6.7, 6.3, 4.2) | F1 (the ninja), F3 (the nudge), B1 (the reward) |
| pass | phone ×4, the ninja standing still | main thread % at streak 0, mean | ≤ 6 % | 2.5 % (3.7, 1.3) | F1 |
| pass | phone ×4, the ninja standing still | main thread % at streak 10, mean | ≤ 14 % | 7.4 % (9.1, 5.6) | F1 |
| pass | phone ×4, the World Flower | main thread %, median | ≤ 30 % | 27.1 % over 2 samples (24.8, 29.3) | B2 |
| pass | phone ×4, the World Flower | longest task, ms | ≤ 120 ms | 55 ms | B2 |
| pass | the strike stress (150 streak-10 strikes, 7 a second) | particles at the peak | ≤ 350 | 282 (fx nodes 89) | F1 |
| pass | 10 s after the stress | particles / fx nodes left | 0 / 0 | 0 / 0 | F1 |
| pass | the whole soak | page reloads | 0 | 0 | all |
| pass | the whole soak | levels the bot finished | all | 4 of 4 | the scene's owner (or bot.ts) |

## After each level (on the map, after a forced GC)

| metric | start | per level → | last | slope / level | budget |
|---|---|---|---|---|---|
| heapMB | 6.7 | 6.7 9.2 9.7 10.2 10.4 | 10.4 | 0.84 | ok (≤ start + 8 (14.7)) |
| nodes | 248 | 248 304 333 346 358 | 358 | 26.2 | ok (≤ start + 600 (848)) |
| detachedNodes | 78 | 78 124 135 138 138 | 138 | 13.4 |  |
| attachedNodes | 170 | 170 180 198 208 220 | 220 | 12.8 |  |
| listeners | 306 | 306 252 282 282 282 | 282 | -1.8 | ok (≤ start + 40 (346)) |
| globalListeners | 20 | 20 20 20 20 20 | 20 | 0 |  |
| animations | 29 | 29 29 32 32 33 | 33 | 1.1 | ok (≤ start + 5 (34)) |
| animInfinite | 9 | 9 9 12 12 13 | 13 | 1.1 |  |
| animHiddenInfinite | 0 | 0 0 0 0 0 | 0 | 0 |  |
| animMainThreadInfinite | 0 | 0 0 0 0 0 | 0 | 0 |  |
| fxDomNodes | 0 | 0 0 0 0 0 | 0 | 0 | ok (≤ 0) |
| particles | 0 | 0 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| rafPerSec | 0 | 0 0 46.7 44.8 46.6 | 46.6 | 13.8 | FAIL (≤ 5) |
| intervals | 1 | 1 1 1 1 1 | 1 | 0 | ok (≤ start + 1 (2)) |
| pendingTimeouts | 1 | 1 1 2 2 2 | 2 | 0.3 |  |
| mediaAlive | 2 | 2 2 2 2 2 | 2 | 0 | ok (≤ start + 2 (4)) |
| decodedMB | 1 | 1 25.5 32.7 39.6 39.5 | 39.5 | 9.11 | ok (≤ 64) |
| decodedTotalMB | 1 | 1 25.5 32.7 53.7 57.2 | 57.2 | 14.06 |  |
| decodedClips | 2 | 2 61 82 94 93 | 93 | 21.5 |  |
| audioHandlers | 11 | 11 11 11 11 11 | 11 | 0 | ok (≤ start + 8 (19)) |
| arrayBuffers | 10 | 10 69 90 102 101 | 101 | 21.5 |  |
| layoutObjects | 180 | 180 222 243 256 269 | 269 | 21.2 |  |
| navLog | 0 | 0 22 33 60 73 | 73 | 18.4 | ok (≤ 500) |
| adjustLog | 0 | 0 0 0 0 0 | 0 | 0 | ok (≤ 200) |
| imagesFetched | 58 | 58 78 88 88 88 | 88 | 7 |  |
| audioFetched | 3 | 3 64 85 131 138 | 138 | 33.7 |  |
| imgInDomMB | 18 | 18 18 17.8 17.8 17.8 | 17.8 | -0.06 |  |
| rendererRssMB | 439 | 439 825 929 988 1022 | 1022 | 132.9 |  |
| gpuRssMB | 85 | 85 91 93 103 107 | 107 | 5.6 |  |
| footprintMB | 89.2 | 89.2 163.5 211.3 250.5 279.5 | 279.5 | 46.76 |  |
| gpuFootprintMB | 16.4 | 16.4 15.1 15.1 15.4 15.5 | 15.5 | -0.15 |  |
| mem_blink_gc | 5.9 | 5.9 17.2 24.3 30.6 33.7 | 33.7 | 6.9 |  |
| mem_blink_objects | 2.1 | 2.1 3.3 4 4.1 4 | 4 | 0.46 |  |
| mem_canvas | 3.5 | 3.5 3.7 3.8 3.8 3.8 | 3.8 | 0.07 |  |
| mem_cc | 177.5 | 177.5 476 504.5 501.6 495.8 | 495.8 | 66.22 |  |
| mem_discardable | 196.6 | 196.6 477.2 513.3 506.6 505.6 | 505.6 | 64.74 |  |
| mem_malloc | 56.9 | 56.9 55.4 66.1 64.7 65.5 | 65.5 | 2.65 |  |
| mem_media | 2.4 | 2.4 2.4 2.4 2.4 2.4 | 2.4 | 0 |  |
| mem_mojo | 0 | 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_images | 0 | 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_strings | 0 | 0 0 0 0 0 | 0 | 0 |  |
| mem_partition_alloc | 18.2 | 18.2 81.2 118.3 157.6 184.9 | 184.9 | 40.98 |  |
| mem_shared_memory | 222.3 | 222.3 503.6 539.2 532.5 532.3 | 532.3 | 64.89 |  |
| mem_site_storage | 0 | 0 0 0 0 0 | 0 | 0 |  |
| mem_skia | 0.3 | 0.3 6.4 8.8 6.4 5.2 | 5.2 | 0.98 |  |
| mem_v8 | 8.4 | 8.4 11.4 12.1 12.6 12.7 | 12.7 | 0.98 |  |
| mem_web_cache | 1.7 | 1.7 1.7 1.7 1.8 1.8 | 1.8 | 0.03 |  |

## While playing (periodic samples): first half vs second half

| metric | first half | second half |
|---|---|---|
| fps | 60.7 | 60.4 |
| slowFramePct | 0 | 0.4 |
| mainThreadPct | 21.2 | 24.3 |
| scriptPct | 2.3 | 2.3 |
| stylePct | 3.7 | 4.3 |
| layoutPct | 0.2 | 0.3 |
| recalcPerSec | 60.6 | 61.6 |
| layoutPerSec | 6.5 | 9.5 |
| rendererPct | 93.1 | 94.4 |
| gpuPct | 16.8 | 16.1 |
| longTaskMs | 8.5 | 0 |
| rafPerSec | 71.9 | 83.1 |
| rafPerFrame | 1.1 | 1.3 |
| animHiddenInfinite | 0 | 0 |
| animMainThreadInfinite | 0 | 0 |
| animations | 40.4 | 42.9 |
| animInfinite | 26.5 | 27.8 |
| particles | 7.1 | 12.3 |
| particlesPeak | 83.6 | 101.5 |

## Phases (the title, the still map, a held Next, the ninja's aura, the strike stress)

| phase | what | fps | main % | style % | recalcs/s | rAF/s | renderer CPU % | GPU CPU % | particles (now / peak) | fx nodes | animations | decoded MB | Nodes | heap MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| title | the title, 5 s, untouched | 60.2 | 1.9 | 0.7 | 19.7 | 0 | 81 | 17 | 0 / 0 | 0 | 28 (21 inf, 0 main) | 0.7 | 177 | 5.2 |
| idle-map | map | 60.9 | 2.7 | 0.6 | 26 | 8.1 | 82 | 13 | 0 / 0 | 0 | 33 (13 inf, 0 main) | 39.5 | 358 | 10.3 |
| idle-map | map | 60.5 | 2.4 | 0.5 | 26.5 | 9.9 | 82 | 14 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.5 | 361 | 10.6 |
| idle-map | map | 60.4 | 1.8 | 0.5 | 23.6 | 0 | 82 | 13 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.5 | 361 | 10.7 |
| settled | after soak | 60.1 | 1.7 | 0.6 | 20.2 | 0 | 82 | 13 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.5 | 347 | 10.2 |
| settled | the reward (w1-5), Next ready | 61 | 3.4 | 0.7 | 19.8 | 0 | 83 | 10 | 0 / 0 | 0 | 16 (8 inf, 0 main) | 39.8 | 367 | 10.2 |
| idle-next | the reward (w1-5), a held Next, untouched | 60.5 | 6.7 | 1.3 | 31.1 | 14.5 | 83 | 9 | 0 / 61 | 0 | 16 (9 inf, 0 main) | 39.8 | 394 | 10.3 |
| idle-next | the reward (w1-5), a held Next, untouched | 60.4 | 6.3 | 1.3 | 30.6 | 9.6 | 84 | 9 | 0 / 0 | 0 | 16 (9 inf, 0 main) | 39.8 | 370 | 10.1 |
| idle-next | the reward (w1-5), a held Next, untouched | 60.5 | 4.2 | 0.9 | 24.7 | 0 | 82 | 9 | 0 / 0 | 0 | 16 (9 inf, 0 main) | 39.8 | 370 | 10.1 |
| aura-t0 | ninja demo, streak 0, idle | 60.8 | 3.7 | 0.8 | 26.3 | 0 | 84 | 10 | 0 / 0 | 0 | 4 (3 inf, 0 main) | 39.8 | 567 | 10.4 |
| aura-t0 | ninja demo, streak 0, idle | 60.8 | 1.3 | 0.3 | 24.6 | 0 | 81 | 8 | 0 / 0 | 0 | 4 (3 inf, 0 main) | 39.8 | 567 | 10.5 |
| aura-t3 | ninja demo, streak 10, idle | 60.5 | 9.1 | 2.7 | 33.4 | 15.2 | 87 | 13 | 0 / 99 | 0 | 60 (49 inf, 0 main) | 39.8 | 388 | 10.2 |
| aura-t3 | ninja demo, streak 10, idle | 61 | 5.6 | 2.1 | 24.7 | 0 | 84 | 14 | 0 / 0 | 0 | 63 (49 inf, 0 main) | 39.8 | 378 | 10.2 |
| settled | before stress | 60.7 | 5.2 | 2.1 | 21.3 | 0 | 85 | 14 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 39.8 | 378 | 10.4 |
| stress | strike 1/150 | 60.4 | 16.5 | 5.6 | 61.2 | 0.9 | 89 | 13 | 26 / 0 | 3 | 66 (51 inf, 0 main) | 39.8 | 435 | 10.7 |
| stress | strike 57/150 | 60.6 | 82.4 | 8.5 | 78.9 | 157.1 | 133 | 27 | 166 / 264 | 67 | 81 (49 inf, 0 main) | 39.8 | 592 | 10.6 |
| stress | strike 94/150 | 61 | 70.1 | 7.8 | 70.9 | 115.4 | 127 | 27 | 154 / 223 | 29 | 75 (55 inf, 0 main) | 39.8 | 410 | 10.5 |
| stress | strike 137/150 | 60.2 | 71.6 | 7 | 72.1 | 121.8 | 126 | 29 | 112 / 219 | 19 | 73 (49 inf, 0 main) | 39.8 | 577 | 10.9 |
| stress | last strike | 60.9 | 59.2 | 6.4 | 71.8 | 92.4 | 115 | 26 | 179 / 190 | 11 | 63 (49 inf, 0 main) | 39.8 | 455 | 10.4 |
| settled | 10 s after the stress | 61.1 | 4.4 | 1.5 | 22.2 | 0 | 75 | 17 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 39.8 | 378 | 10.6 |
| settled | map after the stress | 61 | 2.1 | 0.5 | 21.6 | 14.4 | 79 | 14 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.8 | 361 | 10.7 |

## Levels

| level | kind | secs | finished | max streak | streak at end | stuck |
|---|---|---|---|---|---|---|
| w1-2 | firstsound | 94 | yes | 8 | 8 |  |
| w1-3 | firstsound | 68 | yes | 15 | 15 |  |
| w1-4 | dojo | 94 | yes | 15 | 9 |  |
| w1-5 | dojo | 59 | yes | 15 | 9 |  |

## Last boundary: what is still running

```
{
 "animations": {
  "total": 33,
  "running": 13,
  "infinite": 13,
  "hiddenInfinite": 0,
  "mainThreadInfinite": 0,
  "finishedKept": 20,
  "top": [
   [
    "@popin",
    19
   ],
   [
    "@petal-drift-l",
    4
   ],
   [
    "@wave",
    3
   ],
   [
    "@petal-drift-r",
    2
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
    "@pulse",
    1
   ],
   [
    "@helptalk",
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
  "window:orientationchange": 1
 },
 "intervals": {
  "100ms at http://127.0.0.1:4821/assets/play-SN8NJbp_.js:2:971": 1
 },
 "mods": {
  "visemeListeners": 1,
  "bufferCache": 93,
  "captionListeners": 3,
  "clipListeners": 4,
  "sayListeners": 2,
  "music": 1,
  "speaking": 1,
  "decodedLruMB": 39.5,
  "musicDecks": 2,
  "storeListeners": 4,
  "attemptSubs": 0,
  "saveBytes": 5184,
  "adjustLog": 0,
  "poseSubs": 1,
  "particles": 0,
  "particleKinds": {},
  "glowCache": 17,
  "helpStack": 1,
  "nudgeListeners": 1,
  "uprightSubs": 1,
  "imgCache": 2,
  "fxDomChildren": 0,
  "streakListeners": 1,
  "streakSubs": 0,
  "streakN": 9,
  "owned": 0,
  "ownedConnected": 0,
  "busy": 0,
  "spotMounted": 0,
  "moveRunning": 0,
  "spotGen": 11,
  "navStack": 1,
  "navSubs": 2,
  "nudgeSubs": 0,
  "holds": 0,
  "narrateSubs": 0
 }
}
```

