# Soak phone-cpu4-fast1

15 levels in one page (no reloads: none), fast=2, phone emulation (844×390, DPR 3), CPU throttled 4×, served prod. Longest streak: 113. Page errors: 0.

**Soak invariant: FAIL**

- mediaAlive: FAIL (> 3 after w1-2, w1-3, w1-4, w1-5…)
- decodedMB: FAIL (> 64 after w1-13, w1-14, w1-15, w2-1)
- audioHandlers: FAIL (> 17 after w1-3, w1-4, w1-5, w1-6…)
- fps: median under 50 on level:w1-9 (29.8), reward:w1-9 (30.9)
- idle: the still map keeps the main thread 10.6% busy (> 5%, CPU ×4)
- animMainThreadInfinite while playing: > 2 in 154/160 samples (max 13, e.g. {"@nj-orbit":9})
- animHiddenInfinite while playing: > 2 in 37/160 samples (max 27, e.g. {})

## After each level (on the map, after a forced GC)

| metric | baseline | per level → | last | slope / level | budget |
|---|---|---|---|---|---|
| heapMB | 3.8 | 3.8 6.7 7 7.4 7.5 7.8 8 8.2 8.7 8.8 8.9 9 9.1 9.2 9.2 9.5 | 9.5 | 0.26 | ok (≤ 11.8) |
| nodes | 169 | 169 198 222 236 250 266 282 294 370 386 402 414 428 442 280 294 | 294 | 13.68 | ok (≤ 769) |
| detachedNodes | 11 | 11 30 44 48 52 56 62 64 130 136 142 144 148 152 151 155 | 155 | 10.56 |  |
| attachedNodes | 158 | 158 168 178 188 198 210 220 230 240 250 260 270 280 290 129 139 | 139 | 3.12 |  |
| listeners | 252 | 252 278 278 278 278 278 278 278 280 280 280 280 280 280 240 240 | 240 | -0.89 | ok (≤ 292) |
| globalListeners | 17 | 17 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 | 30 | 0.29 |  |
| animations | 29 | 29 29 29 29 29 30 30 30 30 30 30 30 30 30 16 16 | 16 | -0.5 | ok (≤ 34) |
| animInfinite | 9 | 9 9 9 9 9 10 10 10 10 10 10 10 10 10 7 7 | 7 | -0.04 |  |
| animHiddenInfinite | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| animMainThreadInfinite | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| fxDomNodes | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 0) |
| particles | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| intervals | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 1) |
| pendingTimeouts | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mediaAlive | 1 | 1 4 7 9 11 13 16 17 19 22 25 26 28 30 32 34 | 34 | 2.16 | FAIL (> 3 after w1-2, w1-3, w1-4, w1-5…) |
| decodedMB | 0.9 | 0.9 14.7 20.1 30.2 32.5 36.1 42.4 48.2 50.8 57.2 61.2 63 64.1 75 84 89.9 | 89.9 | 5.19 | FAIL (> 64 after w1-13, w1-14, w1-15, w2-1) |
| decodedClips | 2 | 2 46 67 92 101 108 130 141 146 170 187 200 207 224 240 262 | 262 | 15.29 |  |
| audioHandlers | 9 | 9 15 21 25 29 33 39 41 45 51 57 59 63 67 71 75 | 75 | 4.32 | FAIL (> 17 after w1-3, w1-4, w1-5, w1-6…) |
| arrayBuffers | 4 | 4 48 69 94 103 110 132 143 148 172 189 202 209 226 242 264 | 264 | 15.29 |  |
| layoutObjects | 120 | 120 136 146 156 166 179 189 199 209 219 229 239 249 259 94 104 | 104 | 3.17 |  |
| navLog | 0 | 0 9 18 19 20 21 28 29 30 39 46 47 48 55 66 79 | 79 | 4.33 |  |
| imagesFetched | 54 | 54 72 85 85 85 85 88 90 93 103 106 106 106 113 125 133 | 133 | 3.93 |  |
| audioFetched | 3 | 3 49 70 95 104 112 134 145 151 175 192 205 212 230 247 269 | 269 | 15.61 |  |
| imgInDomMB | 22.5 | 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 15.6 15.6 | 15.6 | -0.28 |  |
| rendererRssMB | 424 | 424 978 1057 1100 1125 1162 1234 1276 1314 1379 1348 1445 1450 1469 1531 1591 | 1591 | 52.97 |  |
| gpuRssMB | 78 | 78 96 97 107 108 108 113 108 122 123 123 123 123 122 128 124 | 124 | 2.57 |  |
| footprintMB | 90.8 | 90.8 200.6 258 302.3 362 410.2 454.8 463.2 487.5 522.8 528.1 555 554.9 558.6 602 635.6 | 635.6 | 31.09 |  |
| gpuFootprintMB | 14.4 | 14.4 14.8 14.9 15.1 15 15.4 15.6 15.5 15.7 15.3 15.2 15.7 15.1 15.6 14.9 14.6 | 14.6 | 0.02 |  |
| mem_blink_gc | 5.4 | 5.4 24.5 32.2 39.9 46.2 49.7 55.7 64.1 65.5 76.2 80.9 93.6 95 97.4 104.4 114.4 | 114.4 | 6.53 |  |
| mem_blink_objects | 1.7 | 1.7 2.6 2.9 3.2 3.5 3.7 3.9 4.2 4.6 5 5.2 5.7 5.7 5.8 5.5 6.2 | 6.2 | 0.27 |  |
| mem_canvas | 3.5 | 3.5 3.6 3.8 3.8 3.8 3.8 3.8 3.8 15.2 15.2 15.2 15.2 15.2 15.2 15.2 15.2 | 15.2 | 1.08 |  |
| mem_cc | 185 | 185 522.6 498.7 355.3 380.2 387.2 333.4 413 413.6 421.4 377.4 420.3 436.1 416.1 447.5 473 | 473 | 5.38 |  |
| mem_discardable | 185.8 | 185.8 512.9 513.7 500.3 461.6 449.6 449.7 472.4 472.7 485.4 445.7 493.7 489.3 487.1 492.8 497.8 | 497.8 | 6.38 |  |
| mem_malloc | 51.8 | 51.8 67.6 72.4 64.7 65.9 77.3 85.3 75.8 101 111.3 112.4 112.5 109.9 109.1 108.4 118.8 | 118.8 | 4.34 |  |
| mem_media | 2.4 | 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 | 2.4 | 0 |  |
| mem_mojo | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_images | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_strings | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_partition_alloc | 31.2 | 31.2 98.7 150.3 207 261.6 297.5 330 342.8 346.8 370.2 377.1 399.4 405.2 417.7 451.2 474.2 | 474.2 | 25.65 |  |
| mem_shared_memory | 217 | 217 558.3 561.2 540.2 501.6 489.9 493.8 512.4 526 543.5 503.8 548.3 543 540.4 547.5 556 | 556 | 7.79 |  |
| mem_site_storage | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_skia | 0.3 | 0.3 8.4 14.5 14.6 8.2 4.2 6.5 18.6 16.7 12.9 13.1 28.9 28.6 24.3 7.3 19.2 | 19.2 | 1.04 |  |
| mem_v8 | 6 | 6 9.3 9.6 10.1 10.3 10.7 11 11.2 11.7 11.9 12 12.2 12.2 12.4 12.3 12.7 | 12.7 | 0.31 |  |
| mem_web_cache | 1.2 | 1.2 1.2 1.2 1.2 1.2 1.2 1.2 1.2 2.3 1.8 1.8 1.8 1.8 1.6 1.3 1.3 | 1.3 | 0.03 |  |

