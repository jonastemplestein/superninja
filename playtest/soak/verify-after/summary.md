# Soak verify-after

14 levels in one page (no reloads: none), fast=2, desktop 844×390, served prod, **with the docs/PERF.md fixes patched in (preview)**. Longest streak: 127. Page errors: 0.

**Soak invariant: FAIL**

- animMainThreadInfinite while playing: > 2 in 54/70 samples (max 11, e.g. {"@wave":3})
- animHiddenInfinite while playing: > 2 in 4/70 samples (max 3, e.g. {"@bt-orbit":3})

## After each level (on the map, after a forced GC)

| metric | baseline | per level → | last | slope / level | budget |
|---|---|---|---|---|---|
| heapMB | 3.7 | 3.7 6.6 7 7.4 7.5 7.8 8 8.2 8.7 8.8 8.9 9 9.1 9.3 9.3 | 9.3 | 0.28 | ok (≤ 11.7) |
| nodes | 167 | 167 190 208 218 230 240 250 260 334 344 354 364 374 384 222 | 222 | 12.95 | ok (≤ 767) |
| detachedNodes | 9 | 9 22 30 30 30 30 30 30 94 94 94 94 94 94 93 | 93 | 7.07 |  |
| attachedNodes | 158 | 158 168 178 188 200 210 220 230 240 250 260 270 280 290 129 | 129 | 5.88 |  |
| listeners | 251 | 251 277 277 277 277 277 277 277 279 279 279 279 279 279 240 | 240 | -0.12 | ok (≤ 291) |
| globalListeners | 17 | 17 30 30 30 30 30 30 30 30 30 30 30 30 30 30 | 30 | 0.33 |  |
| animations | 29 | 29 29 29 29 30 30 30 30 30 30 30 30 30 30 16 | 16 | -0.27 | ok (≤ 34) |
| animInfinite | 9 | 9 9 9 9 10 10 10 10 10 10 10 10 10 10 7 | 7 | 0 |  |
| animHiddenInfinite | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| animMainThreadInfinite | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| fxDomNodes | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 0) |
| particles | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| rafPerSec | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| intervals | 1 | 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 | 1 | 0 | ok (≤ 2) |
| pendingTimeouts | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mediaAlive | 2 | 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 | 2 | 0 | ok (≤ 4) |
| decodedMB | 0.9 | 0.9 14.9 20.6 30.8 33.3 35.6 39.8 39.1 39.7 40 39.8 39.7 39.2 39.6 40 | 40 | 2.07 | ok (≤ 64) |
| decodedTotalMB | 0.9 | 0.9 14.9 20.6 30.8 33.3 35.6 42 47.3 49.9 59.1 63.5 67.9 69.9 80.8 90.3 | 90.3 | 5.58 |  |
| decodedClips | 2 | 2 46 68 94 102 106 121 115 112 125 131 137 138 119 108 | 108 | 6.49 |  |
| audioHandlers | 11 | 11 11 11 11 11 11 11 11 11 11 11 11 11 11 11 | 11 | 0 | ok (≤ 19) |
| arrayBuffers | 4 | 4 48 70 96 104 108 123 117 114 127 133 139 140 121 110 | 110 | 6.49 |  |
| layoutObjects | 116 | 116 132 142 152 165 175 185 195 205 215 225 235 245 255 94 | 94 | 6.11 |  |
| navLog | 0 | 0 9 18 19 20 21 28 29 30 39 46 47 48 55 66 | 66 | 3.99 |  |
| imagesFetched | 54 | 54 73 84 84 84 84 87 89 92 102 107 107 107 114 126 | 126 | 3.81 |  |
| audioFetched | 3 | 3 49 71 97 105 110 132 143 149 173 191 205 209 227 244 | 244 | 15.28 |  |
| imgInDomMB | 22.5 | 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 15.6 | 15.6 | -0.17 |  |
| rendererRssMB | 347 | 347 784 950 999 1052 1086 1153 1182 1221 1257 1276 1292 1309 1327 1369 | 1369 | 51.65 |  |
| gpuRssMB | 73 | 73 96 94 103 103 103 104 104 115 120 115 115 115 115 116 | 116 | 2.32 |  |
| footprintMB | 82.4 | 82.4 178.1 222.1 257 308.4 342.9 404 416.9 444.3 465.7 464.9 488.5 487 495.3 508.3 | 508.3 | 28.18 |  |
| gpuFootprintMB | 13.8 | 13.8 14.3 14 14.6 14.5 14.6 14.3 15.3 15.3 14.9 14.9 14.7 14.7 14.7 13.9 | 13.9 | 0.03 |  |
| mem_blink_gc | 5 | 5 19.5 25.9 31 36.3 36.7 39.5 45.3 46.2 51 54.4 63.7 64.7 67.1 69.4 | 69.4 | 4.11 |  |
| mem_blink_objects | 1.6 | 1.6 2.4 2.7 2.9 3.4 3.3 3.5 3.8 3.8 4.2 4.2 4.8 4.8 5.2 4.5 | 4.5 | 0.21 |  |
| mem_canvas | 3.5 | 3.5 3.6 3.8 3.8 3.8 3.8 3.8 3.8 15.7 15.7 15.7 15.7 15.7 15.7 15.7 | 15.7 | 1.2 |  |
| mem_cc | 135.5 | 135.5 425.3 528.2 513.2 509.9 511.7 496.9 482 451.3 477.6 471.4 459.6 472.7 478.9 499 | 499 | 7.66 |  |
| mem_discardable | 125.3 | 125.3 407.6 512.6 510.2 510.6 508.8 512.5 511.1 511.3 514 515.3 487.4 496.2 495.1 512.6 | 512.6 | 11.02 |  |
| mem_malloc | 43.4 | 43.4 60.6 63.6 59.6 62.8 68.4 75.3 65.4 92.5 101.8 96.1 99.1 98.9 100 96.8 | 96.8 | 4.03 |  |
| mem_media | 2.4 | 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 | 2.4 | 0 |  |
| mem_mojo | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_images | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_strings | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_partition_alloc | 31.5 | 31.5 86.3 133.6 173.6 222.7 253 302.6 325.9 325.1 341.9 345.3 362.8 366.5 374.5 387.2 | 387.2 | 23.96 |  |
| mem_shared_memory | 152.5 | 152.5 450.1 555.7 546.6 548.5 545.1 557 548.2 558.7 568.9 568.2 527.5 543.4 543.1 559.5 | 559.5 | 12.06 |  |
| mem_site_storage | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_skia | 0.1 | 0.1 4.1 5.7 5.9 7.2 5.8 8 13.4 13 14.1 12.9 18.1 16.9 15.5 11.5 | 11.5 | 1.04 |  |
| mem_v8 | 5.9 | 5.9 9.3 9.9 10.2 10.3 10.6 11.2 11.4 11.8 12.1 11.9 12.3 12.5 12.4 12.5 | 12.5 | 0.34 |  |
| mem_web_cache | 1.1 | 1.1 1.1 1.1 1.1 1.1 1.1 1.1 1.1 2.2 1.7 1.7 1.7 1.7 1.5 1.2 | 1.2 | 0.04 |  |

