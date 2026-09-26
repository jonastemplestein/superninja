# Soak desktop-fast2

20 levels in one page (no reloads: none), fast=2, desktop 844×390, served prod. Longest streak: 45. Page errors: 0.

**Soak invariant: FAIL**

- mediaAlive: FAIL (> 3 after w1-2, w1-3, w1-4, w1-5…)
- decodedMB: FAIL (> 64 after w1-13, w1-14, w1-15, w2-1…)
- audioHandlers: FAIL (> 17 after w1-3, w1-4, w1-5, w1-6…)
- animMainThreadInfinite while playing: > 2 in 91/101 samples (max 13, e.g. {"@nj-orbit":9})
- animHiddenInfinite while playing: > 2 in 42/101 samples (max 27, e.g. {})

## After each level (on the map, after a forced GC)

| metric | baseline | per level → | last | slope / level | budget |
|---|---|---|---|---|---|
| heapMB | 3.7 | 3.7 6.6 7 7.4 7.5 7.8 8 8.2 8.7 8.9 9 9 9.1 9.3 9.3 9.6 9.6 9.7 9.7 9.7 9.8 | 9.8 | 0.2 | ok (≤ 11.7) |
| nodes | 165 | 165 194 218 232 246 262 278 290 368 384 400 412 426 440 282 296 310 346 360 372 386 | 386 | 8.97 | ok (≤ 765) |
| detachedNodes | 7 | 7 26 40 44 48 52 58 60 128 134 140 142 146 150 153 157 161 187 191 193 197 | 197 | 9.75 |  |
| attachedNodes | 158 | 158 168 178 188 198 210 220 230 240 250 260 270 280 290 129 139 149 159 169 179 189 | 189 | -0.78 |  |
| listeners | 251 | 251 277 277 277 277 277 277 277 279 279 279 279 279 279 240 240 240 240 240 240 240 | 240 | -2.01 | ok (≤ 291) |
| globalListeners | 17 | 17 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 | 30 | 0.17 |  |
| animations | 29 | 29 29 29 29 29 30 30 30 30 30 30 30 30 30 16 16 16 16 16 16 16 | 16 | -0.84 | ok (≤ 34) |
| animInfinite | 9 | 9 9 9 9 9 10 10 10 10 10 10 10 10 10 7 7 7 7 7 7 7 | 7 | -0.14 |  |
| animHiddenInfinite | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| animMainThreadInfinite | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| fxDomNodes | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 0) |
| particles | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| intervals | 1 | 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 | 1 | 0 | ok (≤ 2) |
| pendingTimeouts | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mediaAlive | 1 | 1 4 7 9 11 13 16 17 19 22 25 26 28 30 32 34 36 38 40 41 43 | 43 | 2.08 | FAIL (> 3 after w1-2, w1-3, w1-4, w1-5…) |
| decodedMB | 0.9 | 0.9 15.2 20.1 30.2 32.3 35.2 42.1 46.9 49.6 56.2 59.9 63 64.2 75.1 84.6 90.2 90.9 91.5 94.4 95.1 96 | 96 | 4.69 | FAIL (> 64 after w1-13, w1-14, w1-15, w2-1…) |
| decodedClips | 2 | 2 48 67 92 100 105 129 139 144 168 184 199 203 220 238 258 263 265 280 284 291 | 291 | 13.64 |  |
| audioHandlers | 9 | 9 15 21 25 29 33 39 41 45 51 57 59 63 67 71 75 79 83 87 89 93 | 93 | 4.16 | FAIL (> 17 after w1-3, w1-4, w1-5, w1-6…) |
| arrayBuffers | 4 | 4 50 69 94 102 107 131 141 146 170 186 201 205 222 240 260 265 267 282 286 293 | 293 | 13.64 |  |
| layoutObjects | 116 | 116 132 142 152 162 175 185 195 205 215 225 235 245 255 94 104 114 124 134 144 154 | 154 | -0.65 |  |
| navLog | 0 | 0 9 18 19 20 21 28 29 30 39 46 47 48 55 66 79 80 81 94 95 96 | 96 | 4.81 |  |
| imagesFetched | 54 | 54 74 84 84 84 84 87 89 92 101 104 104 104 111 123 131 131 138 145 145 147 | 147 | 4.14 |  |
| audioFetched | 3 | 3 51 70 95 103 109 133 143 149 173 189 204 208 226 245 265 270 272 287 291 298 | 298 | 13.91 |  |
| imgInDomMB | 22.5 | 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 22.5 15.6 15.6 15.6 15.6 15.6 15.6 15.6 | 15.6 | -0.44 |  |
| rendererRssMB | 402 | 402 873 990 1043 1091 1129 1203 1229 1270 1304 1359 1426 1436 1469 1505 1550 1547 1574 1606 1613 1616 | 1616 | 45.02 |  |
| gpuRssMB | 74 | 74 88 94 104 108 108 108 109 119 120 120 120 120 121 121 121 121 124 126 126 126 | 126 | 1.94 |  |
| footprintMB | 87.9 | 87.9 185 230.2 271.7 319.9 355.4 418.4 443 461.8 493.6 496.2 513.6 522.7 541.4 564 588.3 592.7 582.3 616.6 614.7 618.5 | 618.5 | 23.71 |  |
| gpuFootprintMB | 14.1 | 14.1 14.7 14.7 14.9 14.8 14.9 15 15 15.5 14.9 15 14.9 15 15.5 14.4 14.3 14.6 14.7 15.6 15.5 14.9 | 14.9 | 0.02 |  |
| mem_blink_gc | 5 | 5 20.9 27.3 33.5 37.6 40.3 44.5 51 52.3 58 61.6 69.7 72.9 73.6 78.1 83.1 86.3 86.4 91.4 95.5 96.9 | 96.9 | 4.2 |  |
| mem_blink_objects | 1.6 | 1.6 2.4 2.7 2.9 3.1 3.3 3.6 3.8 4 4.3 4.5 4.8 5.1 5.1 4.8 5.1 5.2 5.2 5.6 5.8 5.8 | 5.8 | 0.19 |  |
| mem_canvas | 3.5 | 3.5 3.6 3.8 3.8 3.8 3.8 3.8 3.8 15.7 15.7 15.7 15.7 15.7 15.7 15.7 15.7 15.7 15.7 15.7 15.7 15.7 | 15.7 | 0.81 |  |
| mem_cc | 169 | 169 475.7 529.6 494.5 502.6 501 436 483.4 456.8 478.5 456.5 458.8 453.4 473.1 486.1 490.3 470.2 472 463.3 467.6 481.6 | 481.6 | 2.94 |  |
| mem_discardable | 172.1 | 172.1 459.3 515.6 512.6 508.3 508.3 512.7 502.9 509.4 509.5 506 493.8 491.5 498 502 507.6 489.1 507.4 507.1 507.4 501 | 501 | 4.4 |  |
| mem_malloc | 47.9 | 47.9 60.9 65.6 63.8 67.5 68.1 72.8 71.8 95.9 104.1 95.6 92.4 94.9 99.5 96.6 98.3 99.4 95.9 106.5 106.6 104.7 | 104.7 | 2.65 |  |
| mem_media | 2.4 | 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 2.4 | 2.4 | 0 |  |
| mem_mojo | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_images | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_strings | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_partition_alloc | 32.1 | 32.1 89.9 137.2 180.3 224.4 255.3 311.3 336.9 336.8 359.9 369.4 388.3 397.7 415 437.7 460 465.2 461.1 487.6 490.4 495 | 495 | 21.25 |  |
| mem_shared_memory | 199.3 | 199.3 497.5 558.2 549.3 548.6 549.1 561.9 543.5 560.3 568.3 563.4 545.1 542.9 551.8 555.1 561 539.6 560.5 571 560.6 555.1 | 555.1 | 5.52 |  |
| mem_site_storage | 0 | 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 | 0 | 0 |  |
| mem_skia | 0.2 | 0.2 4.5 7 7.5 8 7.6 7 10 10.3 12.9 12.5 18.5 17.2 14.7 11.8 11.2 8.8 8.7 14.3 19.4 18.4 | 18.4 | 0.6 |  |
| mem_v8 | 6 | 6 9.1 9.8 10.2 10.3 10.6 10.8 11.3 11.8 12 12.1 12.4 12.4 12.8 12.8 12.8 12.8 12.9 13.1 13.1 13.1 | 13.1 | 0.25 |  |
| mem_web_cache | 1.2 | 1.2 1.2 1.2 1.2 1.2 1.2 1.2 1.2 2.3 1.7 1.6 1.6 1.6 1.5 1.3 1.3 1.3 2.4 1.8 1.8 1.8 | 1.8 | 0.03 |  |