## While playing (periodic samples): first half vs second half

| metric | first half | second half |
|---|---|---|
| fps | 57.4 | 59.7 |
| slowFramePct | 7.8 | 0.5 |
| mainThreadPct | 38.6 | 35.3 |
| scriptPct | 2.2 | 2.3 |
| stylePct | 6.2 | 6.9 |
| layoutPct | 0.5 | 0.6 |
| recalcPerSec | 171.2 | 202.1 |
| rendererPct | 97.7 | 98.5 |
| gpuPct | 15 | 18 |
| longTaskMs | 37.2 | 8.3 |
| rafPerSec | null | null |
| rafPerFrame | 2.2 | 2.2 |
| animHiddenInfinite | 5.1 | 0.8 |
| animMainThreadInfinite | 8.5 | 9.5 |
| animations | 51.9 | 62.5 |
| animInfinite | 38 | 44.1 |
| particles | 12.8 | 25.8 |
| particlesPeak | 92 | 125 |

## Phases (idle, the ninja's aura, the strike stress)

| phase | what | fps | main % | style % | recalcs/s | renderer CPU % | GPU CPU % | particles (now / peak) | fx nodes | animations | Nodes | heap MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| idle-map | map | 60 | 10.2 | 1.1 | 60 | 85 | 10 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 294 | 9.4 |
| idle-map | map | 60 | 11.5 | 1.4 | 60 | 86 | 12 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 294 | 9.5 |
| idle-map | map | 60 | 12.5 | 1.7 | 60 | 87 | 12 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 294 | 9.6 |
| idle-map | map | 59.9 | 12.1 | 1.6 | 60 | 87 | 12 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 294 | 9.7 |
| idle-map | map | 60 | 10.6 | 1.5 | 59.9 | 85 | 10 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 294 | 9.4 |
| idle-map | map | 60 | 10 | 1.4 | 60 | 85 | 10 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 294 | 9.5 |
| settled | after soak | 60 | 11.7 | 1.4 | 60 | 87 | 12 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 294 | 9.5 |
| aura-t0 | ninja demo, streak 0, idle | 59.8 | 22.7 | 5.8 | 59.7 | 91 | 12 | 0 / 0 | 0 | 28 (27 inf, 9 main) | 312 | 9.5 |
| aura-t0 | ninja demo, streak 0, idle | 60 | 16.2 | 4.5 | 60 | 86 | 9 | 0 / 0 | 0 | 28 (27 inf, 9 main) | 312 | 9.5 |
| aura-t3 | ninja demo, streak 10, idle | 60 | 23 | 5.2 | 60.7 | 91 | 13 | 0 / 99 | 0 | 51 (40 inf, 9 main) | 364 | 9.5 |
| aura-t3 | ninja demo, streak 10, idle | 60 | 20.8 | 4.9 | 59.9 | 89 | 12 | 0 / 0 | 0 | 51 (40 inf, 9 main) | 364 | 9.5 |
| settled | before stress | 60.3 | 20.2 | 5 | 59.8 | 89 | 12 | 0 / 0 | 0 | 51 (40 inf, 9 main) | 364 | 9.5 |
| stress | strike 1/150 | 37 | 96.1 | 13 | 111.1 | 143 | 15 | 26 / 0 | 3 | 57 (42 inf, 9 main) | 415 | 9.6 |
| stress | strike 63/150 | 47.4 | 95.9 | 8.5 | 87.4 | 131 | 36 | 354 / 453 | 99 | 71 (40 inf, 9 main) | 1081 | 11.3 |
| stress | strike 126/150 | 50.3 | 98.9 | 7.7 | 94.1 | 130 | 35 | 335 / 461 | 70 | 69 (40 inf, 9 main) | 1410 | 12.4 |
| stress | last strike | 49.3 | 99.4 | 7.8 | 89.3 | 129 | 35 | 383 / 460 | 105 | 79 (46 inf, 9 main) | 1000 | 11.9 |
| settled | 10 s after the stress | 60 | 22.4 | 5.3 | 60 | 90 | 12 | 0 / 0 | 0 | 51 (40 inf, 9 main) | 931 | 9.6 |
| settled | map after the stress | 60.2 | 8.6 | 1.3 | 59.7 | 83 | 10 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 458 | 9.6 |

