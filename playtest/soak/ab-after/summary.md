# Soak ab-after

12 levels in one page (no reloads: none), fast=2, phone emulation (844×390, DPR 3), CPU throttled 4×, served prod, **with the docs/PERF.md fixes patched in (preview)**. Longest streak: 76. Page errors: 0.

**Soak invariant: FAIL**

- decodedMB: FAIL (> 64 after w1-12, w1-13)
- fps: median under 50 on level:w1-9 (35.9)
- animMainThreadInfinite while playing: > 2 in 46/63 samples (max 11, e.g. {"@wave":3})
- animHiddenInfinite while playing: > 2 in 2/63 samples (max 3, e.g. {"@bt-orbit":3})

## After each level (on the map, after a forced GC)

| metric | baseline | per level → | last | slope / level | budget |
|---|---|---|---|---|---|
| heapMB | 3.7 | 3.7 6.6 7 7.4 7.5 7.8 7.9 8.1 8.6 8.8 8.9 9 9.1 | 9.1 | 0.32 | ok (≤ 11.7) |
| nodes | 167 | 167 190 208 218 228 240 250 260 334 344 354 364 374 | 374 | 18.16 | ok (≤ 767) |
| detachedNodes | 9 | 9 22 30 30 30 30 30 30 94 94 94 94 94 | 94 | 7.95 |  |
| attachedNodes | 158 | 158 168 178 188 198 210 220 230 240 250 260 270 280 | 280 | 10.22 |  |
| listeners | 251 | 251 277 277 277 277 277 277 277 279 279 279 279 279 | 279 | 1.08 | ok (≤ 291) |
| globalListeners | 17 | 17 30 30 30 30 30 30 30 30 30 30 30 30 | 30 | 0.43 |  |
| animations | 29 | 29 29 29 29 29 30 30 30 30 30 30 30 30 | 30 | 0.11 | ok (≤ 34) |
| animInfinite | 9 | 9 9 9 9 9 10 10 10 10 10 10 10 10 | 10 | 0.11 |  |
| animHiddenInfinite | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| animMainThreadInfinite | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| fxDomNodes | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 0) |
| particles | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| rafPerSec | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| intervals | 1 | 1 1 1 1 1 1 1 1 1 1 1 1 1 | 1 | 0 | ok (≤ 2) |
| pendingTimeouts | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mediaAlive | 2 | 2 2 2 2 2 2 2 2 2 2 2 2 2 | 2 | 0 | ok (≤ 4) |
| decodedMB | 0.9 | 0.9 15.4 20.3 30.6 32.7 35.7 42 46.7 49.3 58.4 63.7 69 71 | 71 | 5.44 | FAIL (> 64 after w1-12, w1-13) |
| decodedClips | 2 | 2 48 67 93 101 106 128 138 143 175 197 217 224 | 224 | 16.81 |  |
| audioHandlers | 11 | 11 11 11 11 11 11 11 11 11 11 11 11 11 | 11 | 0 | ok (≤ 19) |
| arrayBuffers | 4 | 4 50 69 95 103 108 123 117 115 126 133 138 140 | 140 | 9 |  |
| layoutObjects | 116 | 116 132 142 152 162 175 185 195 205 215 225 235 245 | 245 | 10.53 |  |
| navLog | 0 | 0 9 18 19 20 21 28 29 30 39 46 47 48 | 48 | 3.73 |  |
| imagesFetched | 54 | 54 74 85 85 85 85 88 90 93 102 107 107 107 | 107 | 3.53 |  |
| audioFetched | 3 | 3 51 70 96 104 110 132 142 148 173 194 207 211 | 211 | 15.8 |  |
| imgInDomMB | 22.5 | 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 | 22.5 | 0 |  |
| rendererRssMB | 417 | 417 995 1105 1145 1191 1227 1296 1332 1360 1394 1404 1431 1451 | 1451 | 59.18 |  |
| gpuRssMB | 74 | 74 91 93 103 103 104 104 104 115 115 115 115 116 | 116 | 2.86 |  |
| footprintMB | 90.1 | 90.1 191.3 236.9 273.2 316.1 348.8 406.1 432.4 459.2 472.5 487.3 511.6 502.9 | 502.9 | 33.23 |  |
| gpuFootprintMB | 13.7 | 13.7 13.8 14 14.7 14.6 14.8 14.6 14.6 15 14.2 14.5 14.8 15.1 | 15.1 | 0.08 |  |
| mem_blink_gc | 4.8 | 4.8 18.5 25.5 31.4 34.8 36.9 40.1 46.5 47.1 52.8 55.5 68.3 67.5 | 67.5 | 4.64 |  |
| mem_blink_objects | 1.6 | 1.6 2.4 2.7 2.9 3.1 3.2 3.4 3.7 3.8 4.1 4.2 5 4.8 | 4.8 | 0.24 |  |
| mem_canvas | 3.5 | 3.5 3.6 3.8 3.8 3.8 3.8 3.8 3.8 15.7 15.7 15.7 15.7 15.7 | 15.7 | 1.32 |  |
| mem_cc | 185.1 | 185.1 482.3 529.8 510.1 499.2 507.3 496 461.9 441.9 496.2 493.3 470.5 471.3 | 471.3 | 7.2 |  |
| mem_discardable | 184.2 | 184.2 465.4 517.3 506.3 505.9 506.2 511.4 511.4 505.3 513.8 502.8 488.5 495.5 | 495.5 | 10.72 |  |
| mem_malloc | 51.7 | 51.7 68.9 70.8 69.6 71.7 74.8 79.6 77.6 101.7 102 105.2 110.5 103.7 | 103.7 | 4.49 |  |
| mem_media | 2.4 | 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 | 2.4 | 0 |  |
| mem_mojo | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_images | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_strings | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_partition_alloc | 33.3 | 33.3 88.4 135.1 175.2 214.9 245.3 293.2 320.1 322.3 339.3 348.2 361.7 365.2 | 365.2 | 27.43 |  |
| mem_shared_memory | 212 | 212 507.5 557.9 542.8 542.5 542.4 552 548.1 551.7 569.4 554.5 536.3 533 | 533 | 11.87 |  |
| mem_site_storage | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_skia | 0.3 | 0.3 4.6 5.7 6.1 5.7 6.3 6.9 11.6 10.8 12.6 12 17.7 14.9 | 14.9 | 1.17 |  |
| mem_v8 | 5.9 | 5.9 9.1 9.8 10.1 10.3 10.6 10.8 11.3 11.5 11.9 12 12.3 12.2 | 12.2 | 0.39 |  |
| mem_web_cache | 1.2 | 1.2 1.2 1.2 1.2 1.2 1.2 1.2 1.2 2.3 1.7 1.6 1.6 1.6 | 1.6 | 0.05 |  |

