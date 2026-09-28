# Soak soak-phone-final

6 levels in one page (reloads: none), fast=2, phone emulation (844×390, DPR 3), CPU throttled 4×, served prod from http://127.0.0.1:4821 (snapshot built 2026-09-27T10:33:22.354Z). Longest streak: 28. Page errors: 0.

## Budgets: **FAIL** (4: listeners, intervals, rafPerSec, flowerMain)

docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §11.1 and docs/PERF.md §5. "n/a": not judged on this run. Owners are the fix plan's lanes; an offending animation names the file that defines it.

| result | when | check | budget | measured | owner |
|---|---|---|---|---|---|
| pass | after each level, back on the map (GC'd) | DOM nodes (CDP, attached + detached) | ≤ start + 600 (837) | start 237, worst 364 (after w1-7) | all |
| pass | after each level, back on the map (GC'd) | JS heap, MB | ≤ start + 8 (13.3) | start 5.3, worst 11 (after w1-7) | all |
| **FAIL** | after each level, back on the map (GC'd) | event listeners | ≤ start + 40 (292) | start 252, worst 332 (after w1-2); over after 6 of 7 boundaries, from w1-2 | all |
| pass | after each level, back on the map (GC'd) | animations on the map | ≤ start + 5 (34) | start 29, worst 34 (after w1-5) | all |
| **FAIL** | after each level, back on the map (GC'd) | live intervals | ≤ start + 1 (2) | start 1, worst 3 (after w1-4); over after 4 of 7 boundaries, from w1-4 | all |
| pass | after each level, back on the map (GC'd) | particles on the canvas | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | nodes in the fx layer | ≤ 0 | start 0, worst 0 (after start) | F1 |
| **FAIL** | after each level, back on the map (GC'd) | rAF requests/s on the still map | ≤ 5 | start 0, worst 9.8 (after w1-5); over after 1 of 7 boundaries, from w1-5 | F1 |
| pass | after each level, back on the map (GC'd) | live decoded audio, MB | ≤ 64 | start 1, worst 40 (after w1-5) | F1, B1 |
| pass | after each level, back on the map (GC'd) | Web Audio nodes (AudioHandlers) | ≤ start + 8 (19) | start 11, worst 11 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | &lt;audio> elements alive | ≤ start + 2 (4) | start 2, worst 2 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | window.__snNavLog entries | ≤ 500 | start 0, worst 101 (after w1-7) | F3 |
| pass | after each level, back on the map (GC'd) | the save's adjustLog entries | ≤ 200 | start 0, worst 0 (after start) | F1 |
| pass | on the title, untouched for 5 s | live decoded audio, MB | ≤ 2 | 0.7 MB in 2 clips | B1 |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations the compositor can't run | ≤ 2 | max 0; over in 0 of 45 samples | F1, B, C, D (by file) |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations running on hidden elements | ≤ 2 | max 0; over in 0 of 45 samples | F1, D2 (by file) |
| pass | the still map, 60 s untouched | rAF requests/s, median | ≤ 5 | 0 (max 12.8); main thread 2.3 % | F1, B1 |
| pass | a held Next (a reward), 40 s untouched, the idle nudge included | rAF requests/s, median | ≤ 5 | 4.4 (max 13.6); main thread 5.9 % | F1, F3 (nav.tsx), B1 |
| pass | phone ×4, while playing | every screen's median fps | ≥ 50 | lowest reward:w1-2 (60.3) | D5 (the runner); otherwise the screen's owner |
| pass | phone ×4, the still map | main thread %, median | ≤ 5 % | 2.3 % | F1 |
| pass | phone ×4, a held Next (a reward), the idle nudge included | main thread %, median | ≤ 6 % | 5.9 % (8, 6.8, 5, 5.1) | F1 (the ninja), F3 (the nudge), B1 (the reward) |
| pass | phone ×4, the ninja standing still | main thread % at streak 0, mean | ≤ 6 % | 3.5 % (5.3, 1.6) | F1 |
| pass | phone ×4, the ninja standing still | main thread % at streak 10, mean | ≤ 14 % | 8.8 % (10.8, 6.7) | F1 |
| **FAIL** | phone ×4, the World Flower | main thread %, median | ≤ 30 % | 38.3 % over 3 samples (27.3, 38.3, 42.5) | B2 |
| pass | phone ×4, the World Flower | longest task, ms | ≤ 120 ms | 57 ms | B2 |
| pass | the strike stress (150 streak-10 strikes, 7 a second) | particles at the peak | ≤ 350 | 237 (fx nodes 82) | F1 |
| pass | 10 s after the stress | particles / fx nodes left | 0 / 0 | 0 / 0 | F1 |
| pass | the whole soak | page reloads | 0 | 0 | all |
| pass | the whole soak | levels the bot finished | all | 6 of 6 | the scene's owner (or bot.ts) |

## After each level (on the map, after a forced GC)

| metric | start | per level → | last | slope / level | budget |
|---|---|---|---|---|---|
| heapMB | 5.3 | 5.3 9 9.5 9.9 10.1 10.6 11 | 11 | 0.75 | ok (≤ start + 8 (13.3)) |
| nodes | 237 | 237 289 315 328 350 350 364 | 364 | 19.21 | ok (≤ start + 600 (837)) |
| detachedNodes | 76 | 76 118 134 137 139 137 141 | 141 | 8.5 |  |
| attachedNodes | 161 | 161 171 181 191 211 213 223 | 223 | 10.71 |  |
| listeners | 252 | 252 332 331 304 308 304 331 | 331 | 5.64 | FAIL (≤ start + 40 (292)) |
| globalListeners | 20 | 20 33 33 33 33 33 33 | 33 | 1.39 |  |
| animations | 29 | 29 29 29 29 34 30 30 | 30 | 0.36 | ok (≤ start + 5 (34)) |
| animInfinite | 9 | 9 9 9 9 13 10 10 | 10 | 0.32 |  |
| animHiddenInfinite | 0 | 0 0 0 0 0 0 0 | 0 | 0 |  |
| animMainThreadInfinite | 0 | 0 0 0 0 0 0 0 | 0 | 0 |  |
| fxDomNodes | 0 | 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 0) |
| particles | 0 | 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| rafPerSec | 0 | 0 0 0 0 9.8 0 0 | 0 | 0.35 | FAIL (≤ 5) |
| intervals | 1 | 1 1 1 3 3 3 3 | 3 | 0.43 | FAIL (≤ start + 1 (2)) |
| pendingTimeouts | 1 | 1 1 1 1 2 1 1 | 1 | 0.04 |  |
| mediaAlive | 2 | 2 2 2 2 2 2 2 | 2 | 0 | ok (≤ start + 2 (4)) |
| decodedMB | 1 | 1 25 32.6 39.9 40 39.8 39.9 | 39.9 | 5.49 | ok (≤ 64) |
| decodedTotalMB | 1 | 1 25 32.6 48.1 55.1 61 74.9 | 74.9 | 11.29 |  |
| decodedClips | 2 | 2 60 82 95 96 88 95 | 95 | 12.46 |  |
| audioHandlers | 11 | 11 11 10 10 11 10 10 | 10 | -0.14 | ok (≤ start + 8 (19)) |
| arrayBuffers | 10 | 10 68 90 103 104 96 103 | 103 | 12.46 |  |
| layoutObjects | 178 | 178 215 234 246 269 269 283 | 283 | 16.36 |  |
| navLog | 0 | 0 21 32 50 64 80 101 | 101 | 16.18 | ok (≤ 500) |
| adjustLog | 0 | 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 200) |
| imagesFetched | 56 | 56 73 85 85 85 85 89 | 89 | 4.39 |  |
| audioFetched | 3 | 3 63 85 120 135 147 171 | 171 | 25.79 |  |
| imgInDomMB | 18 | 18 18 18 18 17.8 18 18 | 18 | -0.01 |  |
| rendererRssMB | 435 | 435 823 928 974 996 1045 1104 | 1104 | 89.96 |  |
| gpuRssMB | 85 | 85 92 94 104 106 105 105 | 105 | 3.5 |  |
| footprintMB | 84.3 | 84.3 160.9 204.8 237.8 273.6 294.3 337 | 337 | 39.06 |  |
| gpuFootprintMB | 15.5 | 15.5 15 15 14.9 14.8 15.5 15.1 | 15.1 | -0.01 |  |
| mem_blink_gc | 5.3 | 5.3 15.9 24.1 30.7 35.2 40.3 44.8 | 44.8 | 6.37 |  |
| mem_blink_objects | 2.1 | 2.1 3 3.9 3.9 4.1 4.2 4.7 | 4.7 | 0.37 |  |
| mem_canvas | 3.5 | 3.5 3.7 3.8 3.9 3.9 3.9 3.9 | 3.9 | 0.06 |  |
| mem_cc | 175 | 175 482 516.8 506.1 466.5 512.2 514 | 514 | 36.68 |  |
| mem_discardable | 198.1 | 198.1 467.7 513.5 508.6 491.5 506.6 516 | 516 | 36.05 |  |
| mem_malloc | 55.5 | 55.5 57.5 58.3 62.6 61.2 63.4 68.4 | 68.4 | 1.91 |  |
| mem_media | 2.4 | 2.4 2.4 2.4 2.4 2.4 2.4 2.4 | 2.4 | 0 |  |
| mem_mojo | 0 | 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_images | 0 | 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_strings | 0 | 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_partition_alloc | 16.8 | 16.8 79 117.6 150.3 179.3 200.3 236.8 | 236.8 | 34.44 |  |
| mem_shared_memory | 229.6 | 229.6 510.7 556.8 547.8 517.9 546.1 558.9 | 558.9 | 36.42 |  |
| mem_site_storage | 0 | 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_skia | 0.5 | 0.5 6.4 9.5 9.5 5.2 4.8 6 | 6 | 0.32 |  |
| mem_v8 | 7.3 | 7.3 11.1 11.7 12.2 12.5 12.9 13.2 | 13.2 | 0.79 |  |
| mem_web_cache | 1.3 | 1.3 1.4 1.4 1.4 1.4 1.4 1.4 | 1.4 | 0.01 |  |

## While playing (periodic samples): first half vs second half

| metric | first half | second half |
|---|---|---|
| fps | 60.5 | 60.7 |
| slowFramePct | 0.1 | 0.1 |
| mainThreadPct | 25.5 | 35.1 |
| scriptPct | 2.5 | 2.9 |
| stylePct | 4.7 | 6.3 |
| layoutPct | 0.3 | 0.5 |
| recalcPerSec | 60.7 | 64.3 |
| layoutPerSec | 7.2 | 11.9 |
| rendererPct | 95.6 | 100.5 |
| gpuPct | 19.5 | 22.8 |
| longTaskMs | 6.5 | 0 |
| rafPerSec | 70.7 | 82.6 |
| rafPerFrame | 1 | 1.1 |
| animHiddenInfinite | 0 | 0 |
| animMainThreadInfinite | 0 | 0 |
| animations | 50.4 | 59.5 |
| animInfinite | 35.5 | 42.4 |
| particles | 3.6 | 20.2 |
| particlesPeak | 93.4 | 122.7 |

## Phases (the title, the still map, a held Next, the ninja's aura, the strike stress)

| phase | what | fps | main % | style % | recalcs/s | rAF/s | renderer CPU % | GPU CPU % | particles (now / peak) | fx nodes | animations | decoded MB | Nodes | heap MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| title | the title, 5 s, untouched | 60.8 | 1.8 | 0.6 | 20.2 | 0 | 83 | 17 | 0 / 0 | 0 | 28 (21 inf, 0 main) | 0.7 | 168 | 5.2 |
| idle-map | map | 60.2 | 4.2 | 1.1 | 30.4 | 12.8 | 84 | 14 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.9 | 378 | 10.7 |
| idle-map | map | 60.4 | 4.4 | 1.1 | 32.5 | 12.8 | 84 | 13 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.9 | 392 | 11.2 |
| idle-map | map | 60.6 | 2.3 | 0.6 | 23.7 | 0 | 83 | 13 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.9 | 362 | 10.6 |
| idle-map | map | 60.9 | 2.2 | 0.7 | 23.8 | 0 | 83 | 13 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.9 | 362 | 10.7 |
| idle-map | map | 60.7 | 2.1 | 0.6 | 23.6 | 0 | 83 | 14 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.9 | 362 | 10.8 |
| idle-map | map | 60.2 | 1.9 | 0.6 | 24 | 0 | 83 | 14 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.9 | 362 | 10.9 |
| settled | after soak | 61.1 | 1.9 | 0.5 | 20.2 | 0 | 83 | 13 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.9 | 362 | 10.7 |
| settled | the reward (w1-7), Next ready | 60.3 | 14.7 | 2.8 | 61.4 | 0 | 89 | 10 | 0 / 0 | 0 | 14 (7 inf, 0 main) | 39.4 | 333 | 10.6 |
| idle-next | the reward (w1-7), a held Next, untouched | 60.5 | 8 | 1.4 | 28.6 | 13.6 | 85 | 11 | 0 / 56 | 0 | 14 (8 inf, 0 main) | 39.8 | 336 | 10.5 |
| idle-next | the reward (w1-7), a held Next, untouched | 60.5 | 6.8 | 1.4 | 29 | 8.7 | 84 | 11 | 0 / 0 | 0 | 14 (8 inf, 0 main) | 39.8 | 346 | 10.5 |
| idle-next | the reward (w1-7), a held Next, untouched | 60.3 | 5 | 1.1 | 23.9 | 0 | 83 | 10 | 0 / 0 | 0 | 14 (8 inf, 0 main) | 39.8 | 336 | 10.5 |
| idle-next | the reward (w1-7), a held Next, untouched | 60.4 | 5.1 | 1.2 | 24.2 | 0 | 84 | 11 | 0 / 0 | 0 | 14 (8 inf, 0 main) | 39.8 | 336 | 10.5 |
| aura-t0 | ninja demo, streak 0, idle | 60.4 | 5.3 | 1.2 | 26.9 | 0 | 85 | 11 | 0 / 0 | 0 | 4 (3 inf, 0 main) | 39.8 | 425 | 10.6 |
| aura-t0 | ninja demo, streak 0, idle | 61 | 1.6 | 0.4 | 24.2 | 0 | 82 | 9 | 0 / 0 | 0 | 4 (3 inf, 0 main) | 39.8 | 425 | 10.8 |
| aura-t3 | ninja demo, streak 10, idle | 60.6 | 10.8 | 3.1 | 33.7 | 15 | 88 | 15 | 0 / 99 | 0 | 60 (49 inf, 0 main) | 39.8 | 373 | 10.6 |
| aura-t3 | ninja demo, streak 10, idle | 60.9 | 6.7 | 2.5 | 25.6 | 0 | 85 | 15 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 39.8 | 373 | 10.5 |
| settled | before stress | 60.7 | 5.6 | 2.2 | 21.9 | 0 | 90 | 16 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 39.8 | 373 | 10.8 |
| stress | strike 1/150 | 61 | 17.9 | 6.3 | 61.4 | 0 | 88 | 16 | 0 / 0 | 0 | 63 (49 inf, 0 main) | 39.8 | 425 | 11.1 |
| stress | strike 52/150 | 59.3 | 89.1 | 10.1 | 100.4 | 145.5 | 136 | 29 | 189 / 252 | 70 | 80 (51 inf, 0 main) | 39.8 | 825 | 10.7 |
| stress | strike 110/150 | 58.6 | 90.4 | 10 | 104.1 | 152 | 138 | 29 | 234 / 251 | 36 | 72 (49 inf, 0 main) | 39.8 | 1090 | 13.2 |
| stress | last strike | 58.9 | 89.5 | 10.1 | 104.2 | 148.3 | 135 | 29 | 193 / 243 | 39 | 78 (55 inf, 0 main) | 39.8 | 1089 | 11 |
| settled | 10 s after the stress | 61.1 | 4.7 | 1.9 | 20.2 | 0 | 85 | 15 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 39.8 | 373 | 10.9 |
| settled | map after the stress | 61.1 | 7.6 | 1.6 | 43.3 | 35.5 | 87 | 13 | 0 / 0 | 0 | 33 (13 inf, 0 main) | 39.8 | 373 | 10.9 |

## Levels

| level | kind | secs | finished | max streak | streak at end | stuck |
|---|---|---|---|---|---|---|
| w1-2 | firstsound | 93 | yes | 8 | 8 |  |
| w1-3 | firstsound | 75 | yes | 16 | 16 |  |
| w1-4 | dojo | 84 | yes | 21 | 21 |  |
| w1-5 | dojo | 67 | yes | 26 | 10 |  |
| w1-6 | battle | 35 | yes | 18 | 18 |  |
| w1-7 | soundhunt | 79 | yes | 28 | 28 |  |

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
    "@petal-drift-r",
    3
   ],
   [
    "@petal-drift-l",
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
  "window:pointerdown:capture": 4,
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
  "100ms at http://127.0.0.1:4821/assets/play-DM4U0QHp.js:2:971": 1,
  "250ms at window.setInterval (http://127.0.0.1:4821/assets/play-DM4U0QHp.js:2:957) < at http://127.0.0.1:4821/assets/play-DM4U0QHp.js:10:457088": 2
 },
 "mods": {
  "visemeListeners": 1,
  "bufferCache": 95,
  "captionListeners": 3,
  "clipListeners": 3,
  "sayListeners": 2,
  "music": 1,
  "speaking": 0,
  "decodedLruMB": 39.9,
  "musicDecks": 2,
  "storeListeners": 4,
  "attemptSubs": 0,
  "saveBytes": 6349,
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
  "streakN": 28,
  "owned": 0,
  "ownedConnected": 0,
  "busy": 0,
  "spotMounted": 0,
  "moveRunning": 0,
  "spotGen": 16,
  "navStack": 1,
  "navSubs": 2,
  "nudgeSubs": 0,
  "holds": 0,
  "narrateSubs": 0
 }
}
```

