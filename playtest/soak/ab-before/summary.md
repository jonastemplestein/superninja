# Soak ab-before

12 levels in one page (no reloads: none), fast=2, phone emulation (844×390, DPR 3), CPU throttled 4×, served prod. Longest streak: 46. Page errors: 0.

**Soak invariant: FAIL**

- rafPerSec: FAIL (> 5 after start, w1-2, w1-3, w1-4…)
- mediaAlive: FAIL (> 3 after w1-2, w1-3, w1-4, w1-5…)
- audioHandlers: FAIL (> 17 after w1-3, w1-4, w1-5, w1-6…)
- fps: median under 50 on level:w1-9 (35.9)
- idle: the still map keeps the main thread 10.2% busy (> 5%, CPU ×4)
- animMainThreadInfinite while playing: > 2 in 61/63 samples (max 29, e.g. {"@nj-orbit":9,"@wave":3})
- animHiddenInfinite while playing: > 2 in 18/63 samples (max 27, e.g. {"@nj-swirl":1,"@nj-rise":14,"@nj-orbit":9})

## After each level (on the map, after a forced GC)

| metric | baseline | per level → | last | slope / level | budget |
|---|---|---|---|---|---|
| heapMB | 3.7 | 3.7 6.7 7 7.4 7.5 7.8 8 8.2 8.7 8.8 8.9 9 9.1 | 9.1 | 0.32 | ok (≤ 11.7) |
| nodes | 165 | 165 194 218 232 246 262 278 290 368 384 400 412 426 | 426 | 22.59 | ok (≤ 765) |
| detachedNodes | 7 | 7 26 40 44 48 52 58 60 128 134 140 142 146 | 146 | 12.37 |  |
| attachedNodes | 158 | 158 168 178 188 198 210 220 230 240 250 260 270 280 | 280 | 10.22 |  |
| listeners | 251 | 251 277 277 277 277 277 277 277 279 279 279 279 279 | 279 | 1.08 | ok (≤ 291) |
| globalListeners | 17 | 17 30 30 30 30 30 30 30 30 30 30 30 30 | 30 | 0.43 |  |
| animations | 29 | 29 29 29 29 29 30 30 30 30 30 30 30 30 | 30 | 0.11 | ok (≤ 34) |
| animInfinite | 9 | 9 9 9 9 9 10 10 10 10 10 10 10 10 | 10 | 0.11 |  |
| animHiddenInfinite | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| animMainThreadInfinite | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| fxDomNodes | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 0) |
| particles | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| rafPerSec | 120 | 120 119.3 120.2 120.2 120.3 120.5 120.3 120.4 119.7 119.3 119.2 120.2 119.9 | 119.9 | -0.02 | FAIL (> 5 after start, w1-2, w1-3, w1-4…) |
| intervals | 1 | 1 1 1 1 1 1 1 1 1 1 1 1 1 | 1 | 0 | ok (≤ 2) |
| pendingTimeouts | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mediaAlive | 1 | 1 4 7 9 11 13 16 17 19 22 25 26 28 | 28 | 2.21 | FAIL (> 3 after w1-2, w1-3, w1-4, w1-5…) |
| decodedMB | 0.9 | 0.9 14.9 20.4 30.5 32.5 35.8 42.3 47.3 49.9 55.8 60.5 63.2 63.7 | 63.7 | 4.95 | ok (≤ 64) |
| decodedClips | 2 | 2 46 68 93 100 106 129 140 145 168 187 201 204 | 204 | 15.45 |  |
| audioHandlers | 9 | 9 15 21 25 29 33 39 41 45 51 57 59 63 | 63 | 4.43 | FAIL (> 17 after w1-3, w1-4, w1-5, w1-6…) |
| arrayBuffers | 4 | 4 48 70 95 102 108 131 142 147 170 189 203 206 | 206 | 15.45 |  |
| layoutObjects | 116 | 116 132 142 152 162 175 185 195 205 215 225 235 245 | 245 | 10.53 |  |
| navLog | 0 | 0 9 18 19 20 21 28 29 30 39 46 47 48 | 48 | 3.73 |  |
| imagesFetched | 54 | 54 73 85 85 85 85 89 91 94 102 105 105 105 | 105 | 3.41 |  |
| audioFetched | 3 | 3 49 71 96 103 110 133 144 150 173 192 206 209 | 209 | 15.74 |  |
| imgInDomMB | 22.5 | 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 | 22.5 | 0 |  |
| rendererRssMB | 423 | 423 1075 1155 1197 1244 1282 1356 1372 1413 1464 1483 1507 1524 | 1524 | 62.13 |  |
| gpuRssMB | 77 | 77 95 97 107 108 108 108 108 119 119 119 119 119 | 119 | 2.85 |  |
| footprintMB | 91.4 | 91.4 202.6 246.5 290.6 337.5 367.1 429.9 455.3 480.9 496.5 519.8 539.6 539.7 | 539.7 | 35.5 |  |
| gpuFootprintMB | 13.6 | 13.6 14.4 14.5 14.5 14.1 15 14.7 14.9 15.2 14.7 14.8 15.1 15.2 | 15.2 | 0.09 |  |
| mem_blink_gc | 4.9 | 4.9 22.4 29.2 34.6 39.9 42 45.8 51.8 53.1 59 64.3 75.6 76.8 | 76.8 | 5.2 |  |
| mem_blink_objects | 1.6 | 1.6 2.4 2.8 3 3.1 3.3 3.5 3.8 3.9 4.3 4.5 5 5 | 5 | 0.25 |  |
| mem_canvas | 3.5 | 3.5 3.6 3.8 3.8 3.8 3.8 3.8 3.8 15.7 15.7 15.7 15.7 15.7 | 15.7 | 1.32 |  |
| mem_cc | 185 | 185 516.1 529.2 493.5 488.4 496.5 428 473.8 460.1 475.6 476.2 453.1 457.4 | 457.4 | 5.35 |  |
| mem_discardable | 185.8 | 185.8 497.7 515.1 506.7 503 504.1 510.8 500.8 504.1 512.2 501.6 486.7 494.4 | 494.4 | 9.66 |  |
| mem_malloc | 52.6 | 52.6 72 75.1 73.3 73.6 76.4 82 82 105.4 102.4 112.5 110.1 110.8 | 110.8 | 4.65 |  |
| mem_media | 2.4 | 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 | 2.4 | 0 |  |
| mem_mojo | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_images | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_strings | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_partition_alloc | 31.3 | 31.3 91.5 140.3 182 225.9 258.3 308.3 333.6 337.1 363.1 372.3 386.8 391.2 | 391.2 | 29.7 |  |
| mem_shared_memory | 217 | 217 545.6 561.2 546.9 536.2 543.8 554 541.3 554.1 569.2 556.9 537.9 545 | 545 | 11.06 |  |
| mem_site_storage | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_skia | 0.3 | 0.3 4.9 5.9 7.5 6.7 6.9 7.8 12 11 14 14.2 15.8 14.3 | 14.3 | 1.13 |  |
| mem_v8 | 6 | 6 9.1 9.8 10.1 10.4 10.9 10.8 11.3 11.8 12.1 12 12.4 12.2 | 12.2 | 0.39 |  |
| mem_web_cache | 1.2 | 1.2 1.2 1.2 1.2 1.2 1.2 1.2 1.2 2.3 1.8 1.6 1.6 1.6 | 1.6 | 0.05 |  |