## Levels

| level | kind | secs | finished | max streak | streak at end | stuck |
|---|---|---|---|---|---|---|
| w1-2 | firstsound | 115 | yes | 8 | 8 |  |
| w1-3 | firstsound | 100 | yes | 16 | 16 |  |
| w1-4 | dojo | 123 | yes | 23 | 23 |  |
| w1-5 | dojo | 130 | yes | 33 | 33 |  |
| w1-6 | battle | 57 | yes | 36 | 5 |  |
| w1-7 | soundhunt | 147 | yes | 12 | 12 |  |
| w1-8 | swap | 103 | yes | 24 | 24 |  |
| w1-9 | run | 78 | yes | 30 | 30 |  |
| w1-10 | firstsound | 172 | yes | 43 | 43 |  |
| w1-11 | soundhunt | 144 | yes | 51 | 51 |  |
| w1-12 | swap | 216 | yes | 77 | 77 |  |
| w1-13 | battle | 50 | yes | 89 | 89 |  |
| w1-14 | story | 59 | yes | 91 | 91 |  |
| w1-15 | boss | 110 | yes | 112 | 112 |  |
| w2-1 | dojo | 124 | yes | 113 | 18 |  |

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
  "mainThread": {}
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
 "intervals": {},
 "mods": {
  "visemeListeners": 1,
  "bufferCache": 262,
  "captionListeners": 3,
  "clipListeners": 0,
  "sayListeners": 1,
  "music": 1,
  "speaking": 0,
  "storeListeners": 4,
  "attemptSubs": 0,
  "saveBytes": 3732,
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
  "streakN": 18,
  "owned": 0,
  "ownedConnected": 0,
  "busy": 0,
  "spotMounted": 0,
  "moveRunning": 0,
  "spotGen": 36,
  "narrateSubs": 0,
  "navStack": 1,
  "navSubs": 1,
  "nudgeSubs": 0,
  "holds": 0
 }
}
```

