# Soak soak-phone2

6 levels in one page (reloads: none), fast=2, phone emulation (844×390, DPR 3), CPU throttled 4×, served prod from http://127.0.0.1:4831 (snapshot built 2026-09-27T15:44:58.955Z). Longest streak: 51. Page errors: 0.

## Budgets: **FAIL** (1: listeners)

docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §11.1 and docs/PERF.md §5. "n/a": not judged on this run. Owners are the fix plan's lanes; an offending animation names the file that defines it.

| result | when | check | budget | measured | owner |
|---|---|---|---|---|---|
| pass | after each level, back on the map (GC'd) | DOM nodes (CDP, attached + detached) | ≤ start + 600 (837) | start 237, worst 364 (after w1-7) | all |
| pass | after each level, back on the map (GC'd) | JS heap, MB | ≤ start + 8 (13.3) | start 5.3, worst 11.1 (after w1-7) | all |
| **FAIL** | after each level, back on the map (GC'd) | event listeners | ≤ start + 40 (292) | start 252, worst 331 (after w1-3); over after 6 of 7 boundaries, from w1-2 | all |
| pass | after each level, back on the map (GC'd) | animations on the map | ≤ start + 5 (34) | start 29, worst 30 (after w1-6) | all |
| pass | after each level, back on the map (GC'd) | live intervals | ≤ start + 1 (2) | start 1, worst 1 (after start) | all |
| pass | after each level, back on the map (GC'd) | particles on the canvas | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | nodes in the fx layer | ≤ 0 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | rAF requests/s on the still map | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | live decoded audio, MB | ≤ 64 | start 1, worst 39.9 (after w1-6) | F1, B1 |
| pass | after each level, back on the map (GC'd) | Web Audio nodes (AudioHandlers) | ≤ start + 8 (19) | start 11, worst 11 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | &lt;audio> elements alive | ≤ start + 2 (4) | start 2, worst 2 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | window.__snNavLog entries | ≤ 500 | start 0, worst 97 (after w1-7) | F3 |
| pass | after each level, back on the map (GC'd) | the save's adjustLog entries | ≤ 200 | start 0, worst 0 (after start) | F1 |
| pass | on the title, untouched for 5 s | live decoded audio, MB | ≤ 2 | 0.7 MB in 2 clips | B1 |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations the compositor can't run | ≤ 2 | max 0; over in 0 of 42 samples | F1, B, C, D (by file) |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations running on hidden elements | ≤ 2 | max 0; over in 0 of 42 samples | F1, D2 (by file) |
| pass | the still map, 60 s untouched | rAF requests/s, median | ≤ 5 | 0 (max 13.3); main thread 1.9 % | F1, B1 |
| pass | a held Next (a reward), 40 s untouched, the idle nudge included | rAF requests/s, median | ≤ 5 | 4.8 (max 14.2); main thread 3.8 % | F1, F3 (nav.tsx), B1 |
| pass | phone ×4, while playing | every screen's median fps | ≥ 50 | lowest reward:w1-6 (60.4) | D5 (the runner); otherwise the screen's owner |
| pass | phone ×4, the still map | main thread %, median | ≤ 5 % | 1.9 % | F1 |
| pass | phone ×4, a held Next (a reward), the idle nudge included | main thread %, median | ≤ 6 % | 3.8 % (5.1, 4.2, 3.4, 2.9) | F1 (the ninja), F3 (the nudge), B1 (the reward) |
| n/a | phone ×4, the ninja standing still | main thread % at streak 0, mean | ≤ 6 % | not measured (--no-aura) | F1 |
| n/a | phone ×4, the ninja standing still | main thread % at streak 10, mean | ≤ 14 % | not measured (--no-aura) | F1 |
| pass | phone ×4, the World Flower | main thread %, median | ≤ 30 % | 22.4 % over 4 samples (19.7, 19.6, 25.1, 25.8) | B2 |
| pass | phone ×4, the World Flower | longest task, ms | ≤ 120 ms | 0 ms | B2 |
| n/a | the strike stress (streak-10 strikes, 7 a second) | particles at the peak | ≤ 350 | not measured (--stress 0) | F1 |
| n/a | 10 s after the stress | particles / fx nodes left | 0 / 0 | not measured (--stress 0) | F1 |
| pass | the whole soak | page reloads | 0 | 0 | all |
| pass | the whole soak | levels the bot finished | all | 6 of 6 | the scene's owner (or bot.ts) |

## After each level (on the map, after a forced GC)

| metric | start | per level → | last | slope / level | budget |
|---|---|---|---|---|---|
| heapMB | 5.3 | 5.3 9.1 9.6 10 10.1 10.6 11.1 | 11.1 | 0.75 | ok (≤ start + 8 (13.3)) |
| nodes | 237 | 237 297 315 328 338 350 364 | 364 | 18.21 | ok (≤ start + 600 (837)) |
| detachedNodes | 76 | 76 126 134 137 137 137 141 | 141 | 7.86 |  |
| attachedNodes | 161 | 161 171 181 191 201 213 223 | 223 | 10.36 |  |
| listeners | 252 | 252 305 331 304 304 304 331 | 331 | 7.43 | FAIL (≤ start + 40 (292)) |
| globalListeners | 20 | 20 33 33 33 33 33 33 | 33 | 1.39 |  |
| animations | 29 | 29 29 29 29 29 30 30 | 30 | 0.18 | ok (≤ start + 5 (34)) |
| animInfinite | 9 | 9 8 9 9 9 10 10 | 10 | 0.25 |  |
| animHiddenInfinite | 0 | 0 0 0 0 0 0 0 | 0 | 0 |  |
| animMainThreadInfinite | 0 | 0 0 0 0 0 0 0 | 0 | 0 |  |
| fxDomNodes | 0 | 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 0) |
| particles | 0 | 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| rafPerSec | 0 | 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| intervals | 1 | 1 1 1 1 1 1 1 | 1 | 0 | ok (≤ start + 1 (2)) |
| pendingTimeouts | 1 | 1 2 1 1 1 1 1 | 1 | -0.07 |  |
| mediaAlive | 2 | 2 2 2 2 2 2 2 | 2 | 0 | ok (≤ start + 2 (4)) |
| decodedMB | 1 | 1 25.3 33.4 39.6 39.6 39.9 39.5 | 39.5 | 5.39 | ok (≤ 64) |
| decodedTotalMB | 1 | 1 25.3 33.4 52 55.1 61.6 74.9 | 74.9 | 11.29 |  |
| decodedClips | 2 | 2 61 85 94 98 89 90 | 90 | 11.89 |  |
| audioHandlers | 11 | 11 11 10 10 10 10 10 | 10 | -0.18 | ok (≤ start + 8 (19)) |
| arrayBuffers | 10 | 10 69 93 102 106 97 98 | 98 | 11.89 |  |
| layoutObjects | 178 | 178 223 234 246 256 269 283 | 283 | 15.32 |  |
| navLog | 0 | 0 21 32 51 60 76 97 | 97 | 15.32 | ok (≤ 500) |
| adjustLog | 0 | 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 200) |
| imagesFetched | 56 | 56 76 87 87 87 87 91 | 91 | 4.54 |  |
| audioFetched | 3 | 3 64 88 129 137 148 167 | 167 | 25.32 |  |
| imgInDomMB | 18 | 18 17.8 18 18 18 18 18 | 18 | 0.01 |  |
| rendererRssMB | 437 | 437 797 925 978 1011 1043 1096 | 1096 | 91.25 |  |
| gpuRssMB | 81 | 81 91 93 102 104 104 104 | 104 | 3.79 |  |
| footprintMB | 83.4 | 83.4 160 209.1 241.9 269.7 298.7 342.9 | 342.9 | 39.87 |  |
| gpuFootprintMB | 14.9 | 14.9 14.2 14.1 14.1 14.2 14.9 14.3 | 14.3 | -0.01 |  |
| mem_blink_gc | 5.5 | 5.5 15.5 22.1 27.2 30.9 35.4 38.3 | 38.3 | 5.25 |  |
| mem_blink_objects | 2.1 | 2.1 3.3 4 3.9 4.1 4.3 4.8 | 4.8 | 0.36 |  |
| mem_canvas | 3.5 | 3.5 3.7 3.8 3.9 3.9 3.9 3.9 | 3.9 | 0.06 |  |
| mem_cc | 184.2 | 184.2 456.8 501.3 511.1 510.1 510.4 509.9 | 509.9 | 39.04 |  |
| mem_discardable | 204.5 | 204.5 444.9 513.4 507.2 507.3 503.7 511.3 | 511.3 | 36.85 |  |
| mem_malloc | 55.9 | 55.9 55.6 61.6 61.5 62.4 67.6 72.6 | 72.6 | 2.67 |  |
| mem_media | 2.4 | 2.4 2.4 2.4 2.4 2.4 2.4 2.4 | 2.4 | 0 |  |
| mem_mojo | 0 | 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_images | 0 | 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_strings | 0 | 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_partition_alloc | 16.5 | 16.5 79.9 120.4 155.1 180.5 202.9 238.3 | 238.3 | 34.7 |  |
| mem_shared_memory | 232.3 | 232.3 484.1 557.3 545.4 545.1 542.9 553.5 | 553.5 | 38.18 |  |
| mem_site_storage | 0 | 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_skia | 0.5 | 0.5 6 9.2 7.9 6.5 6.6 7 | 7 | 0.64 |  |
| mem_v8 | 7.2 | 7.2 11.3 11.7 12.4 12.7 13 13.4 | 13.4 | 0.82 |  |
| mem_web_cache | 1.3 | 1.3 1.4 1.4 1.4 1.4 1.4 1.4 | 1.4 | 0.01 |  |

## While playing (periodic samples): first half vs second half

| metric | first half | second half |
|---|---|---|
| fps | 60.7 | 60.7 |
| slowFramePct | 0 | 0 |
| mainThreadPct | 16.9 | 22.9 |
| scriptPct | 1.8 | 1.9 |
| stylePct | 3.1 | 4.4 |
| layoutPct | 0.2 | 0.4 |
| recalcPerSec | 62.2 | 65 |
| layoutPerSec | 6.7 | 12.5 |
| rendererPct | 88.9 | 91.9 |
| gpuPct | 12.6 | 16.9 |
| longTaskMs | 0 | 0 |
| rafPerSec | 72.8 | 84.5 |
| rafPerFrame | 1 | 1.3 |
| animHiddenInfinite | 0 | 0 |
| animMainThreadInfinite | 0 | 0 |
| animations | 46 | 70.9 |
| animInfinite | 30.9 | 53.4 |
| particles | 10.3 | 16.6 |
| particlesPeak | 95 | 123.8 |

## Phases (the title, the still map, a held Next, the ninja's aura, the strike stress)

| phase | what | fps | main % | style % | recalcs/s | rAF/s | renderer CPU % | GPU CPU % | particles (now / peak) | fx nodes | animations | decoded MB | Nodes | heap MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| title | the title, 5 s, untouched | 60.6 | 1.6 | 0.5 | 22.4 | 2.5 | 80 | 12 | 0 / 0 | 0 | 28 (21 inf, 0 main) | 0.7 | 168 | 5.2 |
| idle-map | map | 60.7 | 3.2 | 0.8 | 32.7 | 13.3 | 81 | 9 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.5 | 362 | 10.6 |
| idle-map | map | 60.9 | 3.1 | 0.8 | 32.8 | 13.3 | 81 | 9 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.5 | 376 | 11.2 |
| idle-map | map | 60.7 | 1.7 | 0.5 | 23.8 | 0 | 80 | 9 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.5 | 376 | 11.3 |
| idle-map | map | 61 | 1.8 | 0.6 | 23.8 | 0 | 81 | 9 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.5 | 376 | 10.7 |
| idle-map | map | 60.2 | 1.8 | 0.5 | 23.8 | 0 | 81 | 9 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.5 | 376 | 10.8 |
| idle-map | map | 60.1 | 1.9 | 0.6 | 23.7 | 0 | 81 | 10 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.5 | 362 | 10.6 |
| settled | after soak | 60.2 | 1.7 | 0.5 | 20.8 | 0 | 82 | 10 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.5 | 362 | 10.7 |
| settled | the reward (w1-7), Next ready | 60.6 | 10.3 | 2.1 | 60.1 | 0 | 84 | 7 | 0 / 0 | 0 | 14 (7 inf, 0 main) | 39.7 | 333 | 10.6 |
| idle-next | the reward (w1-7), a held Next, untouched | 60.7 | 5.1 | 0.9 | 31.5 | 14.2 | 81 | 7 | 0 / 57 | 0 | 14 (8 inf, 0 main) | 39.6 | 336 | 10.5 |
| idle-next | the reward (w1-7), a held Next, untouched | 60.9 | 4.2 | 0.8 | 30.9 | 9.5 | 80 | 7 | 0 / 0 | 0 | 14 (8 inf, 0 main) | 39.6 | 346 | 10.6 |
| idle-next | the reward (w1-7), a held Next, untouched | 60.8 | 3.4 | 0.8 | 25.2 | 0 | 81 | 7 | 0 / 0 | 0 | 14 (8 inf, 0 main) | 39.6 | 336 | 10.5 |
| idle-next | the reward (w1-7), a held Next, untouched | 60.9 | 2.9 | 0.6 | 25.5 | 0 | 80 | 7 | 0 / 0 | 0 | 14 (8 inf, 0 main) | 39.6 | 336 | 10.7 |

## Levels

| level | kind | secs | finished | max streak | streak at end | stuck |
|---|---|---|---|---|---|---|
| w1-2 | firstsound | 90 | yes | 8 | 8 |  |
| w1-3 | firstsound | 74 | yes | 16 | 16 |  |
| w1-4 | dojo | 58 | yes | 23 | 23 |  |
| w1-5 | dojo | 42 | yes | 33 | 33 |  |
| w1-6 | battle | 36 | yes | 41 | 41 |  |
| w1-7 | soundhunt | 71 | yes | 51 | 51 |  |

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
  "100ms at http://127.0.0.1:4831/assets/play-CM2ljLYJ.js:2:971": 1
 },
 "mods": {
  "visemeListeners": 1,
  "bufferCache": 90,
  "captionListeners": 3,
  "clipListeners": 3,
  "sayListeners": 2,
  "music": 1,
  "speaking": 0,
  "decodedLruMB": 39.5,
  "musicDecks": 2,
  "storeListeners": 4,
  "attemptSubs": 0,
  "saveBytes": 6313,
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
  "streakN": 51,
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