## While playing (periodic samples): first half vs second half

| metric | first half | second half |
|---|---|---|
| fps | 60.7 | 57.8 |
| slowFramePct | 0.1 | 8.2 |
| mainThreadPct | 29.3 | 40.5 |
| scriptPct | 2.2 | 2.7 |
| stylePct | 5.8 | 5.6 |
| layoutPct | 0.4 | 0.5 |
| recalcPerSec | 121.8 | 121 |
| rendererPct | 95.4 | 98.3 |
| gpuPct | 14.7 | 13.9 |
| longTaskMs | 5.5 | 30.9 |
| rafPerSec | 124.6 | 123.8 |
| rafPerFrame | 2.1 | 2.1 |
| animHiddenInfinite | 5.3 | 2 |
| animMainThreadInfinite | 19.6 | 18.6 |
| animations | 55.4 | 52.5 |
| animInfinite | 39.9 | 37.5 |
| particles | 9.3 | 9 |
| particlesPeak | 103.5 | 121.5 |

## Phases (idle, the ninja's aura, the strike stress)

| phase | what | fps | main % | style % | recalcs/s | renderer CPU % | GPU CPU % | particles (now / peak) | fx nodes | animations | Nodes | heap MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| idle-map | map | 60.6 | 20.7 | 1.3 | 53.7 | 88 | 12 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 426 | 9 |
| idle-map | map | 60.3 | 11.2 | 1.7 | 60 | 86 | 13 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 426 | 9.1 |
| idle-map | map | 60.2 | 11.5 | 1.7 | 60 | 86 | 13 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 426 | 9.3 |
| idle-map | map | 61 | 10.2 | 1.4 | 60 | 85 | 12 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 426 | 9 |
| idle-map | map | 60.7 | 10.1 | 1.6 | 60 | 84 | 11 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 426 | 9.2 |
| idle-map | map | 61.1 | 10 | 1.4 | 60 | 84 | 11 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 426 | 9 |
| settled | after soak | 60.2 | 11.9 | 1.7 | 59.9 | 86 | 13 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 426 | 9 |
| aura-t0 | ninja demo, streak 0, idle | 60.6 | 17 | 3.7 | 59.9 | 87 | 10 | 0 / 0 | 0 | 28 (27 inf, 9 main) | 302 | 8.9 |
| aura-t0 | ninja demo, streak 0, idle | 61.1 | 15.1 | 3.7 | 60.2 | 85 | 7 | 0 / 0 | 0 | 28 (27 inf, 9 main) | 302 | 8.9 |
| aura-t3 | ninja demo, streak 10, idle | 60.7 | 23.5 | 5.1 | 60.7 | 91 | 12 | 0 / 99 | 0 | 51 (40 inf, 19 main) | 354 | 9 |
| aura-t3 | ninja demo, streak 10, idle | 61 | 23.1 | 5.1 | 60 | 90 | 12 | 0 / 0 | 0 | 51 (40 inf, 19 main) | 354 | 9 |
| settled | before stress | 60.7 | 21.7 | 5 | 59.6 | 89 | 12 | 0 / 0 | 0 | 51 (40 inf, 19 main) | 354 | 9 |
| stress | strike 1/150 | 60.4 | 22.2 | 4.5 | 61.3 | 89 | 12 | 0 / 0 | 0 | 54 (40 inf, 19 main) | 400 | 9 |
| stress | strike 68/150 | 61.5 | 76 | 8.4 | 117.7 | 128 | 26 | 240 / 269 | 28 | 62 (40 inf, 19 main) | 1225 | 10.4 |
| stress | strike 135/150 | 61 | 75.9 | 8.3 | 118.3 | 126 | 26 | 156 / 261 | 25 | 62 (46 inf, 19 main) | 1084 | 9.3 |
| stress | last strike | 61.1 | 67.1 | 7.6 | 109.5 | 122 | 24 | 226 / 238 | 40 | 74 (40 inf, 19 main) | 772 | 10 |
| settled | 10 s after the stress | 60.3 | 22.8 | 5.1 | 60 | 90 | 13 | 0 / 0 | 0 | 51 (40 inf, 19 main) | 785 | 9.1 |
| settled | map after the stress | 60.3 | 7.5 | 0.9 | 59.7 | 82 | 9 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 426 | 9 |

