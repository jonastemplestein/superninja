# Soak soak-vperf-params

4 levels in one page (reloads: none), fast=2, phone emulation (844×390, DPR 3), CPU throttled 4×, served prod from http://127.0.0.1:4821 (snapshot built 2026-09-27T19:16:06.024Z). Longest streak: 23. Page errors: 0.

## Budgets: pass

docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §11.1 and docs/PERF.md §5. "n/a": not judged on this run. Owners are the fix plan's lanes; an offending animation names the file that defines it.

| result | when | check | budget | measured | owner |
|---|---|---|---|---|---|
| pass | after each level, back on the map (GC'd) | DOM nodes (CDP, attached + detached) | ≤ start + 600 (846) | start 246, worst 346 (after w1-5) | all |
| pass | after each level, back on the map (GC'd) | JS heap, MB | ≤ start + 8 (17.2) | cold map 6.5, start 9.2 (after w1-2, the warm-up), worst 10.2 (after w1-5) | all |
| pass | after each level, back on the map (GC'd) | event listeners | ≤ start + 40 (292) | start 252, worst 279 (after w1-2) | all |
| pass | after each level, back on the map (GC'd) | animations on the map | ≤ start + 5 (34) | start 29, worst 29 (after start) | all |
| pass | after each level, back on the map (GC'd) | live intervals | ≤ start + 1 (2) | start 1, worst 1 (after start) | all |
| pass | after each level, back on the map (GC'd) | particles on the canvas | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | nodes in the fx layer | ≤ 0 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | rAF requests/s on the still map | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | live decoded audio, MB | ≤ 64 | start 1, worst 39.8 (after w1-4) | F1, B1 |
| pass | after each level, back on the map (GC'd) | Web Audio nodes (AudioHandlers) | ≤ start + 8 (19) | start 11, worst 11 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | &lt;audio> elements alive | ≤ start + 2 (4) | start 2, worst 2 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | window.__snNavLog entries | ≤ 500 | start 0, worst 65 (after w1-5) | F3 |
| pass | after each level, back on the map (GC'd) | the save's adjustLog entries | ≤ 200 | start 0, worst 0 (after start) | F1 |
| pass | on the title, untouched for 5 s | live decoded audio, MB | ≤ 2 | 0.7 MB in 2 clips | B1 |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations the compositor can't run | ≤ 2 | max 0; over in 0 of 35 samples | F1, B, C, D (by file) |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations running on hidden elements | ≤ 2 | max 0; over in 0 of 35 samples | F1, D2 (by file) |
| pass | the still map, 60 s untouched | rAF requests/s, median | ≤ 5 | 0 (max 13.3); main thread 1.7 % | F1, B1 |
| pass | a held Next (a reward), 40 s untouched, the idle nudge included | rAF requests/s, median | ≤ 5 | 4.8 (max 14.7); main thread 4.9 % | F1, F3 (nav.tsx), B1 |
| pass | phone ×4, while playing | every screen's median fps | ≥ 50 | lowest level:w1-3 (60.3) | D5 (the runner); otherwise the screen's owner |
| pass | phone ×4, the still map | main thread %, median | ≤ 5 % | 1.7 % | F1 |
| pass | phone ×4, a held Next (a reward), the idle nudge included | main thread %, median | ≤ 6 % | 4.9 % (6.6, 6.1, 3.6, 3.7) | F1 (the ninja), F3 (the nudge), B1 (the reward) |
| pass | phone ×4, the ninja standing still | main thread % at streak 0, mean | ≤ 6 % | 3 % (4.6, 1.4) | F1 |
| pass | phone ×4, the ninja standing still | main thread % at streak 10, mean | ≤ 14 % | 7.3 % (8.9, 5.7) | F1 |
| pass | phone ×4, the World Flower | main thread %, median | ≤ 30 % | 22 % over 2 samples (20, 24) | B2 |
| pass | phone ×4, the World Flower | longest task, ms | ≤ 120 ms | 0 ms | B2 |
| pass | the strike stress (150 streak-10 strikes, 7 a second) | particles at the peak | ≤ 350 | 261 (fx nodes 86) | F1 |
| pass | 10 s after the stress | particles / fx nodes left | 0 / 0 | 0 / 0 | F1 |
| pass | the whole soak | page reloads | 0 | 0 | all |
| pass | the whole soak | levels the bot finished | all | 4 of 4 | the scene's owner (or bot.ts) |

## After each level (on the map, after a forced GC)

| metric | start | per level → | last | slope / level | budget |
|---|---|---|---|---|---|
| heapMB | 6.5 | 6.5 9.2 9.6 10 10.2 | 10.2 | 0.82 | ok (≤ start + 8 (17.2)) |
| nodes | 246 | 246 306 323 336 346 | 346 | 23 | ok (≤ start + 600 (846)) |
| detachedNodes | 76 | 76 126 133 136 136 | 136 | 13 |  |
| attachedNodes | 170 | 170 180 190 200 210 | 210 | 10 |  |
| listeners | 252 | 252 279 251 251 251 | 251 | -3 | ok (≤ start + 40 (292)) |
| globalListeners | 20 | 20 20 20 20 20 | 20 | 0 |  |
| animations | 29 | 29 29 29 29 29 | 29 | 0 | ok (≤ start + 5 (34)) |
| animInfinite | 9 | 9 9 9 9 9 | 9 | 0 |  |
| animHiddenInfinite | 0 | 0 0 0 0 0 | 0 | 0 |  |
| animMainThreadInfinite | 0 | 0 0 0 0 0 | 0 | 0 |  |
| fxDomNodes | 0 | 0 0 0 0 0 | 0 | 0 | ok (≤ 0) |
| particles | 0 | 0 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| rafPerSec | 0 | 0 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| intervals | 1 | 1 1 1 1 1 | 1 | 0 | ok (≤ start + 1 (2)) |
| pendingTimeouts | 1 | 1 1 1 1 1 | 1 | 0 |  |
| mediaAlive | 2 | 2 2 2 2 2 | 2 | 0 | ok (≤ start + 2 (4)) |
| decodedMB | 1 | 1 25.7 33.6 39.8 39.4 | 39.4 | 9.09 | ok (≤ 64) |
| decodedTotalMB | 1 | 1 25.7 33.6 52.2 55.4 | 55.4 | 13.53 |  |
| decodedClips | 2 | 2 63 86 95 97 | 97 | 22.2 |  |
| audioHandlers | 11 | 11 11 10 10 10 | 10 | -0.3 | ok (≤ start + 8 (19)) |
| arrayBuffers | 10 | 10 71 94 103 105 | 105 | 22.2 |  |
| layoutObjects | 178 | 178 223 232 245 255 | 255 | 17.6 |  |
| navLog | 0 | 0 22 33 52 65 | 65 | 16 | ok (≤ 500) |
| adjustLog | 0 | 0 0 0 0 0 | 0 | 0 | ok (≤ 200) |
| imagesFetched | 58 | 58 77 85 85 85 | 85 | 6.2 |  |
| audioFetched | 3 | 3 66 89 130 138 | 138 | 33.4 |  |
| imgInDomMB | 18 | 18 18 18 18 18 | 18 | 0 |  |
| rendererRssMB | 430 | 430 821 921 977 1012 | 1012 | 132 |  |
| gpuRssMB | 84 | 84 90 92 102 104 | 104 | 5.2 |  |
| footprintMB | 84.9 | 84.9 161.4 205.1 243.9 271.8 | 271.8 | 45.63 |  |
| gpuFootprintMB | 15.1 | 15.1 13.9 13.6 14.1 14.2 | 14.2 | -0.16 |  |
| mem_blink_gc | 5.8 | 5.8 15 21.9 28 32 | 32 | 6.54 |  |
| mem_blink_objects | 2.1 | 2.1 3.2 3.9 4.1 4.2 | 4.2 | 0.51 |  |
| mem_canvas | 3.5 | 3.5 3.7 3.9 3.9 3.9 | 3.9 | 0.1 |  |
| mem_cc | 177.2 | 177.2 466.4 510 497.7 497.8 | 497.8 | 67.25 |  |
| mem_discardable | 193.8 | 193.8 469.2 517.4 508.1 506.5 | 506.5 | 66.43 |  |
| mem_malloc | 53.7 | 53.7 56.4 62.4 61.7 61.4 | 61.4 | 2.07 |  |
| mem_media | 2.4 | 2.4 2.4 2.4 2.4 2.4 | 2.4 | 0 |  |
| mem_mojo | 0 | 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_images | 0 | 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_strings | 0 | 0 0 0 0 0 | 0 | 0 |  |
| mem_partition_alloc | 18.4 | 18.4 81.4 119.7 155.6 182.5 | 182.5 | 40.24 |  |
| mem_shared_memory | 219.5 | 219.5 495.3 543.4 533.7 532.3 | 532.3 | 66.4 |  |
| mem_site_storage | 0 | 0 0 0 0 0 | 0 | 0 |  |
| mem_skia | 0.9 | 0.9 6.3 8.4 7 6.4 | 6.4 | 1.17 |  |
| mem_v8 | 8.4 | 8.4 11.4 11.9 12.5 12.7 | 12.7 | 0.97 |  |
| mem_web_cache | 1.7 | 1.7 1.7 1.7 1.8 1.8 | 1.8 | 0.03 |  |

## While playing (periodic samples): first half vs second half

| metric | first half | second half |
|---|---|---|
| fps | 60.5 | 60.7 |
| slowFramePct | 0 | 0 |
| mainThreadPct | 15.9 | 23.3 |
| scriptPct | 1.8 | 2.1 |
| stylePct | 2.7 | 4.4 |
| layoutPct | 0.2 | 0.3 |
| recalcPerSec | 60.8 | 61.4 |
| layoutPerSec | 5.9 | 10.3 |
| rendererPct | 89.6 | 93.4 |
| gpuPct | 11.9 | 16.6 |
| longTaskMs | 0 | 0 |
| rafPerSec | 71.3 | 83.4 |
| rafPerFrame | 1 | 1.4 |
| animHiddenInfinite | 0 | 0 |
| animMainThreadInfinite | 0 | 0 |
| animations | 39.7 | 58.8 |
| animInfinite | 25.5 | 42.5 |
| particles | 2.2 | 23.9 |
| particlesPeak | 86.3 | 105.8 |

## Phases (the title, the still map, a held Next, the ninja's aura, the strike stress)

| phase | what | fps | main % | style % | recalcs/s | rAF/s | renderer CPU % | GPU CPU % | particles (now / peak) | fx nodes | animations | decoded MB | Nodes | heap MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| title | the title, 5 s, untouched | 60.3 | 1.6 | 0.6 | 20.8 | 0.5 | 81 | 13 | 0 / 0 | 0 | 28 (21 inf, 0 main) | 0.7 | 177 | 5.2 |
| idle-map | map | 60.6 | 3.5 | 0.7 | 33.5 | 13.3 | 83 | 9 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 40 | 357 | 10.2 |
| idle-map | map | 60.3 | 3 | 0.7 | 32.6 | 13.3 | 82 | 9 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 40 | 371 | 10.5 |
| idle-map | map | 60.3 | 1.7 | 0.5 | 23.8 | 0 | 82 | 9 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 40 | 371 | 10.6 |
| idle-map | map | 60.7 | 1.5 | 0.4 | 23.8 | 0 | 82 | 8 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 40 | 371 | 10.7 |
| idle-map | map | 60.2 | 1.7 | 0.4 | 23.7 | 0 | 82 | 8 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 40 | 346 | 10.1 |
| idle-map | map | 60.2 | 1.7 | 0.5 | 23.9 | 0 | 82 | 9 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 40 | 346 | 10.2 |
| settled | after soak | 60.3 | 1.7 | 0.4 | 20.4 | 0 | 83 | 9 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 40 | 346 | 10.2 |
| settled | the reward (w1-5), Next ready | 60.2 | 2.3 | 0.3 | 19.7 | 0 | 82 | 9 | 0 / 0 | 0 | 14 (6 inf, 0 main) | 39.8 | 370 | 10.1 |
| idle-next | the reward (w1-5), a held Next, untouched | 60.8 | 6.6 | 0.9 | 31 | 14.7 | 83 | 11 | 0 / 59 | 0 | 14 (7 inf, 0 main) | 40 | 383 | 10.1 |
| idle-next | the reward (w1-5), a held Next, untouched | 60.3 | 6.1 | 0.8 | 31.6 | 9.5 | 83 | 10 | 0 / 0 | 0 | 14 (7 inf, 0 main) | 40 | 385 | 10.1 |
| idle-next | the reward (w1-5), a held Next, untouched | 60.9 | 3.6 | 0.5 | 24.2 | 0 | 82 | 10 | 0 / 0 | 0 | 14 (7 inf, 0 main) | 40 | 373 | 10 |
| idle-next | the reward (w1-5), a held Next, untouched | 60.8 | 3.7 | 0.5 | 24.5 | 0 | 83 | 9 | 0 / 0 | 0 | 14 (7 inf, 0 main) | 40 | 373 | 10 |
| aura-t0 | ninja demo, streak 0, idle | 60.8 | 4.6 | 1 | 26.6 | 0 | 84 | 10 | 0 / 0 | 0 | 4 (3 inf, 0 main) | 40 | 431 | 10.1 |
| aura-t0 | ninja demo, streak 0, idle | 60.3 | 1.4 | 0.3 | 24.3 | 0 | 81 | 8 | 0 / 0 | 0 | 4 (3 inf, 0 main) | 40 | 431 | 10.2 |
| aura-t3 | ninja demo, streak 10, idle | 60.5 | 8.9 | 2.6 | 33.7 | 15 | 86 | 13 | 0 / 99 | 0 | 60 (49 inf, 0 main) | 40 | 379 | 10.1 |
| aura-t3 | ninja demo, streak 10, idle | 60.5 | 5.7 | 2.1 | 24.6 | 0 | 84 | 14 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 40 | 379 | 10.1 |
| settled | before stress | 60.2 | 4.1 | 1.7 | 19.5 | 0 | 84 | 14 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 40 | 379 | 10.3 |
| stress | strike 1/150 | 60.9 | 19.1 | 5.8 | 60.7 | 0 | 87 | 15 | 0 / 0 | 0 | 63 (49 inf, 0 main) | 40 | 431 | 10.6 |
| stress | strike 60/150 | 60.7 | 84.7 | 9 | 82.4 | 157.6 | 136 | 28 | 261 / 257 | 36 | 74 (49 inf, 0 main) | 40 | 831 | 10.6 |
| stress | strike 119/150 | 60 | 82.5 | 8.2 | 81.7 | 153.6 | 136 | 28 | 254 / 271 | 31 | 73 (51 inf, 0 main) | 40 | 578 | 11.7 |
| stress | last strike | 60.7 | 82.5 | 8.6 | 77.7 | 150 | 134 | 27 | 152 / 249 | 65 | 78 (55 inf, 0 main) | 40 | 829 | 10.6 |
| settled | 10 s after the stress | 60.3 | 4.8 | 1.4 | 16 | 0 | 84 | 14 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 40 | 379 | 10.5 |
| settled | map after the stress | 61 | 5.3 | 1 | 36.2 | 24.2 | 83 | 12 | 0 / 0 | 0 | 32 (12 inf, 0 main) | 40 | 357 | 10.3 |

## Levels

| level | kind | secs | finished | max streak | streak at end | stuck |
|---|---|---|---|---|---|---|
| w1-2 | firstsound | 90 | yes | 8 | 8 |  |
| w1-3 | firstsound | 67 | yes | 15 | 15 |  |
| w1-4 | dojo | 60 | yes | 22 | 22 |  |
| w1-5 | dojo | 58 | yes | 23 | 14 |  |

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
  "100ms at http://127.0.0.1:4821/assets/play-JdNzNFiz.js:2:971": 1
 },
 "mods": {
  "visemeListeners": 1,
  "bufferCache": 97,
  "captionListeners": 3,
  "clipListeners": 4,
  "sayListeners": 2,
  "music": 1,
  "speaking": 0,
  "decodedLruMB": 39.4,
  "musicDecks": 2,
  "storeListeners": 4,
  "attemptSubs": 0,
  "saveBytes": 5179,
  "adjustLog": 0,
  "poseSubs": 1,
  "particles": 0,
  "particleKinds": {},
  "glowCache": 18,
  "helpStack": 1,
  "nudgeListeners": 1,
  "uprightSubs": 1,
  "imgCache": 2,
  "fxDomChildren": 0,
  "streakListeners": 1,
  "streakSubs": 0,
  "streakN": 14,
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