## While playing (periodic samples): first half vs second half

| metric | first half | second half |
|---|---|---|
| fps | 60.7 | 57.5 |
| slowFramePct | 0.1 | 8.3 |
| mainThreadPct | 24.4 | 34.4 |
| scriptPct | 2.1 | 2.5 |
| stylePct | 5.1 | 4.4 |
| layoutPct | 0.4 | 0.4 |
| recalcPerSec | 116.5 | 92.7 |
| rendererPct | 93.7 | 95.4 |
| gpuPct | 15.1 | 12.3 |
| longTaskMs | 5.5 | 38.2 |
| rafPerSec | 77.7 | 76 |
| rafPerFrame | 1.2 | 1.4 |
| animHiddenInfinite | 0.2 | 0.2 |
| animMainThreadInfinite | 2.7 | 2.7 |
| animations | 57.2 | 48.9 |
| animInfinite | 41.8 | 33.9 |
| particles | 9.1 | 12.5 |
| particlesPeak | 101.3 | 115.9 |

## Phases (idle, the ninja's aura, the strike stress)

| phase | what | fps | main % | style % | recalcs/s | renderer CPU % | GPU CPU % | particles (now / peak) | fx nodes | animations | Nodes | heap MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| idle-map | map | 60.9 | 12.2 | 0.7 | 34.1 | 85 | 10 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 374 | 9 |
| idle-map | map | 60.2 | 3.3 | 0.9 | 37.5 | 83 | 12 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 374 | 9.2 |
| idle-map | map | 60.2 | 3.5 | 0.9 | 37.3 | 83 | 11 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 374 | 9.3 |
| idle-map | map | 60.4 | 3.7 | 1.1 | 37.6 | 83 | 12 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 374 | 9.4 |
| idle-map | map | 61 | 3.7 | 1 | 37.9 | 83 | 12 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 374 | 9 |
| idle-map | map | 61 | 3 | 0.8 | 37.6 | 82 | 10 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 374 | 9.1 |
| settled | after soak | 60.8 | 3 | 0.9 | 35.7 | 82 | 11 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 374 | 9.1 |
| aura-t0 | ninja demo, streak 0, idle | 60.3 | 5 | 1.5 | 37.4 | 83 | 9 | 0 / 0 | 0 | 28 (27 inf, 0 main) | 418 | 9.1 |
| aura-t0 | ninja demo, streak 0, idle | 60.8 | 2.2 | 0.5 | 31.1 | 81 | 8 | 0 / 0 | 0 | 28 (27 inf, 0 main) | 418 | 9.2 |
| aura-t3 | ninja demo, streak 10, idle | 60.1 | 11.9 | 4 | 61.3 | 85 | 10 | 0 / 99 | 0 | 51 (40 inf, 0 main) | 312 | 9 |
| aura-t3 | ninja demo, streak 10, idle | 60.3 | 12.6 | 4.8 | 60.4 | 84 | 11 | 0 / 0 | 0 | 54 (40 inf, 0 main) | 312 | 9 |
| settled | before stress | 60.6 | 12.6 | 4.9 | 59.7 | 85 | 11 | 0 / 0 | 0 | 51 (40 inf, 0 main) | 312 | 9.2 |
| stress | strike 1/150 | 60.8 | 16.5 | 5.3 | 61.3 | 87 | 11 | 0 / 0 | 0 | 54 (40 inf, 0 main) | 358 | 9.1 |
| stress | strike 67/150 | 60.9 | 80 | 9.3 | 116.5 | 128 | 26 | 187 / 264 | 35 | 71 (46 inf, 0 main) | 958 | 9.6 |
| stress | strike 134/150 | 61.3 | 77.6 | 8.6 | 115.5 | 128 | 26 | 238 / 261 | 31 | 68 (46 inf, 0 main) | 1040 | 11.1 |
| stress | last strike | 61.1 | 65.8 | 7.6 | 106.8 | 120 | 22 | 228 / 253 | 40 | 73 (40 inf, 0 main) | 862 | 11 |
| settled | 10 s after the stress | 60.2 | 13.4 | 5 | 60.1 | 85 | 11 | 0 / 0 | 0 | 51 (40 inf, 0 main) | 752 | 9.3 |
| settled | map after the stress | 60.8 | 2.2 | 0.5 | 31.3 | 81 | 10 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 374 | 9.1 |

