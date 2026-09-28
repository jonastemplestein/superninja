# Soak soak-before

4 levels in one page (reloads: none), fast=2, phone emulation (844×390, DPR 3), CPU throttled 4×, served none from http://127.0.0.1:4821. Longest streak: 28. Page errors: 0.

## Budgets: **FAIL** (3: rafPerSec, idleRaf, idleNextRaf)

docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §11.1 and docs/PERF.md §5. "n/a": not judged on this run. Owners are the fix plan's lanes; an offending animation names the file that defines it.

| result | when | check | budget | measured | owner |
|---|---|---|---|---|---|
| pass | after each level, back on the map (GC'd) | DOM nodes (CDP, attached + detached) | ≤ start + 600 (848) | start 248, worst 358 (after w1-5) | all |
| pass | after each level, back on the map (GC'd) | JS heap, MB | ≤ start + 8 (17.1) | cold map 6.7, start 9.1 (after w1-2, the warm-up), worst 10.3 (after w1-5) | all |
| pass | after each level, back on the map (GC'd) | event listeners | ≤ start + 40 (346) | start 306, worst 310 (after w1-4) | all |
| pass | after each level, back on the map (GC'd) | animations on the map | ≤ start + 5 (34) | start 29, worst 29 (after start) | all |
| pass | after each level, back on the map (GC'd) | live intervals | ≤ start + 1 (2) | start 1, worst 1 (after start) | all |
| pass | after each level, back on the map (GC'd) | particles on the canvas | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | nodes in the fx layer | ≤ 0 | start 0, worst 0 (after start) | F1 |
| **FAIL** | after each level, back on the map (GC'd) | rAF requests/s on the still map | ≤ 5 | start 0, worst 59.8 (after w1-5); over after 2 of 5 boundaries, from w1-4 | F1 |
| pass | after each level, back on the map (GC'd) | live decoded audio, MB | ≤ 64 | start 1, worst 39.9 (after w1-4) | F1, B1 |
| pass | after each level, back on the map (GC'd) | Web Audio nodes (AudioHandlers) | ≤ start + 8 (19) | start 11, worst 11 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | &lt;audio> elements alive | ≤ start + 2 (4) | start 2, worst 2 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | window.__snNavLog entries | ≤ 500 | start 0, worst 61 (after w1-5) | F3 |
| pass | after each level, back on the map (GC'd) | the save's adjustLog entries | ≤ 200 | start 0, worst 0 (after start) | F1 |
| pass | on the title, untouched for 5 s | live decoded audio, MB | ≤ 2 | 0.7 MB in 2 clips | B1 |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations the compositor can't run | ≤ 2 | max 0; over in 0 of 29 samples | F1, B, C, D (by file) |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations running on hidden elements | ≤ 2 | max 0; over in 0 of 29 samples | F1, D2 (by file) |
| **FAIL** | the still map, 30 s untouched | rAF requests/s, median | ≤ 5 | 13.3 (max 14.4); main thread 3.7 % | F1, B1 |
| **FAIL** | a held Next (a reward), 30 s untouched, the idle nudge included | rAF requests/s, median | ≤ 5 | 9.6 (max 13.9); main thread 5.8 % | F1, F3 (nav.tsx), B1 |
| pass | phone ×4, while playing | every screen's median fps | ≥ 50 | lowest level:w1-3 (60.4) | D5 (the runner); otherwise the screen's owner |
| pass | phone ×4, the still map | main thread %, median | ≤ 5 % | 3.7 % | F1 |
| pass | phone ×4, a held Next (a reward), the idle nudge included | main thread %, median | ≤ 6 % | 5.8 % (6.1, 5.8, 3.3) | F1 (the ninja), F3 (the nudge), B1 (the reward) |
| pass | phone ×4, the ninja standing still | main thread % at streak 0, mean | ≤ 6 % | 2.8 % (4.1, 1.4) | F1 |
| pass | phone ×4, the ninja standing still | main thread % at streak 10, mean | ≤ 14 % | 7.2 % (9, 5.4) | F1 |
| pass | phone ×4, the World Flower | main thread %, median | ≤ 30 % | 26.4 % over 2 samples (16.7, 36) | B2 |
| pass | phone ×4, the World Flower | longest task, ms | ≤ 120 ms | 0 ms | B2 |
| pass | the strike stress (150 streak-10 strikes, 7 a second) | particles at the peak | ≤ 350 | 266 (fx nodes 86) | F1 |
| pass | 10 s after the stress | particles / fx nodes left | 0 / 0 | 0 / 0 | F1 |
| pass | the whole soak | page reloads | 0 | 0 | all |
| pass | the whole soak | levels the bot finished | all | 4 of 4 | the scene's owner (or bot.ts) |

## After each level (on the map, after a forced GC)

| metric | start | per level → | last | slope / level | budget |
|---|---|---|---|---|---|
| heapMB | 6.7 | 6.7 9.1 9.6 10.2 10.3 | 10.3 | 0.83 | ok (≤ start + 8 (17.1)) |
| nodes | 248 | 248 303 320 348 358 | 358 | 26.5 | ok (≤ start + 600 (848)) |
| detachedNodes | 78 | 78 123 130 148 148 | 148 | 16.5 |  |
| attachedNodes | 170 | 170 180 190 200 210 | 210 | 10 |  |
| listeners | 306 | 306 254 251 310 310 | 310 | 6.4 | ok (≤ start + 40 (346)) |
| globalListeners | 20 | 20 20 20 20 20 | 20 | 0 |  |
| animations | 29 | 29 29 29 29 29 | 29 | 0 | ok (≤ start + 5 (34)) |
| animInfinite | 9 | 9 9 9 9 9 | 9 | 0 |  |
| animHiddenInfinite | 0 | 0 0 0 0 0 | 0 | 0 |  |
| animMainThreadInfinite | 0 | 0 0 0 0 0 | 0 | 0 |  |
| fxDomNodes | 0 | 0 0 0 0 0 | 0 | 0 | ok (≤ 0) |
| particles | 0 | 0 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| rafPerSec | 0 | 0 0 0 45.8 59.8 | 59.8 | 16.54 | FAIL (≤ 5) |
| intervals | 1 | 1 1 1 1 1 | 1 | 0 | ok (≤ start + 1 (2)) |
| pendingTimeouts | 1 | 1 1 1 1 1 | 1 | 0 |  |
| mediaAlive | 2 | 2 2 2 2 2 | 2 | 0 | ok (≤ start + 2 (4)) |
| decodedMB | 1 | 1 26.8 34.4 39.9 39.5 | 39.5 | 9.01 | ok (≤ 64) |
| decodedTotalMB | 1 | 1 26.8 34.4 53 56 | 56 | 13.62 |  |
| decodedClips | 2 | 2 66 88 95 97 | 97 | 21.9 |  |
| audioHandlers | 11 | 11 11 10 11 11 | 11 | 0 | ok (≤ start + 8 (19)) |
| arrayBuffers | 10 | 10 74 96 103 105 | 105 | 21.9 |  |
| layoutObjects | 180 | 180 222 232 259 269 | 269 | 21.5 |  |
| navLog | 0 | 0 22 33 52 61 | 61 | 15.2 | ok (≤ 500) |
| adjustLog | 0 | 0 0 0 0 0 | 0 | 0 | ok (≤ 200) |
| imagesFetched | 58 | 58 78 89 89 89 | 89 | 7.3 |  |
| audioFetched | 3 | 3 69 91 132 140 | 140 | 33.7 |  |
| imgInDomMB | 18 | 18 18 18 18 18 | 18 | 0 |  |
| rendererRssMB | 440 | 440 822 924 971 1004 | 1004 | 127.7 |  |
| gpuRssMB | 84 | 84 90 91 104 104 | 104 | 5.4 |  |
| footprintMB | 88.7 | 88.7 166.2 210.5 239.8 268.4 | 268.4 | 43.3 |  |
| gpuFootprintMB | 15.1 | 15.1 13.8 13.9 14 14 | 14 | -0.2 |  |
| mem_blink_gc | 5.9 | 5.9 14.4 23.1 29.4 32.9 | 32.9 | 6.9 |  |
| mem_blink_objects | 2.1 | 2.1 3.3 4 4.1 4.2 | 4.2 | 0.5 |  |
| mem_canvas | 3.5 | 3.5 3.7 3.8 3.8 3.8 | 3.8 | 0.07 |  |
| mem_cc | 177.4 | 177.4 470.8 508.5 504.1 500.7 | 500.7 | 67.99 |  |
| mem_discardable | 199 | 199 472.4 513.4 508.8 506.3 | 506.3 | 65.1 |  |
| mem_malloc | 56.6 | 56.6 58.6 65.4 65.3 66 | 66 | 2.55 |  |
| mem_media | 2.4 | 2.4 2.4 2.4 2.4 2.4 | 2.4 | 0 |  |
| mem_mojo | 0 | 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_images | 0 | 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_strings | 0 | 0 0 0 0 0 | 0 | 0 |  |
| mem_partition_alloc | 18.4 | 18.4 83.2 121.4 153.2 174.8 | 174.8 | 38.28 |  |
| mem_shared_memory | 224.6 | 224.6 500.9 539.2 534.3 532 | 532 | 64.82 |  |
| mem_site_storage | 0 | 0 0 0 0 0 | 0 | 0 |  |
| mem_skia | 1.1 | 1.1 7 8.1 6.6 5.6 | 5.6 | 0.86 |  |
| mem_v8 | 8.5 | 8.5 11.3 12 12.5 12.6 | 12.6 | 0.94 |  |
| mem_web_cache | 1.7 | 1.7 1.8 1.7 1.7 1.7 | 1.7 | -0.01 |  |

## While playing (periodic samples): first half vs second half

| metric | first half | second half |
|---|---|---|
| fps | 60.6 | 60.5 |
| slowFramePct | 0 | 0.1 |
| mainThreadPct | 13.8 | 29.5 |
| scriptPct | 1.7 | 2.2 |
| stylePct | 2.1 | 5.7 |
| layoutPct | 0.2 | 0.3 |
| recalcPerSec | 60.2 | 60.8 |
| layoutPerSec | 5.4 | 9.5 |
| rendererPct | 87.9 | 90.8 |
| gpuPct | 10.6 | 25.5 |
| longTaskMs | 0 | 10.4 |
| rafPerSec | 68.8 | 78.4 |
| rafPerFrame | 1.1 | 1.2 |
| animHiddenInfinite | 0 | 0 |
| animMainThreadInfinite | 0 | 0 |
| animations | 23.5 | 68.1 |
| animInfinite | 13.3 | 49.4 |
| particles | 14 | 7 |
| particlesPeak | 76.1 | 110.3 |

## Phases (the title, the still map, a held Next, the ninja's aura, the strike stress)

| phase | what | fps | main % | style % | recalcs/s | rAF/s | renderer CPU % | GPU CPU % | particles (now / peak) | fx nodes | animations | decoded MB | Nodes | heap MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| title | the title, 5 s, untouched | 60.6 | 1.5 | 0.5 | 19.7 | 0 | 82 | 15 | 0 / 0 | 0 | 28 (21 inf, 0 main) | 0.7 | 177 | 5.2 |
| idle-map | map | 60.2 | 3.8 | 0.8 | 33.2 | 14.4 | 83 | 11 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 39.5 | 358 | 10.2 |
| idle-map | map | 60.6 | 3.7 | 0.8 | 32.4 | 13.3 | 82 | 12 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 39.5 | 372 | 10.5 |
| idle-map | map | 61.1 | 1.7 | 0.5 | 23.4 | 0 | 82 | 11 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 39.5 | 372 | 10.6 |
| settled | after soak | 60.4 | 1.6 | 0.5 | 20.9 | 0 | 83 | 11 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 39.5 | 344 | 10.1 |
| settled | the reward (w1-5), Next ready | 61 | 2.4 | 0.5 | 18.5 | 0 | 81 | 11 | 0 / 0 | 0 | 14 (6 inf, 0 main) | 39.6 | 368 | 10 |
| idle-next | the reward (w1-5), a held Next, untouched | 60.6 | 6.1 | 0.7 | 30.2 | 13.9 | 81 | 12 | 0 / 55 | 0 | 14 (7 inf, 0 main) | 40 | 381 | 10 |
| idle-next | the reward (w1-5), a held Next, untouched | 61 | 5.8 | 0.8 | 28.6 | 9.6 | 83 | 11 | 0 / 0 | 0 | 14 (7 inf, 0 main) | 40 | 383 | 10 |
| idle-next | the reward (w1-5), a held Next, untouched | 60.6 | 3.3 | 0.4 | 18.8 | 0 | 82 | 10 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 40 | 371 | 10 |
| aura-t0 | ninja demo, streak 0, idle | 60.1 | 4.1 | 0.8 | 22 | 0 | 84 | 10 | 0 / 0 | 0 | 4 (3 inf, 0 main) | 40 | 429 | 10.1 |
| aura-t0 | ninja demo, streak 0, idle | 61.1 | 1.4 | 0.3 | 22.4 | 0 | 81 | 9 | 0 / 0 | 0 | 4 (3 inf, 0 main) | 40 | 429 | 10.2 |
| aura-t3 | ninja demo, streak 10, idle | 61.1 | 9 | 2.6 | 32.6 | 14.8 | 85 | 15 | 0 / 99 | 0 | 60 (49 inf, 0 main) | 40 | 377 | 10.1 |
| aura-t3 | ninja demo, streak 10, idle | 60.7 | 5.4 | 2 | 24.7 | 0 | 83 | 15 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 40 | 377 | 10 |
| settled | before stress | 60.3 | 5.5 | 1.7 | 21.7 | 0 | 84 | 14 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 40 | 377 | 10.2 |
| stress | strike 1/150 | 59.3 | 14.9 | 4.8 | 56.7 | 0 | 88 | 14 | 0 / 0 | 0 | 63 (49 inf, 0 main) | 40 | 429 | 10.5 |
| stress | strike 62/150 | 59 | 85.4 | 9.3 | 81.8 | 154.9 | 136 | 27 | 237 / 244 | 40 | 80 (51 inf, 0 main) | 40 | 606 | 12 |
| stress | strike 123/150 | 60.3 | 86.5 | 9 | 81.6 | 165.6 | 138 | 28 | 246 / 276 | 29 | 77 (55 inf, 0 main) | 40 | 664 | 12.4 |
| stress | last strike | 61.1 | 80 | 8.8 | 79 | 143.6 | 135 | 27 | 198 / 257 | 26 | 72 (55 inf, 0 main) | 40 | 774 | 11.4 |
| settled | 10 s after the stress | 60.3 | 4.5 | 2 | 21.7 | 0 | 84 | 14 | 0 / 0 | 0 | 63 (49 inf, 0 main) | 40 | 377 | 10.4 |
| settled | map after the stress | 60.4 | 4 | 0.7 | 31.6 | 18.3 | 84 | 11 | 0 / 0 | 0 | 32 (12 inf, 0 main) | 40 | 355 | 10.3 |

## Levels

| level | kind | secs | finished | max streak | streak at end | stuck |
|---|---|---|---|---|---|---|
| w1-2 | firstsound | 96 | yes | 4 | 3 |  |
| w1-3 | firstsound | 75 | yes | 11 | 11 |  |
| w1-4 | dojo | 64 | yes | 18 | 18 |  |
| w1-5 | dojo | 46 | yes | 28 | 28 |  |

## Last boundary: what is still running

```
{
 "animations": {
  "total": 29,
  "running": 9,
  "infinite": 9,
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
    3
   ],
   [
    "@petal-drift-r",
    3
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
  "window:orientationchange": 1
 },
 "intervals": {
  "100ms at http://127.0.0.1:4821/assets/play-CY0q5zMa.js:2:971": 1
 },
 "mods": {
  "visemeListeners": 1,
  "bufferCache": 97,
  "captionListeners": 3,
  "clipListeners": 3,
  "sayListeners": 2,
  "music": 1,
  "speaking": 0,
  "decodedLruMB": 39.5,
  "musicDecks": 2,
  "storeListeners": 4,
  "attemptSubs": 0,
  "saveBytes": 5181,
  "adjustLog": 0,
  "poseSubs": 1,
  "particles": 0,
  "particleKinds": {},
  "glowCache": 16,
  "helpStack": 1,
  "nudgeListeners": 1,
  "uprightSubs": 1,
  "imgCache": 2,
  "fxDomChildren": 0,
  "streakListeners": 1,
  "streakSubs": 0,
  "streakN": 28,
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