## While playing (periodic samples): first half vs second half

| metric | first half | second half |
|---|---|---|
| fps | 60 | 60 |
| slowFramePct | 0 | 0 |
| mainThreadPct | 11.7 | 11.9 |
| scriptPct | 0.8 | 0.9 |
| stylePct | 1.3 | 1.4 |
| layoutPct | 0.1 | 0.2 |
| recalcPerSec | 145.1 | 116.1 |
| rendererPct | 22.7 | 25.5 |
| gpuPct | 15.2 | 15.6 |
| longTaskMs | 0 | 0 |
| rafPerSec | null | null |
| rafPerFrame | 2.2 | 2.3 |
| animHiddenInfinite | 5.6 | 5.9 |
| animMainThreadInfinite | 8.5 | 8.6 |
| animations | 51 | 52.2 |
| animInfinite | 37.6 | 36.1 |
| particles | 12.4 | 27.1 |
| particlesPeak | 106.6 | 143.6 |

## Phases (idle, the ninja's aura, the strike stress)

| phase | what | fps | main % | style % | recalcs/s | renderer CPU % | GPU CPU % | particles (now / peak) | fx nodes | animations | Nodes | heap MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| idle-map | map | 59.9 | 2.1 | 0.3 | 60 | 5 | 7 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 386 | 9.7 |
| idle-map | map | 60 | 2 | 0.3 | 59.9 | 4 | 7 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 386 | 9.8 |
| idle-map | map | 60 | 2 | 0.3 | 60 | 5 | 7 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 386 | 9.9 |
| idle-map | map | 60 | 2 | 0.3 | 60 | 5 | 7 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 386 | 10.1 |
| idle-map | map | 60 | 2 | 0.3 | 60 | 5 | 7 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 386 | 9.7 |
| idle-map | map | 59.9 | 2 | 0.3 | 59.9 | 5 | 7 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 386 | 9.8 |
| settled | after soak | 59.7 | 2 | 0.3 | 59.7 | 5 | 7 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 386 | 9.8 |
| aura-t0 | ninja demo, streak 0, idle | 60 | 4.2 | 0.9 | 60.1 | 9 | 8 | 0 / 0 | 0 | 28 (27 inf, 9 main) | 354 | 9.7 |
| aura-t0 | ninja demo, streak 0, idle | 60 | 3.8 | 0.8 | 60 | 7 | 7 | 0 / 0 | 0 | 28 (27 inf, 9 main) | 354 | 9.7 |
| aura-t3 | ninja demo, streak 10, idle | 59.9 | 5.6 | 1.1 | 61.1 | 12 | 12 | 0 / 99 | 0 | 51 (40 inf, 9 main) | 406 | 9.8 |
| aura-t3 | ninja demo, streak 10, idle | 60 | 5.2 | 1.1 | 60 | 11 | 12 | 0 / 0 | 0 | 51 (40 inf, 9 main) | 406 | 9.8 |
| settled | before stress | 60.2 | 5.1 | 1 | 60.2 | 11 | 12 | 0 / 0 | 0 | 51 (40 inf, 9 main) | 406 | 9.6 |
| stress | strike 1/150 | null | 59.9 | 5.8 | 300 | 122 | 23 | 26 / 0 | 3 | 57 (42 inf, 9 main) | 457 | 9.8 |
| stress | strike 71/150 | 60.1 | 18.9 | 2 | 123.1 | 51 | 28 | 194 / 269 | 23 | 63 (46 inf, 9 main) | 1182 | 11.3 |
| stress | strike 141/150 | 59.9 | 19.4 | 2 | 123.7 | 53 | 28 | 206 / 274 | 35 | 69 (46 inf, 9 main) | 1193 | 12.2 |
| stress | last strike | 60 | 19.7 | 2 | 124.8 | 53 | 28 | 275 / 252 | 25 | 67 (42 inf, 9 main) | 705 | 11.1 |
| settled | 10 s after the stress | 59.7 | 5.4 | 1.1 | 59.7 | 11 | 12 | 0 / 0 | 0 | 51 (40 inf, 9 main) | 650 | 9.7 |
| settled | map after the stress | 59.8 | 2.4 | 0.4 | 59.8 | 5 | 9 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 500 | 9.8 |

