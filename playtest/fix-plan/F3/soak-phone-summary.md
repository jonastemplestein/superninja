# Soak soak-phone

6 levels in one page (reloads: none), fast=2, phone emulation (844×390, DPR 3), CPU throttled 4×, served none from http://127.0.0.1:4803. Longest streak: 36. Page errors: 0.

## Budgets: pass

docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §11.1 and docs/PERF.md §5. "n/a": not judged on this run. Owners are the fix plan's lanes; an offending animation names the file that defines it.

| result | when | check | budget | measured | owner |
|---|---|---|---|---|---|
| pass | after each level, back on the map (GC'd) | DOM nodes (CDP, attached + detached) | ≤ start + 600 (766) | start 166, worst 256 (after w1-7) | all |
| pass | after each level, back on the map (GC'd) | JS heap, MB | ≤ start + 8 (12.2) | start 4.2, worst 8.6 (after w1-7) | all |
| pass | after each level, back on the map (GC'd) | event listeners | ≤ start + 40 (289) | start 249, worst 275 (after w1-2) | all |
| pass | after each level, back on the map (GC'd) | animations on the map | ≤ start + 5 (34) | start 29, worst 30 (after w1-6) | all |
| pass | after each level, back on the map (GC'd) | live intervals | ≤ start + 1 (2) | start 1, worst 1 (after start) | all |
| pass | after each level, back on the map (GC'd) | particles on the canvas | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | nodes in the fx layer | ≤ 0 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | rAF requests/s on the still map | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | live decoded audio, MB | ≤ 64 | start 0.9, worst 39.6 (after w1-7) | F1, B1 |
| pass | after each level, back on the map (GC'd) | Web Audio nodes (AudioHandlers) | ≤ start + 8 (19) | start 11, worst 11 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | &lt;audio> elements alive | ≤ start + 2 (4) | start 2, worst 2 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | window.__snNavLog entries | ≤ 500 | start 0, worst 31 (after w1-7) | F3 |
| pass | after each level, back on the map (GC'd) | the save's adjustLog entries | ≤ 200 | start 0, worst 0 (after start) | F1 |
| pass | on the title, untouched for 5 s | live decoded audio, MB | ≤ 2 | 0.1 MB in 1 clip | B1 |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations the compositor can't run | ≤ 2 | max 0; over in 0 of 38 samples | F1, B, C, D (by file) |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations running on hidden elements | ≤ 2 | max 0; over in 0 of 38 samples | F1, D2 (by file) |
| pass | the still map, 30 s untouched | rAF requests/s, median | ≤ 5 | 0 (max 0); main thread 1.6 % | F1, B1 |
| pass | a held Next (a reward), 40 s untouched, the idle nudge included | rAF requests/s, median | ≤ 5 | 4.3 (max 13.7); main thread 4.7 % | F1, F3 (nav.tsx), B1 |
| pass | phone ×4, while playing | every screen's median fps | ≥ 50 | lowest reward:w1-4 (59.5) | D5 (the runner); otherwise the screen's owner |
| pass | phone ×4, the still map | main thread %, median | ≤ 5 % | 1.6 % | F1 |
| pass | phone ×4, a held Next (a reward), the idle nudge included | main thread %, median | ≤ 6 % | 4.7 % (6, 5.2, 3.9, 4.1) | F1 (the ninja), F3 (the nudge), B1 (the reward) |
| pass | phone ×4, the ninja standing still | main thread % at streak 0, mean | ≤ 6 % | 3.8 % (5.8, 1.7) | F1 |
| pass | phone ×4, the ninja standing still | main thread % at streak 10, mean | ≤ 14 % | 7.5 % (9.8, 5.2) | F1 |
| pass | phone ×4, the World Flower | main thread %, median | ≤ 30 % | 29.1 % over 2 samples (26.8, 31.3) | B2 |
| pass | phone ×4, the World Flower | longest task, ms | ≤ 120 ms | 71 ms | B2 |
| pass | the strike stress (150 streak-10 strikes, 7 a second) | particles at the peak | ≤ 350 | 272 (fx nodes 86) | F1 |
| pass | 10 s after the stress | particles / fx nodes left | 0 / 0 | 0 / 0 | F1 |
| pass | the whole soak | page reloads | 0 | 0 | all |
| pass | the whole soak | levels the bot finished | all | 6 of 6 | the scene's owner (or bot.ts) |

## After each level (on the map, after a forced GC)

| metric | start | per level → | last | slope / level | budget |
|---|---|---|---|---|---|
| heapMB | 4.2 | 4.2 7.2 7.6 8 8.2 8.5 8.6 | 8.6 | 0.59 | ok (≤ start + 8 (12.2)) |
| nodes | 166 | 166 193 211 224 234 246 256 | 256 | 14.25 | ok (≤ start + 600 (766)) |
| detachedNodes | 9 | 9 26 34 37 37 37 37 | 37 | 3.89 |  |
| attachedNodes | 157 | 157 167 177 187 197 209 219 | 219 | 10.36 |  |
| listeners | 249 | 249 275 275 275 275 275 275 | 275 | 2.79 | ok (≤ start + 40 (289)) |
| globalListeners | 17 | 17 30 30 30 30 30 30 | 30 | 1.39 |  |
| animations | 29 | 29 29 29 29 29 30 30 | 30 | 0.18 | ok (≤ start + 5 (34)) |
| animInfinite | 9 | 9 9 9 9 9 10 10 | 10 | 0.18 |  |
| animHiddenInfinite | 0 | 0 0 0 0 0 0 0 | 0 | 0 |  |
| animMainThreadInfinite | 0 | 0 0 0 0 0 0 0 | 0 | 0 |  |
| fxDomNodes | 0 | 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 0) |
| particles | 0 | 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| rafPerSec | 0 | 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| intervals | 1 | 1 1 1 1 1 1 1 | 1 | 0 | ok (≤ start + 1 (2)) |
| pendingTimeouts | 0 | 0 0 0 0 0 0 0 | 0 | 0 |  |
| mediaAlive | 2 | 2 2 2 2 2 2 2 | 2 | 0 | ok (≤ start + 2 (4)) |
| decodedMB | 0.9 | 0.9 16.2 22.7 32.2 34.4 37.8 39.6 | 39.6 | 6.11 | ok (≤ 64) |
| decodedTotalMB | 0.9 | 0.9 16.2 22.7 32.2 34.4 37.8 45.9 | 45.9 | 6.78 |  |
| decodedClips | 2 | 2 49 73 99 107 113 115 | 115 | 17.89 |  |
| audioHandlers | 11 | 11 11 11 11 11 11 11 | 11 | 0 | ok (≤ start + 8 (19)) |
| arrayBuffers | 4 | 4 51 75 101 109 115 117 | 117 | 17.89 |  |
| layoutObjects | 117 | 117 133 143 156 166 179 189 | 189 | 11.82 |  |
| navLog | 0 | 0 9 18 22 23 24 31 | 31 | 4.57 | ok (≤ 500) |
| adjustLog | 0 | 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 200) |
| imagesFetched | 56 | 56 74 87 87 87 87 90 | 90 | 4.57 |  |
| audioFetched | 3 | 3 52 76 102 110 117 140 | 140 | 20.54 |  |
| imgInDomMB | 22.5 | 22.5 22.5 22.5 22.5 22.5 22.5 22.5 | 22.5 | 0 |  |
| rendererRssMB | 413 | 413 774 908 944 972 1009 1062 | 1062 | 88.61 |  |
| gpuRssMB | 83 | 83 94 96 105 105 106 107 | 107 | 3.75 |  |
| footprintMB | 76.6 | 76.6 150.4 191.6 227.6 259.2 282.5 320.2 | 320.2 | 37.95 |  |
| gpuFootprintMB | 15.4 | 15.4 15.7 16 16.2 16.1 16.5 15.6 | 15.6 | 0.08 |  |
| mem_blink_gc | 4.1 | 4.1 15.6 22.6 27.7 30.9 34 35.2 | 35.2 | 4.94 |  |
| mem_blink_objects | 1.5 | 1.5 2.1 2.4 2.9 3 3.2 3 | 3 | 0.26 |  |
| mem_canvas | 3.5 | 3.5 3.7 3.8 3.8 3.8 3.8 3.8 | 3.8 | 0.04 |  |
| mem_cc | 177.2 | 177.2 459.1 530.5 495.9 508.7 507.2 503.5 | 503.5 | 37.62 |  |
| mem_discardable | 193.8 | 193.8 437.5 514.7 509 502.6 506.2 511.7 | 511.7 | 38.54 |  |
| mem_malloc | 50.4 | 50.4 53.5 62.2 57.2 58.2 56.3 61.7 | 61.7 | 1.27 |  |
| mem_media | 2.4 | 2.4 2.4 2.4 2.4 2.4 2.4 2.4 | 2.4 | 0 |  |
| mem_mojo | 0 | 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_images | 0 | 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_strings | 0 | 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_partition_alloc | 15.5 | 15.5 66 104.6 141.7 172.3 196.8 232.8 | 232.8 | 35.04 |  |
| mem_shared_memory | 225.3 | 225.3 484 559.1 545.7 541.4 545.5 558.8 | 558.8 | 39.49 |  |
| mem_site_storage | 0 | 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_skia | 0.5 | 0.5 4.3 6.3 6.4 5.9 5.5 5.4 | 5.4 | 0.6 |  |
| mem_v8 | 6 | 6 9.5 10.1 10.4 10.6 11 11.1 | 11.1 | 0.67 |  |
| mem_web_cache | 1.2 | 1.2 1.3 1.3 1.3 1.3 1.3 1.3 | 1.3 | 0.01 |  |

## While playing (periodic samples): first half vs second half

| metric | first half | second half |
|---|---|---|
| fps | 60.6 | 60.5 |
| slowFramePct | 0 | 0.5 |
| mainThreadPct | 22.2 | 22.5 |
| scriptPct | 2.2 | 2 |
| stylePct | 4 | 4.2 |
| layoutPct | 0.3 | 0.3 |
| recalcPerSec | 63.2 | 64.1 |
| layoutPerSec | 8.7 | 9.5 |
| rendererPct | 92.5 | 92.6 |
| gpuPct | 16.2 | 15.1 |
| longTaskMs | 8.5 | 0 |
| rafPerSec | 76.1 | 78.1 |
| rafPerFrame | 1 | 1.3 |
| animHiddenInfinite | 0 | 0 |
| animMainThreadInfinite | 0 | 0 |
| animations | 72.2 | 44.2 |
| animInfinite | 60.6 | 32.7 |
| particles | 0.1 | 16 |
| particlesPeak | 93.5 | 109.7 |

## Phases (the title, the still map, a held Next, the ninja's aura, the strike stress)

| phase | what | fps | main % | style % | recalcs/s | rAF/s | renderer CPU % | GPU CPU % | particles (now / peak) | fx nodes | animations | decoded MB | Nodes | heap MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| title | the title, 5 s, untouched | 60.9 | 1.7 | 0.5 | 17.3 | 0 | 82 | 15 | 0 / 0 | 0 | 19 (17 inf, 0 main) | 0.1 | 90 | 4 |
| idle-map | map | 60.9 | 1.9 | 0.6 | 23.4 | 0 | 81 | 9 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.6 | 256 | 8.5 |
| idle-map | map | 60.9 | 1.6 | 0.5 | 23.7 | 0 | 80 | 9 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.6 | 256 | 8.6 |
| idle-map | map | 60.8 | 1.5 | 0.5 | 23.8 | 0 | 80 | 9 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.6 | 256 | 8.8 |
| settled | after soak | 60.3 | 1.5 | 0.3 | 20.9 | 0 | 81 | 8 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.6 | 256 | 8.6 |
| settled | the reward (w1-7), Next ready | 60.8 | 9.6 | 1.1 | 60.6 | 1.5 | 85 | 7 | 0 / 0 | 0 | 12 (5 inf, 0 main) | 39.6 | 232 | 8.6 |
| idle-next | the reward (w1-7), a held Next, untouched | 61 | 6 | 0.9 | 32.8 | 13.7 | 83 | 8 | 0 / 63 | 0 | 12 (6 inf, 0 main) | 40 | 263 | 8.8 |
| idle-next | the reward (w1-7), a held Next, untouched | 60.3 | 5.2 | 0.7 | 30.6 | 8.6 | 83 | 9 | 0 / 0 | 0 | 12 (6 inf, 0 main) | 40 | 247 | 8.6 |
| idle-next | the reward (w1-7), a held Next, untouched | 60.2 | 3.9 | 0.6 | 25 | 0 | 83 | 11 | 0 / 0 | 0 | 12 (6 inf, 0 main) | 40 | 235 | 8.5 |
| idle-next | the reward (w1-7), a held Next, untouched | 60.9 | 4.1 | 0.7 | 24.9 | 0 | 84 | 11 | 0 / 0 | 0 | 12 (6 inf, 0 main) | 40 | 235 | 8.5 |
| aura-t0 | ninja demo, streak 0, idle | 61 | 5.8 | 1.1 | 32.7 | 11.6 | 85 | 11 | 0 / 0 | 0 | 4 (3 inf, 0 main) | 40 | 175 | 8.5 |
| aura-t0 | ninja demo, streak 0, idle | 60.7 | 1.7 | 0.5 | 24.8 | 0 | 82 | 9 | 0 / 0 | 0 | 4 (3 inf, 0 main) | 40 | 175 | 8.6 |
| aura-t3 | ninja demo, streak 10, idle | 60.2 | 9.8 | 2.8 | 34.2 | 15.1 | 87 | 14 | 0 / 99 | 0 | 60 (49 inf, 0 main) | 40 | 271 | 8.6 |
| aura-t3 | ninja demo, streak 10, idle | 60.6 | 5.2 | 2 | 25.5 | 0 | 83 | 12 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 40 | 271 | 8.6 |
| settled | before stress | 60.3 | 5 | 2 | 23.3 | 0 | 84 | 13 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 40 | 271 | 8.8 |
| stress | strike 1/150 | 61 | 16 | 5.1 | 60.3 | 0 | 87 | 13 | 0 / 0 | 0 | 63 (49 inf, 0 main) | 40 | 323 | 9.1 |
| stress | strike 65/150 | 60.8 | 87.1 | 9.2 | 112.2 | 177.2 | 133 | 26 | 194 / 269 | 73 | 74 (49 inf, 0 main) | 40 | 596 | 8.9 |
| stress | strike 127/150 | 57.4 | 89.7 | 9.6 | 106.3 | 163.5 | 134 | 28 | 233 / 281 | 78 | 81 (49 inf, 0 main) | 40 | 982 | 11 |
| stress | last strike | 60.6 | 82.9 | 8.8 | 102.9 | 147.3 | 130 | 26 | 186 / 275 | 38 | 84 (55 inf, 0 main) | 40 | 600 | 9 |
| settled | 10 s after the stress | 60.4 | 5.2 | 2 | 22.8 | 0 | 84 | 13 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 40 | 271 | 9 |
| settled | map after the stress | 60.7 | 1.6 | 0.5 | 21.3 | 0 | 81 | 10 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 40 | 256 | 8.7 |

## Levels

| level | kind | secs | finished | max streak | streak at end | stuck |
|---|---|---|---|---|---|---|
| w1-2 | firstsound | 73 | yes | 8 | 8 |  |
| w1-3 | firstsound | 62 | yes | 16 | 16 |  |
| w1-4 | dojo | 59 | yes | 23 | 23 |  |
| w1-5 | dojo | 64 | yes | 33 | 33 |  |
| w1-6 | battle | 29 | yes | 36 | 6 |  |
| w1-7 | soundhunt | 87 | yes | 9 | 6 |  |

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
  "100ms at http://127.0.0.1:4803/assets/play-C3cbwt7C.js:1:971": 1
 },
 "mods": {
  "visemeListeners": 1,
  "bufferCache": 115,
  "captionListeners": 3,
  "clipListeners": 1,
  "sayListeners": 2,
  "music": 1,
  "speaking": 0,
  "decodedLruMB": 39.6,
  "musicDecks": 2,
  "storeListeners": 4,
  "attemptSubs": 0,
  "saveBytes": 1807,
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
  "spotGen": 15,
  "navStack": 1,
  "navSubs": 2,
  "nudgeSubs": 0,
  "holds": 0,
  "narrateSubs": 0
 }
}
```

