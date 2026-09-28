# Soak soak-tree-r2

4 levels in one page (reloads: none), fast=2, phone emulation (844×390, DPR 3), CPU throttled 4×, served prod from http://127.0.0.1:4723 (snapshot built 2026-09-27T10:29:22.240Z). Longest streak: 25. Page errors: 0.

## Budgets: **FAIL** (6: listeners, intervals, idleRaf, idleNextRaf, idleNextMain, flowerMain)

docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §11.1 and docs/PERF.md §5. "n/a": not judged on this run. Owners are the fix plan's lanes; an offending animation names the file that defines it.

| result | when | check | budget | measured | owner |
|---|---|---|---|---|---|
| pass | after each level, back on the map (GC'd) | DOM nodes (CDP, attached + detached) | ≤ start + 600 (837) | start 237, worst 331 (after w1-5) | all |
| pass | after each level, back on the map (GC'd) | JS heap, MB | ≤ start + 8 (13.4) | start 5.4, worst 10.2 (after w1-5) | all |
| **FAIL** | after each level, back on the map (GC'd) | event listeners | ≤ start + 40 (292) | start 252, worst 332 (after w1-2); over after 4 of 5 boundaries, from w1-2 | all |
| pass | after each level, back on the map (GC'd) | animations on the map | ≤ start + 5 (34) | start 29, worst 30 (after w1-5) | all |
| **FAIL** | after each level, back on the map (GC'd) | live intervals | ≤ start + 1 (2) | start 1, worst 3 (after w1-4); over after 2 of 5 boundaries, from w1-4 | all |
| pass | after each level, back on the map (GC'd) | particles on the canvas | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | nodes in the fx layer | ≤ 0 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | rAF requests/s on the still map | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | live decoded audio, MB | ≤ 64 | start 1, worst 39.9 (after w1-5) | F1, B1 |
| pass | after each level, back on the map (GC'd) | Web Audio nodes (AudioHandlers) | ≤ start + 8 (19) | start 11, worst 11 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | &lt;audio> elements alive | ≤ start + 2 (4) | start 2, worst 2 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | window.__snNavLog entries | ≤ 500 | start 0, worst 67 (after w1-5) | F3 |
| pass | after each level, back on the map (GC'd) | the save's adjustLog entries | ≤ 200 | start 0, worst 0 (after start) | F1 |
| pass | on the title, untouched for 5 s | live decoded audio, MB | ≤ 2 | 0.7 MB in 2 clips | B1 |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations the compositor can't run | ≤ 2 | max 0; over in 0 of 29 samples | F1, B, C, D (by file) |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations running on hidden elements | ≤ 2 | max 0; over in 0 of 29 samples | F1, D2 (by file) |
| **FAIL** | the still map, 20 s untouched | rAF requests/s, median | ≤ 5 | 12.8 (max 12.8); main thread 4.2 % | F1, B1 |
| **FAIL** | a held Next (a reward), 20 s untouched, the idle nudge included | rAF requests/s, median | ≤ 5 | 11 (max 13.3); main thread 8 % | F1, F3 (nav.tsx), B1 |
| pass | phone ×4, while playing | every screen's median fps | ≥ 50 | lowest reward:w1-4 (59.7) | D5 (the runner); otherwise the screen's owner |
| pass | phone ×4, the still map | main thread %, median | ≤ 5 % | 4.2 % | F1 |
| **FAIL** | phone ×4, a held Next (a reward), the idle nudge included | main thread %, median | ≤ 6 % | 8 % (8.3, 7.7) | F1 (the ninja), F3 (the nudge), B1 (the reward) |
| n/a | phone ×4, the ninja standing still | main thread % at streak 0, mean | ≤ 6 % | not measured (--no-aura) | F1 |
| n/a | phone ×4, the ninja standing still | main thread % at streak 10, mean | ≤ 14 % | not measured (--no-aura) | F1 |
| **FAIL** | phone ×4, the World Flower | main thread %, median | ≤ 30 % | 31.6 % over 2 samples (27.9, 35.3) | B2 |
| pass | phone ×4, the World Flower | longest task, ms | ≤ 120 ms | 56 ms | B2 |
| n/a | the strike stress (streak-10 strikes, 7 a second) | particles at the peak | ≤ 350 | not measured (--stress 0) | F1 |
| n/a | 10 s after the stress | particles / fx nodes left | 0 / 0 | not measured (--stress 0) | F1 |
| pass | the whole soak | page reloads | 0 | 0 | all |
| pass | the whole soak | levels the bot finished | all | 4 of 4 | the scene's owner (or bot.ts) |

## After each level (on the map, after a forced GC)

| metric | start | per level → | last | slope / level | budget |
|---|---|---|---|---|---|
| heapMB | 5.4 | 5.4 9 9.6 10 10.2 | 10.2 | 1.06 | ok (≤ start + 8 (13.4)) |
| nodes | 237 | 237 289 307 319 331 | 331 | 21.8 | ok (≤ start + 600 (837)) |
| detachedNodes | 76 | 76 118 126 128 128 | 128 | 11.4 |  |
| attachedNodes | 161 | 161 171 181 191 203 | 203 | 10.4 |  |
| listeners | 252 | 252 332 331 304 304 | 304 | 7.6 | FAIL (≤ start + 40 (292)) |
| globalListeners | 20 | 20 33 33 33 33 | 33 | 2.6 |  |
| animations | 29 | 29 29 29 29 30 | 30 | 0.2 | ok (≤ start + 5 (34)) |
| animInfinite | 9 | 9 9 9 9 10 | 10 | 0.2 |  |
| animHiddenInfinite | 0 | 0 0 0 0 0 | 0 | 0 |  |
| animMainThreadInfinite | 0 | 0 0 0 0 0 | 0 | 0 |  |
| fxDomNodes | 0 | 0 0 0 0 0 | 0 | 0 | ok (≤ 0) |
| particles | 0 | 0 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| rafPerSec | 0 | 0 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| intervals | 1 | 1 1 1 3 3 | 3 | 0.6 | FAIL (≤ start + 1 (2)) |
| pendingTimeouts | 1 | 1 1 1 1 1 | 1 | 0 |  |
| mediaAlive | 2 | 2 2 2 2 2 | 2 | 0 | ok (≤ start + 2 (4)) |
| decodedMB | 1 | 1 25.1 32.8 39.1 39.9 | 39.9 | 9.18 | ok (≤ 64) |
| decodedTotalMB | 1 | 1 25.1 32.8 49.2 54.4 | 54.4 | 13.09 |  |
| decodedClips | 2 | 2 60 82 93 97 | 97 | 22.3 |  |
| audioHandlers | 11 | 11 11 10 10 10 | 10 | -0.3 | ok (≤ start + 8 (19)) |
| arrayBuffers | 10 | 10 68 90 101 105 | 105 | 22.3 |  |
| layoutObjects | 178 | 178 215 225 237 250 | 250 | 16.6 |  |
| navLog | 0 | 0 21 32 52 67 | 67 | 16.5 | ok (≤ 500) |
| adjustLog | 0 | 0 0 0 0 0 | 0 | 0 | ok (≤ 200) |
| imagesFetched | 56 | 56 76 87 87 87 | 87 | 7.3 |  |
| audioFetched | 3 | 3 63 85 122 133 | 133 | 31.9 |  |
| imgInDomMB | 18 | 18 18 18 18 18 | 18 | 0 |  |
| rendererRssMB | 431 | 431 812 928 975 1014 | 1014 | 132.9 |  |
| gpuRssMB | 82 | 82 92 94 104 105 | 105 | 5.8 |  |
| footprintMB | 85.4 | 85.4 157.5 205.9 242.4 273.3 | 273.3 | 46.07 |  |
| gpuFootprintMB | 15.8 | 15.8 14.9 15 15.3 15.5 | 15.5 | -0.02 |  |
| mem_blink_gc | 5.4 | 5.4 16.2 26.2 32.4 37.7 | 37.7 | 8.08 |  |
| mem_blink_objects | 2.1 | 2.1 3.1 3.9 3.9 4.2 | 4.2 | 0.5 |  |
| mem_canvas | 3.5 | 3.5 3.7 3.9 3.9 3.9 | 3.9 | 0.1 |  |
| mem_cc | 175 | 175 469 523.4 512.8 515.3 | 515.3 | 72.44 |  |
| mem_discardable | 196.4 | 196.4 454.6 515.5 509 507.3 | 507.3 | 67.62 |  |
| mem_malloc | 56.2 | 56.2 51.6 63.2 62.8 62.6 | 62.6 | 2.4 |  |
| mem_media | 2.4 | 2.4 2.4 2.4 2.4 2.4 | 2.4 | 0 |  |
| mem_mojo | 0 | 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_images | 0 | 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_strings | 0 | 0 0 0 0 0 | 0 | 0 |  |
| mem_partition_alloc | 16.7 | 16.7 79.1 118 151.4 181 | 181 | 40.09 |  |
| mem_shared_memory | 224.3 | 224.3 497.1 559.5 546.8 546.7 | 546.7 | 69.45 |  |
| mem_site_storage | 0 | 0 0 0 0 0 | 0 | 0 |  |
| mem_skia | 0.5 | 0.5 6.3 9.1 7.1 5 | 5 | 0.98 |  |
| mem_v8 | 7.2 | 7.2 11.2 11.7 12.4 12.6 | 12.6 | 1.2 |  |
| mem_web_cache | 1.3 | 1.3 1.4 1.4 1.4 1.4 | 1.4 | 0.02 |  |

## While playing (periodic samples): first half vs second half

| metric | first half | second half |
|---|---|---|
| fps | 60.7 | 60.3 |
| slowFramePct | 0 | 0.3 |
| mainThreadPct | 22 | 32.4 |
| scriptPct | 2.4 | 2.8 |
| stylePct | 3.8 | 5.9 |
| layoutPct | 0.3 | 0.4 |
| recalcPerSec | 61.9 | 64.4 |
| layoutPerSec | 6.6 | 10.8 |
| rendererPct | 93.8 | 98.8 |
| gpuPct | 16.3 | 22.1 |
| longTaskMs | 9.1 | 0 |
| rafPerSec | 70.8 | 81.4 |
| rafPerFrame | 1.1 | 1.1 |
| animHiddenInfinite | 0 | 0 |
| animMainThreadInfinite | 0 | 0 |
| animations | 41.7 | 55.2 |
| animInfinite | 28 | 39.8 |
| particles | 4.9 | 8 |
| particlesPeak | 85.8 | 101.5 |

## Phases (the title, the still map, a held Next, the ninja's aura, the strike stress)

| phase | what | fps | main % | style % | recalcs/s | rAF/s | renderer CPU % | GPU CPU % | particles (now / peak) | fx nodes | animations | decoded MB | Nodes | heap MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| title | the title, 5 s, untouched | 61 | 1.6 | 0.6 | 20.2 | 0.5 | 82 | 20 | 0 / 0 | 0 | 28 (21 inf, 0 main) | 0.7 | 168 | 5.2 |
| idle-map | map | 60.7 | 4.2 | 1 | 32.3 | 12.8 | 84 | 13 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.9 | 345 | 10.6 |
| idle-map | map | 60.3 | 4.1 | 1.1 | 32.2 | 12.8 | 84 | 13 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.9 | 359 | 10.3 |
| settled | after soak | 60.4 | 2 | 0.5 | 21.2 | 0 | 85 | 13 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.9 | 330 | 10.1 |
| settled | the reward (w1-5), Next ready | 60.2 | 15.7 | 3 | 59.8 | 0 | 94 | 12 | 0 / 0 | 0 | 16 (8 inf, 0 main) | 39.8 | 350 | 10.1 |
| idle-next | the reward (w1-5), a held Next, untouched | 61 | 8.3 | 1.5 | 30.6 | 13.3 | 86 | 12 | 0 / 57 | 0 | 16 (9 inf, 0 main) | 39.9 | 363 | 10 |
| idle-next | the reward (w1-5), a held Next, untouched | 60.1 | 7.7 | 1.7 | 31 | 8.6 | 85 | 12 | 0 / 0 | 0 | 16 (9 inf, 0 main) | 39.9 | 353 | 10 |

## Levels

| level | kind | secs | finished | max streak | streak at end | stuck |
|---|---|---|---|---|---|---|
| w1-2 | firstsound | 94 | yes | 8 | 8 |  |
| w1-3 | firstsound | 75 | yes | 16 | 16 |  |
| w1-4 | dojo | 60 | yes | 23 | 23 |  |
| w1-5 | dojo | 65 | yes | 25 | 13 |  |

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
  "100ms at http://127.0.0.1:4723/assets/play-9r2IcVJy.js:2:971": 1,
  "250ms at window.setInterval (http://127.0.0.1:4723/assets/play-9r2IcVJy.js:2:957) < at http://127.0.0.1:4723/assets/play-9r2IcVJy.js:10:457056": 2
 },
 "mods": {
  "visemeListeners": 1,
  "bufferCache": 97,
  "captionListeners": 3,
  "clipListeners": 3,
  "sayListeners": 2,
  "music": 1,
  "speaking": 0,
  "decodedLruMB": 39.9,
  "musicDecks": 2,
  "storeListeners": 4,
  "attemptSubs": 0,
  "saveBytes": 5214,
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
  "streakN": 13,
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