## Levels

| level | kind | secs | finished | max streak | streak at end | stuck |
|---|---|---|---|---|---|---|
| w1-2 | firstsound | 60 | yes | 8 | 8 |  |
| w1-3 | firstsound | 50 | yes | 16 | 16 |  |
| w1-4 | dojo | 63 | yes | 23 | 23 |  |
| w1-5 | dojo | 67 | yes | 33 | 33 |  |
| w1-6 | battle | 27 | yes | 43 | 43 |  |
| w1-7 | soundhunt | 84 | yes | 45 | 7 |  |
| w1-8 | swap | 52 | yes | 19 | 19 |  |
| w1-9 | run | 47 | yes | 25 | 25 |  |
| w1-10 | firstsound | 93 | yes | 33 | 4 |  |
| w1-11 | soundhunt | 76 | yes | 12 | 12 |  |
| w1-12 | swap | 149 | yes | 38 | 38 |  |
| w1-13 | battle | 32 | yes | 38 | 5 |  |
| w1-14 | story | 31 | yes | 7 | 7 |  |
| w1-15 | boss | 64 | yes | 18 | 18 |  |
| w2-1 | dojo | 60 | yes | 34 | 2 |  |
| w2-2 | battle | 28 | yes | 14 | 14 |  |
| w2-3 | run | 48 | yes | 20 | 20 |  |
| w2-4 | dojo | 68 | yes | 27 | 12 |  |
| w2-5 | swap | 37 | yes | 22 | 22 |  |
| w2-6 | battle | 30 | yes | 27 | 6 |  |

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
 "intervals": {
  "100ms at http://127.0.0.1:5186/assets/play-D24d-5kW.js:1:971": 1
 },
 "mods": {
  "visemeListeners": 1,
  "bufferCache": 291,
  "captionListeners": 3,
  "clipListeners": 0,
  "sayListeners": 1,
  "music": 1,
  "speaking": 0,
  "storeListeners": 4,
  "attemptSubs": 0,
  "saveBytes": 5107,
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
  "spotGen": 46,
  "narrateSubs": 0,
  "navStack": 1,
  "navSubs": 1,
  "nudgeSubs": 0,
  "holds": 0
 }
}
```