## Levels

| level | kind | secs | finished | max streak | streak at end | stuck |
|---|---|---|---|---|---|---|
| w1-2 | firstsound | 60 | yes | 8 | 8 |  |
| w1-3 | firstsound | 53 | yes | 16 | 16 |  |
| w1-4 | dojo | 63 | yes | 23 | 23 |  |
| w1-5 | dojo | 67 | yes | 33 | 33 |  |
| w1-6 | battle | 30 | yes | 36 | 6 |  |
| w1-7 | soundhunt | 75 | yes | 13 | 13 |  |
| w1-8 | swap | 81 | yes | 25 | 25 |  |
| w1-9 | run | 50 | yes | 31 | 31 |  |
| w1-10 | firstsound | 90 | yes | 44 | 44 |  |
| w1-11 | soundhunt | 87 | yes | 46 | 8 |  |
| w1-12 | swap | 165 | yes | 34 | 34 |  |
| w1-13 | battle | 27 | yes | 45 | 45 |  |

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
  "100ms at http://127.0.0.1:5189/assets/play-C55C6SIe.js:1:971": 1
 },
 "mods": {
  "visemeListeners": 1,
  "bufferCache": 204,
  "captionListeners": 3,
  "clipListeners": 0,
  "sayListeners": 1,
  "music": 1,
  "speaking": 0,
  "storeListeners": 4,
  "attemptSubs": 0,
  "saveBytes": 3125,
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
  "streakN": 45,
  "owned": 0,
  "ownedConnected": 0,
  "busy": 0,
  "spotMounted": 0,
  "moveRunning": 0,
  "spotGen": 28,
  "narrateSubs": 0,
  "navStack": 1,
  "navSubs": 1,
  "nudgeSubs": 0,
  "holds": 0
 }
}
```

