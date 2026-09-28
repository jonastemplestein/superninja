# Soak soak-phone

6 levels in one page (reloads: none), fast=2, phone emulation (844×390, DPR 3), CPU throttled 4×, served prod from http://127.0.0.1:4832 (snapshot built 2026-09-27T12:52:29.786Z). Longest streak: 25. Page errors: 0.

## Budgets: **FAIL** (2: listeners, rafPerSec)

docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §11.1 and docs/PERF.md §5. "n/a": not judged on this run. Owners are the fix plan's lanes; an offending animation names the file that defines it.

| result | when | check | budget | measured | owner |
|---|---|---|---|---|---|
| pass | after each level, back on the map (GC'd) | DOM nodes (CDP, attached + detached) | ≤ start + 600 (837) | start 237, worst 274 (after w1-wu3) | all |
| pass | after each level, back on the map (GC'd) | JS heap, MB | ≤ start + 8 (13.3) | start 5.3, worst 9.6 (after w1-wu6) | all |
| **FAIL** | after each level, back on the map (GC'd) | event listeners | ≤ start + 40 (292) | start 252, worst 331 (after w1-wu2); over after 6 of 7 boundaries, from w1-wu1 | all |
| pass | after each level, back on the map (GC'd) | animations on the map | ≤ start + 5 (34) | start 29, worst 29 (after start) | all |
| pass | after each level, back on the map (GC'd) | live intervals | ≤ start + 1 (2) | start 1, worst 1 (after start) | all |
| pass | after each level, back on the map (GC'd) | particles on the canvas | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | nodes in the fx layer | ≤ 0 | start 0, worst 0 (after start) | F1 |
| **FAIL** | after each level, back on the map (GC'd) | rAF requests/s on the still map | ≤ 5 | start 0, worst 31.8 (after w1-wu3); over after 1 of 7 boundaries, from w1-wu3 | F1 |
| pass | after each level, back on the map (GC'd) | live decoded audio, MB | ≤ 64 | start 1, worst 40 (after w1-wu4) | F1, B1 |
| pass | after each level, back on the map (GC'd) | Web Audio nodes (AudioHandlers) | ≤ start + 8 (19) | start 11, worst 11 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | &lt;audio> elements alive | ≤ start + 2 (4) | start 2, worst 2 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | window.__snNavLog entries | ≤ 500 | start 0, worst 85 (after w1-wu6) | F3 |
| pass | after each level, back on the map (GC'd) | the save's adjustLog entries | ≤ 200 | start 0, worst 1 (after w1-wu3) | F1 |
| pass | on the title, untouched for 5 s | live decoded audio, MB | ≤ 2 | 0.7 MB in 2 clips | B1 |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations the compositor can't run | ≤ 2 | max 0; over in 0 of 31 samples | F1, B, C, D (by file) |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations running on hidden elements | ≤ 2 | max 0; over in 0 of 31 samples | F1, D2 (by file) |
| pass | the still map, 60 s untouched | rAF requests/s, median | ≤ 5 | 0 (max 13.3); main thread 1.2 % | F1, B1 |
| pass | a held Next (a reward), 40 s untouched, the idle nudge included | rAF requests/s, median | ≤ 5 | 4.8 (max 14.7); main thread 1.3 % | F1, F3 (nav.tsx), B1 |
| pass | phone ×4, while playing | every screen's median fps | ≥ 50 | lowest level:w1-wu2 (60.2) | D5 (the runner); otherwise the screen's owner |
| pass | phone ×4, the still map | main thread %, median | ≤ 5 % | 1.2 % | F1 |
| pass | phone ×4, a held Next (a reward), the idle nudge included | main thread %, median | ≤ 6 % | 1.3 % (2.5, 1.5, 0.9, 1) | F1 (the ninja), F3 (the nudge), B1 (the reward) |
| pass | phone ×4, the ninja standing still | main thread % at streak 0, mean | ≤ 6 % | 1.8 % (2.7, 0.9) | F1 |
| pass | phone ×4, the ninja standing still | main thread % at streak 10, mean | ≤ 14 % | 5.1 % (6.3, 3.9) | F1 |
| n/a | phone ×4, the World Flower | main thread %, median | ≤ 30 % | not measured (no World Flower visit in this run) | B2 |
| n/a | phone ×4, the World Flower | longest task, ms | ≤ 120 ms | not measured (no World Flower visit in this run) | B2 |
| pass | the strike stress (150 streak-10 strikes, 7 a second) | particles at the peak | ≤ 350 | 258 (fx nodes 86) | F1 |
| pass | 10 s after the stress | particles / fx nodes left | 0 / 0 | 0 / 0 | F1 |
| pass | the whole soak | page reloads | 0 | 0 | all |
| pass | the whole soak | levels the bot finished | all | 6 of 6 | the scene's owner (or bot.ts) |

## After each level (on the map, after a forced GC)

| metric | start | per level → | last | slope / level | budget |
|---|---|---|---|---|---|
| heapMB | 5.3 | 5.3 8.4 9.1 9.4 9.3 9.5 9.6 | 9.6 | 0.55 | ok (≤ start + 8 (13.3)) |
| nodes | 237 | 237 252 264 274 266 266 266 | 266 | 4.18 | ok (≤ start + 600 (837)) |
| detachedNodes | 76 | 76 91 103 113 105 105 105 | 105 | 4.18 |  |
| attachedNodes | 161 | 161 161 161 161 161 161 161 | 161 | 0 |  |
| listeners | 252 | 252 305 331 304 304 304 305 | 305 | 4.64 | FAIL (≤ start + 40 (292)) |
| globalListeners | 20 | 20 33 33 33 33 33 33 | 33 | 1.39 |  |
| animations | 29 | 29 28 29 29 29 29 29 | 29 | 0.07 | ok (≤ start + 5 (34)) |
| animInfinite | 9 | 9 8 9 9 9 9 8 | 8 | -0.04 |  |
| animHiddenInfinite | 0 | 0 0 0 0 0 0 0 | 0 | 0 |  |
| animMainThreadInfinite | 0 | 0 0 0 0 0 0 0 | 0 | 0 |  |
| fxDomNodes | 0 | 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 0) |
| particles | 0 | 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| rafPerSec | 0 | 0 0 0 31.8 0 0 0 | 0 | 0 | FAIL (≤ 5) |
| intervals | 1 | 1 1 1 1 1 1 1 | 1 | 0 | ok (≤ start + 1 (2)) |
| pendingTimeouts | 1 | 1 2 1 1 1 1 2 | 2 | 0.04 |  |
| mediaAlive | 2 | 2 2 2 2 2 2 2 | 2 | 0 | ok (≤ start + 2 (4)) |
| decodedMB | 1 | 1 29.4 39.8 39.4 40 39.6 39.9 | 39.9 | 4.9 | ok (≤ 64) |
| decodedTotalMB | 1 | 1 29.4 52.6 72.8 91.2 99.9 105.4 | 105.4 | 17.6 |  |
| decodedClips | 2 | 2 61 76 88 88 103 100 | 100 | 13.93 |  |
| audioHandlers | 11 | 11 11 10 11 10 10 11 | 11 | -0.07 | ok (≤ start + 8 (19)) |
| arrayBuffers | 10 | 10 69 84 96 96 111 108 | 108 | 13.93 |  |
| layoutObjects | 178 | 178 185 190 198 189 189 189 | 189 | 1.43 |  |
| navLog | 0 | 0 20 43 58 64 73 85 | 85 | 13.64 | ok (≤ 500) |
| adjustLog | 0 | 0 0 0 1 1 1 1 | 1 | 0.21 | ok (≤ 200) |
| imagesFetched | 56 | 56 64 72 79 85 101 101 | 101 | 7.93 |  |
| audioFetched | 3 | 3 63 103 146 162 196 205 | 205 | 33.25 |  |
| imgInDomMB | 18 | 18 17.8 18 18 18 18 17.8 | 17.8 | -0.01 |  |
| rendererRssMB | 427 | 427 741 897 952 977 1006 1024 | 1024 | 85.75 |  |
| gpuRssMB | 81 | 81 85 93 95 95 95 97 | 97 | 2.5 |  |
| footprintMB | 81.7 | 81.7 145 185.3 214.9 238.7 258.3 271.3 | 271.3 | 30.31 |  |
| gpuFootprintMB | 15.2 | 15.2 13.9 14.5 15.2 15.2 14.8 16.2 | 16.2 | 0.2 |  |
| mem_blink_gc | 5.5 | 5.5 12.2 16.8 22.2 25.4 28.3 30.6 | 30.6 | 4.15 |  |
| mem_blink_objects | 2.1 | 2.1 3 3.3 3.7 3.9 3.8 3.9 | 3.9 | 0.27 |  |
| mem_canvas | 3.5 | 3.5 3.6 3.7 3.8 3.8 3.8 3.8 | 3.8 | 0.05 |  |
| mem_cc | 174.3 | 174.3 418.8 518.8 505.8 487.1 495.1 492.3 | 492.3 | 38.39 |  |
| mem_discardable | 193.2 | 193.2 408.5 504 512.6 504.8 509.8 507.2 | 507.2 | 40.91 |  |
| mem_malloc | 52.5 | 52.5 47.7 51.3 51.3 54.2 53.6 52.3 | 52.3 | 0.5 |  |
| mem_media | 2.4 | 2.4 2.4 2.4 2.4 2.4 2.4 2.4 | 2.4 | 0 |  |
| mem_mojo | 0 | 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_images | 0 | 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_strings | 0 | 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_partition_alloc | 17.6 | 17.6 75.6 115 141.8 159 179.3 195.2 | 195.2 | 28.01 |  |
| mem_shared_memory | 219.6 | 219.6 441.3 546.4 548.3 541.7 546.5 546.8 | 546.8 | 42.4 |  |
| mem_site_storage | 0 | 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_skia | 0.5 | 0.5 3.3 3.2 4 5.5 8.8 8.6 | 8.6 | 1.34 |  |
| mem_v8 | 7.2 | 7.2 10.6 11.2 11.8 11.6 11.8 11.9 | 11.9 | 0.6 |  |
| mem_web_cache | 1.3 | 1.3 1.4 1.4 1.4 1.4 1.4 1.4 | 1.4 | 0.01 |  |

## While playing (periodic samples): first half vs second half

| metric | first half | second half |
|---|---|---|
| fps | 60.4 | 60.7 |
| slowFramePct | 0.2 | 0 |
| mainThreadPct | 14 | 20.1 |
| scriptPct | 1.7 | 1.9 |
| stylePct | 2 | 4 |
| layoutPct | 0.2 | 0.2 |
| recalcPerSec | 62.1 | 63.2 |
| layoutPerSec | 6.8 | 8.5 |
| rendererPct | 87.3 | 90.7 |
| gpuPct | 10.4 | 15.5 |
| longTaskMs | 0 | 0 |
| rafPerSec | 80 | 71.1 |
| rafPerFrame | 1.3 | 1 |
| animHiddenInfinite | 0 | 0 |
| animMainThreadInfinite | 0 | 0 |
| animations | 26.9 | 62.3 |
| animInfinite | 15.8 | 43.5 |
| particles | 0.4 | 11.6 |
| particlesPeak | 95.3 | 114.9 |

## Phases (the title, the still map, a held Next, the ninja's aura, the strike stress)

| phase | what | fps | main % | style % | recalcs/s | rAF/s | renderer CPU % | GPU CPU % | particles (now / peak) | fx nodes | animations | decoded MB | Nodes | heap MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| title | the title, 5 s, untouched | 60.5 | 1.6 | 0.5 | 22.3 | 2.5 | 80 | 12 | 0 / 0 | 0 | 28 (21 inf, 0 main) | 0.7 | 168 | 5.2 |
| idle-map | map | 60.9 | 2.9 | 0.6 | 32.8 | 13.3 | 82 | 8 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 39.3 | 265 | 9.4 |
| idle-map | map | 60.8 | 2.4 | 0.6 | 32.6 | 13.3 | 81 | 9 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 39.3 | 279 | 9.7 |
| idle-map | map | 60.8 | 1.2 | 0.4 | 23.7 | 0 | 80 | 8 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 39.3 | 279 | 9.9 |
| idle-map | map | 60.8 | 1.2 | 0.4 | 23.8 | 0 | 80 | 8 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 39.3 | 279 | 10 |
| idle-map | map | 60.9 | 1.2 | 0.4 | 23.8 | 0 | 80 | 8 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 39.3 | 279 | 10.1 |
| idle-map | map | 60.9 | 1.2 | 0.4 | 23.8 | 0 | 80 | 8 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 39.3 | 279 | 9.5 |
| settled | after soak | 60.5 | 1.3 | 0.4 | 19.9 | 0 | 80 | 9 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 39.3 | 265 | 9.5 |
| settled | the reward (w1-wu6), Next ready | 60.7 | 3.5 | 0.5 | 60.2 | 0 | 82 | 4 | 0 / 0 | 0 | 5 (2 inf, 0 main) | 39.5 | 186 | 9.4 |
| idle-next | the reward (w1-wu6), a held Next, untouched | 60.9 | 2.5 | 0.5 | 32.7 | 14.7 | 80 | 5 | 0 / 63 | 0 | 5 (3 inf, 0 main) | 39.5 | 217 | 9.9 |
| idle-next | the reward (w1-wu6), a held Next, untouched | 60.8 | 1.5 | 0.3 | 30.7 | 9.6 | 79 | 5 | 0 / 0 | 0 | 5 (3 inf, 0 main) | 39.5 | 229 | 9.3 |
| idle-next | the reward (w1-wu6), a held Next, untouched | 60.7 | 0.9 | 0.2 | 24.4 | 0 | 79 | 5 | 0 / 0 | 0 | 5 (3 inf, 0 main) | 39.5 | 229 | 9.4 |
| idle-next | the reward (w1-wu6), a held Next, untouched | 60.7 | 1 | 0.3 | 25.1 | 0 | 79 | 5 | 0 / 0 | 0 | 5 (3 inf, 0 main) | 39.5 | 229 | 9.5 |
| aura-t0 | ninja demo, streak 0, idle | 60.3 | 2.7 | 0.6 | 26.8 | 0 | 81 | 7 | 0 / 0 | 0 | 4 (3 inf, 0 main) | 39.5 | 488 | 9.5 |
| aura-t0 | ninja demo, streak 0, idle | 60.8 | 0.9 | 0.2 | 24.5 | 0 | 79 | 6 | 0 / 0 | 0 | 4 (3 inf, 0 main) | 39.5 | 488 | 9.6 |
| aura-t3 | ninja demo, streak 10, idle | 60.3 | 6.3 | 1.7 | 33.7 | 15.1 | 83 | 10 | 0 / 99 | 0 | 63 (49 inf, 0 main) | 39.5 | 338 | 9.5 |
| aura-t3 | ninja demo, streak 10, idle | 61 | 3.9 | 1.4 | 25.2 | 0 | 82 | 10 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 39.5 | 338 | 9.5 |
| settled | before stress | 60.7 | 3.3 | 1.5 | 21.4 | 0 | 81 | 11 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 39.5 | 338 | 9.7 |
| stress | strike 1/150 | 60.5 | 12.4 | 4.1 | 61.3 | 1 | 84 | 10 | 26 / 0 | 3 | 66 (51 inf, 0 main) | 39.5 | 395 | 10 |
| stress | strike 67/150 | 61.5 | 73.1 | 7.3 | 118.8 | 202.2 | 123 | 21 | 243 / 275 | 31 | 77 (51 inf, 0 main) | 39.5 | 522 | 11.7 |
| stress | strike 134/150 | 61.2 | 75.5 | 7.4 | 116.5 | 204.8 | 124 | 21 | 193 / 273 | 35 | 80 (55 inf, 0 main) | 39.5 | 651 | 12.2 |
| stress | last strike | 61.1 | 63.7 | 7 | 103.4 | 167.1 | 116 | 20 | 210 / 297 | 39 | 78 (55 inf, 0 main) | 39.5 | 465 | 10.9 |
| settled | 10 s after the stress | 60.2 | 2.8 | 1 | 20.4 | 0 | 81 | 10 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 39.5 | 338 | 9.8 |
| settled | map after the stress | 60.4 | 2.7 | 0.5 | 27.9 | 12.9 | 81 | 9 | 0 / 0 | 0 | 33 (12 inf, 0 main) | 39.5 | 276 | 9.7 |

## Levels

| level | kind | secs | finished | max streak | streak at end | stuck |
|---|---|---|---|---|---|---|
| w1-wu1 | ears | 57 | yes | 3 | 3 |  |
| w1-wu2 | picread | 62 | yes | 7 | 7 |  |
| w1-wu3 | ears | 53 | yes | 14 | 14 |  |
| w1-wu4 | picread | 31 | yes | 16 | 16 |  |
| w1-wu5 | ears | 34 | yes | 22 | 22 |  |
| w1-wu6 | picread | 19 | yes | 25 | 25 |  |

## Last boundary: what is still running

```
{
 "animations": {
  "total": 29,
  "running": 9,
  "infinite": 8,
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
    4
   ],
   [
    "@petal-drift-l",
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
    "@map-hop",
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
  "100ms at http://127.0.0.1:4832/assets/play-BdosDeei.js:2:971": 1
 },
 "mods": {
  "visemeListeners": 1,
  "bufferCache": 100,
  "captionListeners": 3,
  "clipListeners": 3,
  "sayListeners": 2,
  "music": 1,
  "speaking": 0,
  "decodedLruMB": 39.9,
  "musicDecks": 2,
  "storeListeners": 4,
  "attemptSubs": 0,
  "saveBytes": 5105,
  "adjustLog": 1,
  "poseSubs": 1,
  "particles": 0,
  "particleKinds": {},
  "glowCache": 14,
  "helpStack": 1,
  "nudgeListeners": 1,
  "uprightSubs": 1,
  "imgCache": 2,
  "fxDomChildren": 0,
  "streakListeners": 1,
  "streakSubs": 0,
  "streakN": 25,
  "owned": 0,
  "ownedConnected": 0,
  "busy": 0,
  "spotMounted": 0,
  "moveRunning": 0,
  "spotGen": 12,
  "navStack": 1,
  "navSubs": 2,
  "nudgeSubs": 0,
  "holds": 0,
  "narrateSubs": 0
 }
}
```