## While playing (periodic samples): first half vs second half

| metric | first half | second half |
|---|---|---|
| fps | 60.6 | 60.6 |
| slowFramePct | 0 | 0 |
| mainThreadPct | 7.5 | 11 |
| scriptPct | 0.7 | 0.8 |
| stylePct | 1.2 | 1.4 |
| layoutPct | 0.1 | 0.1 |
| recalcPerSec | 122.8 | 125.6 |
| rendererPct | 17.1 | 23.1 |
| gpuPct | 14.8 | 17.3 |
| longTaskMs | 0 | 0 |
| rafPerSec | 79.7 | 88.8 |
| rafPerFrame | 1.2 | 1.3 |
| animHiddenInfinite | 0.3 | 0.3 |
| animMainThreadInfinite | 3.1 | 2.7 |
| animations | 55.6 | 57.6 |
| animInfinite | 40.3 | 38.9 |
| particles | 15.4 | 22 |
| particlesPeak | 101.7 | 130.8 |

## Phases (idle, the ninja's aura, the strike stress)

| phase | what | fps | main % | style % | recalcs/s | renderer CPU % | GPU CPU % | particles (now / peak) | fx nodes | animations | Nodes | heap MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| idle-map | map | 60.6 | 0.6 | 0.2 | 30.2 | 3 | 6 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 222 | 9.2 |
| idle-map | map | 60.6 | 0.8 | 0.3 | 30.7 | 4 | 9 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 222 | 9.3 |
| settled | after soak | 60.1 | 1.3 | 0.4 | 26.9 | 6 | 12 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 222 | 9.3 |

## Levels

| level | kind | secs | finished | max streak | streak at end | stuck |
|---|---|---|---|---|---|---|
| w1-2 | firstsound | 60 | yes | 8 | 8 |  |
| w1-3 | firstsound | 51 | yes | 16 | 16 |  |
| w1-4 | dojo | 63 | yes | 23 | 23 |  |
| w1-5 | dojo | 94 | yes | 25 | 13 |  |
| w1-6 | battle | 26 | yes | 23 | 23 |  |
| w1-7 | soundhunt | 74 | yes | 30 | 30 |  |
| w1-8 | swap | 51 | yes | 42 | 42 |  |
| w1-9 | run | 48 | yes | 48 | 48 |  |
| w1-10 | firstsound | 90 | yes | 61 | 61 |  |
| w1-11 | soundhunt | 75 | yes | 69 | 69 |  |
| w1-12 | swap | 101 | yes | 95 | 95 |  |
| w1-13 | battle | 27 | yes | 106 | 106 |  |
| w1-14 | story | 31 | yes | 108 | 108 |  |
| w1-15 | boss | 61 | yes | 127 | 127 |  |

## Last boundary: what is still running

```
{
 "animations": {
  "total": 16,
  "running": 7,
  "infinite": 7,
  "hiddenInfinite": 0,
  "mainThreadInfinite": 0,
  "finishedKept": 9,
  "top": [
   [
    "@popin",
    8
   ],
   [
    "@drift",
    6
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
  "100ms at http://127.0.0.1:5190/assets/play-9zkXfibF.js:1:971": 1
 },
 "mods": {
  "visemeListeners": 1,
  "bufferCache": 108,
  "captionListeners": 3,
  "clipListeners": 0,
  "sayListeners": 1,
  "music": 1,
  "speaking": 0,
  "storeListeners": 4,
  "attemptSubs": 0,
  "saveBytes": 3198,
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
  "streakN": 127,
  "owned": 0,
  "ownedConnected": 0,
  "busy": 0,
  "spotMounted": 0,
  "moveRunning": 0,
  "spotGen": 33,
  "narrateSubs": 0,
  "navStack": 1,
  "navSubs": 1,
  "nudgeSubs": 0,
  "holds": 0
 }
}
```