## Levels

| level | kind | secs | finished | max streak | streak at end | stuck |
|---|---|---|---|---|---|---|
| w1-2 | firstsound | 60 | yes | 8 | 8 |  |
| w1-3 | firstsound | 53 | yes | 16 | 16 |  |
| w1-4 | dojo | 63 | yes | 23 | 23 |  |
| w1-5 | dojo | 68 | yes | 33 | 33 |  |
| w1-6 | battle | 27 | yes | 43 | 43 |  |
| w1-7 | soundhunt | 75 | yes | 50 | 50 |  |
| w1-8 | swap | 51 | yes | 62 | 62 |  |
| w1-9 | run | 52 | yes | 68 | 68 |  |
| w1-10 | firstsound | 95 | yes | 76 | 4 |  |
| w1-11 | soundhunt | 86 | yes | 9 | 4 |  |
| w1-12 | swap | 164 | yes | 30 | 30 |  |
| w1-13 | battle | 23 | yes | 41 | 41 |  |

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
  "100ms at http://127.0.0.1:5193/assets/play-9zkXfibF.js:1:971": 1
 },
 "mods": {
  "visemeListeners": 1,
  "bufferCache": 138,
  "captionListeners": 3,
  "clipListeners": 0,
  "sayListeners": 1,
  "music": 1,
  "speaking": 0,
  "storeListeners": 4,
  "attemptSubs": 0,
  "saveBytes": 3077,
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
  "streakN": 41,
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

