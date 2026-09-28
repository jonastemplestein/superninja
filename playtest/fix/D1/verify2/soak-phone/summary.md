# Soak soak-phone

2 levels in one page (reloads: none), fast=2, phone emulation (844×390, DPR 3), CPU throttled 4×, served none from http://127.0.0.1:4841. Longest streak: 23. Page errors: 0.

## Budgets: **FAIL** (1: flowerMain)

docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §11.1 and docs/PERF.md §5. "n/a": not judged on this run. Owners are the fix plan's lanes; an offending animation names the file that defines it.

| result | when | check | budget | measured | owner |
|---|---|---|---|---|---|
| pass | after each level, back on the map (GC'd) | DOM nodes (CDP, attached + detached) | ≤ start + 600 (846) | start 246, worst 291 (after w6-2) | all |
| pass | after each level, back on the map (GC'd) | JS heap, MB | ≤ start + 8 (17.5) | cold map 6.6, start 9.5 (after w6-1, the warm-up), worst 10.1 (after w6-2) | all |
| pass | after each level, back on the map (GC'd) | event listeners | ≤ start + 40 (292) | start 252, worst 252 (after start) | all |
| pass | after each level, back on the map (GC'd) | animations on the map | ≤ start + 5 (34) | start 29, worst 29 (after start) | all |
| pass | after each level, back on the map (GC'd) | live intervals | ≤ start + 1 (2) | start 1, worst 1 (after start) | all |
| pass | after each level, back on the map (GC'd) | particles on the canvas | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | nodes in the fx layer | ≤ 0 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | rAF requests/s on the still map | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | live decoded audio, MB | ≤ 64 | start 1, worst 38.2 (after w6-2) | F1, B1 |
| pass | after each level, back on the map (GC'd) | Web Audio nodes (AudioHandlers) | ≤ start + 8 (19) | start 11, worst 11 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | &lt;audio> elements alive | ≤ start + 2 (4) | start 2, worst 2 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | window.__snNavLog entries | ≤ 500 | start 0, worst 41 (after w6-2) | F3 |
| pass | after each level, back on the map (GC'd) | the save's adjustLog entries | ≤ 200 | start 0, worst 0 (after start) | F1 |
| pass | on the title, untouched for 5 s | live decoded audio, MB | ≤ 2 | 0.7 MB in 2 clips | B1 |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations the compositor can't run | ≤ 2 | max 0; over in 0 of 24 samples | F1, B, C, D (by file) |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations running on hidden elements | ≤ 2 | max 0; over in 0 of 24 samples | F1, D2 (by file) |
| pass | the still map, 60 s untouched | rAF requests/s, median | ≤ 5 | 0 (max 0); main thread 1.3 % | F1, B1 |
| pass | a held Next (a reward), 40 s untouched, the idle nudge included | rAF requests/s, median | ≤ 5 | 4.8 (max 13.9); main thread 5.6 % | F1, F3 (nav.tsx), B1 |
| pass | phone ×4, while playing | every screen's median fps | ≥ 50 | lowest level:w6-1 (60.3) | D5 (the runner); otherwise the screen's owner |
| pass | phone ×4, the still map | main thread %, median | ≤ 5 % | 1.3 % | F1 |
| pass | phone ×4, a held Next (a reward), the idle nudge included | main thread %, median | ≤ 6 % | 5.6 % (7.1, 6.9, 4.2, 4.1) | F1 (the ninja), F3 (the nudge), B1 (the reward) |
| pass | phone ×4, the ninja standing still | main thread % at streak 0, mean | ≤ 6 % | 3.7 % (5.8, 1.5) | F1 |
| pass | phone ×4, the ninja standing still | main thread % at streak 10, mean | ≤ 14 % | 8.3 % (10.4, 6.2) | F1 |
| **FAIL** | phone ×4, the World Flower | main thread %, median | ≤ 30 % | 35.2 % over 1 sample (35.2) | B2 |
| pass | phone ×4, the World Flower | longest task, ms | ≤ 120 ms | 64 ms | B2 |
| pass | the strike stress (150 streak-10 strikes, 7 a second) | particles at the peak | ≤ 350 | 246 (fx nodes 89) | F1 |
| pass | 10 s after the stress | particles / fx nodes left | 0 / 0 | 0 / 0 | F1 |
| pass | the whole soak | page reloads | 0 | 0 | all |
| pass | the whole soak | levels the bot finished | all | 2 of 2 | the scene's owner (or bot.ts) |

## After each level (on the map, after a forced GC)

| metric | start | per level → | last | slope / level | budget |
|---|---|---|---|---|---|
| heapMB | 6.6 | 6.6 9.5 10.1 | 10.1 | 1.75 | ok (≤ start + 8 (17.5)) |
| nodes | 246 | 246 281 291 | 291 | 22.5 | ok (≤ start + 600 (846)) |
| detachedNodes | 76 | 76 118 118 | 118 | 21 |  |
| attachedNodes | 170 | 170 163 173 | 173 | 1.5 |  |
| listeners | 252 | 252 230 230 | 230 | -11 | ok (≤ start + 40 (292)) |
| globalListeners | 20 | 20 19 19 | 19 | -0.5 |  |
| animations | 29 | 29 21 21 | 21 | -4 | ok (≤ start + 5 (34)) |
| animInfinite | 9 | 9 6 6 | 6 | -1.5 |  |
| animHiddenInfinite | 0 | 0 0 0 | 0 | 0 |  |
| animMainThreadInfinite | 0 | 0 0 0 | 0 | 0 |  |
| fxDomNodes | 0 | 0 0 0 | 0 | 0 | ok (≤ 0) |
| particles | 0 | 0 0 0 | 0 | 0 | ok (≤ 5) |
| rafPerSec | 0 | 0 0 0 | 0 | 0 | ok (≤ 5) |
| intervals | 1 | 1 1 1 | 1 | 0 | ok (≤ start + 1 (2)) |
| pendingTimeouts | 1 | 1 0 0 | 0 | -0.5 |  |
| mediaAlive | 2 | 2 2 2 | 2 | 0 | ok (≤ start + 2 (4)) |
| decodedMB | 1 | 1 30.7 38.2 | 38.2 | 18.6 | ok (≤ 64) |
| decodedTotalMB | 1 | 1 30.7 38.2 | 38.2 | 18.6 |  |
| decodedClips | 2 | 2 71 89 | 89 | 43.5 |  |
| audioHandlers | 11 | 11 11 11 | 11 | 0 | ok (≤ start + 8 (19)) |
| arrayBuffers | 10 | 10 79 97 | 97 | 43.5 |  |
| layoutObjects | 178 | 178 194 204 | 204 | 13 |  |
| navLog | 0 | 0 35 41 | 41 | 20.5 | ok (≤ 500) |
| adjustLog | 0 | 0 0 0 | 0 | 0 | ok (≤ 200) |
| imagesFetched | 58 | 58 80 81 | 81 | 11.5 |  |
| audioFetched | 3 | 3 75 93 | 93 | 45 |  |
| imgInDomMB | 18 | 18 13 13 | 13 | -2.5 |  |
| rendererRssMB | 443 | 443 896 948 | 948 | 252.5 |  |
| gpuRssMB | 85 | 85 93 95 | 95 | 5 |  |
| footprintMB | 86.1 | 86.1 189.2 223.6 | 223.6 | 68.75 |  |
| gpuFootprintMB | 16 | 16 14.7 14.6 | 14.6 | -0.7 |  |
| mem_blink_gc | 6 | 6 23.5 31 | 31 | 12.5 |  |
| mem_blink_objects | 2.1 | 2.1 3.4 3.6 | 3.6 | 0.75 |  |
| mem_canvas | 3.5 | 3.5 3.8 3.8 | 3.8 | 0.15 |  |
| mem_cc | 177.4 | 177.4 513.8 500.2 | 500.2 | 161.4 |  |
| mem_discardable | 205.6 | 205.6 513.6 501.4 | 501.4 | 147.9 |  |
| mem_malloc | 53.3 | 53.3 60.8 61.3 | 61.3 | 4 |  |
| mem_media | 2.4 | 2.4 2.2 2.2 | 2.2 | -0.1 |  |
| mem_mojo | 0 | 0 0 0 | 0 | 0 |  |
| mem_parkable_images | 0 | 0 0 0 | 0 | 0 |  |
| mem_parkable_strings | 0 | 0 0 0 | 0 | 0 |  |
| mem_partition_alloc | 18.4 | 18.4 97.6 130 | 130 | 55.8 |  |
| mem_shared_memory | 231.2 | 231.2 538.9 527.9 | 527.9 | 148.35 |  |
| mem_site_storage | 0 | 0 0 0 | 0 | 0 |  |
| mem_skia | 0.4 | 0.4 1.2 3 | 3 | 1.3 |  |
| mem_v8 | 8.6 | 8.6 12 12.7 | 12.7 | 2.05 |  |
| mem_web_cache | 1.7 | 1.7 1.5 1.5 | 1.5 | -0.1 |  |

## While playing (periodic samples): first half vs second half

| metric | first half | second half |
|---|---|---|
| fps | 60.3 | 60.4 |
| slowFramePct | 0 | 0.2 |
| mainThreadPct | 19.2 | 43.3 |
| scriptPct | 2.3 | 4 |
| stylePct | 2.7 | 7.8 |
| layoutPct | 0.3 | 0.6 |
| recalcPerSec | 61.3 | 88.3 |
| layoutPerSec | 7.6 | 14 |
| rendererPct | 89 | 101 |
| gpuPct | 14 | 21.9 |
| longTaskMs | 9 | 29.4 |
| rafPerSec | 79.3 | 109.5 |
| rafPerFrame | 0.9 | 1.6 |
| animHiddenInfinite | 0 | 0 |
| animMainThreadInfinite | 0 | 0 |
| animations | 25.8 | 76.1 |
| animInfinite | 16.2 | 55.3 |
| particles | 0 | 19.1 |
| particlesPeak | 85.3 | 164.1 |

## Phases (the title, the still map, a held Next, the ninja's aura, the strike stress)

| phase | what | fps | main % | style % | recalcs/s | rAF/s | renderer CPU % | GPU CPU % | particles (now / peak) | fx nodes | animations | decoded MB | Nodes | heap MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| title | the title, 5 s, untouched | 61 | 2.2 | 0.7 | 20.8 | 0 | 85 | 21 | 0 / 0 | 0 | 29 (22 inf, 0 main) | 0.7 | 180 | 5.3 |
| idle-map | map | 60.3 | 1.9 | 0.3 | 23.4 | 0 | 79 | 11 | 0 / 0 | 0 | 21 (6 inf, 0 main) | 38.2 | 291 | 10 |
| idle-map | map | 60.8 | 1.4 | 0.3 | 22.3 | 0 | 79 | 10 | 0 / 0 | 0 | 21 (6 inf, 0 main) | 38.2 | 291 | 10.1 |
| idle-map | map | 60.4 | 1.2 | 0.3 | 21.2 | 0 | 81 | 11 | 0 / 0 | 0 | 21 (6 inf, 0 main) | 38.2 | 291 | 10.2 |
| idle-map | map | 60.2 | 1.3 | 0.3 | 20.3 | 0 | 81 | 10 | 0 / 0 | 0 | 21 (6 inf, 0 main) | 38.2 | 291 | 10.4 |
| idle-map | map | 60.5 | 1.3 | 0.3 | 20.7 | 0 | 80 | 10 | 0 / 0 | 0 | 21 (6 inf, 0 main) | 38.2 | 291 | 10.5 |
| idle-map | map | 60.2 | 1.3 | 0.3 | 22.6 | 0 | 78 | 11 | 0 / 0 | 0 | 21 (6 inf, 0 main) | 38.2 | 291 | 10.6 |
| settled | after soak | 60.8 | 1.4 | 0.2 | 19.8 | 0 | 78 | 9 | 0 / 0 | 0 | 21 (6 inf, 0 main) | 38.2 | 291 | 10.1 |
| settled | the reward (w6-2), Next ready | 60.4 | 3.1 | 0.5 | 19.5 | 0 | 79 | 12 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 38.3 | 382 | 10.1 |
| idle-next | the reward (w6-2), a held Next, untouched | 60.5 | 7.1 | 0.9 | 31 | 13.9 | 82 | 13 | 0 / 58 | 0 | 16 (8 inf, 0 main) | 38.8 | 409 | 10.2 |
| idle-next | the reward (w6-2), a held Next, untouched | 60.6 | 6.9 | 1.1 | 30.8 | 9.6 | 83 | 12 | 0 / 0 | 0 | 16 (8 inf, 0 main) | 38.8 | 385 | 10 |
| idle-next | the reward (w6-2), a held Next, untouched | 60.2 | 4.2 | 0.6 | 24.7 | 0 | 81 | 11 | 0 / 0 | 0 | 16 (8 inf, 0 main) | 38.8 | 385 | 10 |
| idle-next | the reward (w6-2), a held Next, untouched | 60.6 | 4.1 | 0.6 | 24.5 | 0 | 80 | 11 | 0 / 0 | 0 | 16 (8 inf, 0 main) | 38.8 | 385 | 10.1 |
| aura-t0 | ninja demo, streak 0, idle | 60.4 | 5.8 | 1.2 | 30.3 | 8.9 | 82 | 12 | 0 / 0 | 0 | 6 (3 inf, 0 main) | 38.8 | 414 | 10.1 |
| aura-t0 | ninja demo, streak 0, idle | 60.4 | 1.5 | 0.3 | 24.8 | 0 | 78 | 9 | 0 / 0 | 0 | 4 (3 inf, 0 main) | 38.8 | 414 | 10.2 |
| aura-t3 | ninja demo, streak 10, idle | 60.3 | 10.4 | 3 | 33.5 | 15.1 | 85 | 15 | 0 / 99 | 0 | 60 (49 inf, 0 main) | 39.4 | 362 | 10.1 |
| aura-t3 | ninja demo, streak 10, idle | 60.6 | 6.2 | 2.4 | 24.6 | 0 | 83 | 15 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 39.4 | 362 | 10 |
| settled | before stress | 60.5 | 5.1 | 2.2 | 21.6 | 0 | 84 | 14 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 39.4 | 362 | 10.3 |
| stress | strike 1/150 | 60.7 | 18.3 | 5.9 | 58.1 | 0 | 87 | 15 | 0 / 0 | 0 | 63 (49 inf, 0 main) | 39.4 | 414 | 10.6 |
| stress | strike 57/150 | 59.9 | 82.7 | 9.3 | 80 | 150.8 | 137 | 30 | 171 / 251 | 76 | 82 (49 inf, 0 main) | 39.4 | 1475 | 10.5 |
| stress | strike 115/150 | 59.5 | 85.3 | 8.9 | 79.8 | 158.1 | 135 | 30 | 223 / 256 | 39 | 71 (51 inf, 0 main) | 39.4 | 1078 | 10.4 |
| stress | last strike | 60.8 | 85.3 | 9.5 | 79.5 | 154.1 | 130 | 26 | 188 / 261 | 32 | 71 (49 inf, 0 main) | 39.4 | 1194 | 10.5 |
| settled | 10 s after the stress | 60.5 | 4.7 | 2 | 20.6 | 0 | 84 | 15 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 39.4 | 362 | 10.4 |
| settled | map after the stress | 60.8 | 5.2 | 0.9 | 34.2 | 22.2 | 83 | 13 | 0 / 0 | 0 | 32 (12 inf, 0 main) | 39.4 | 300 | 10.3 |

## Levels

| level | kind | secs | finished | max streak | streak at end | stuck |
|---|---|---|---|---|---|---|
| w6-1 | dojo | 110 | yes | 15 | 15 |  |
| w6-2 | sort | 47 | yes | 23 | 23 |  |

## Last boundary: what is still running

```
{
 "animations": {
  "total": 21,
  "running": 6,
  "infinite": 6,
  "hiddenInfinite": 0,
  "mainThreadInfinite": 0,
  "finishedKept": 15,
  "top": [
   [
    "@popin",
    14
   ],
   [
    "@petal-drift-r",
    5
   ],
   [
    "@petal-drift-l",
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
  "window:orientationchange": 1
 },
 "intervals": {
  "100ms at http://127.0.0.1:4841/assets/play-Cg6UHCr6.js:2:971": 1
 },
 "mods": {
  "visemeListeners": 1,
  "bufferCache": 89,
  "captionListeners": 3,
  "clipListeners": 5,
  "sayListeners": 2,
  "music": 1,
  "speaking": 0,
  "decodedLruMB": 38.2,
  "musicDecks": 2,
  "storeListeners": 4,
  "attemptSubs": 0,
  "saveBytes": 4949,
  "adjustLog": 0,
  "poseSubs": 1,
  "particles": 0,
  "particleKinds": {},
  "glowCache": 13,
  "helpStack": 1,
  "nudgeListeners": 1,
  "uprightSubs": 1,
  "imgCache": 2,
  "fxDomChildren": 0,
  "streakListeners": 1,
  "streakSubs": 0,
  "streakN": 23,
  "owned": 0,
  "ownedConnected": 0,
  "busy": 0,
  "spotMounted": 0,
  "moveRunning": 0,
  "spotGen": 6,
  "navStack": 1,
  "navSubs": 2,
  "nudgeSubs": 0,
  "holds": 0,
  "narrateSubs": 0
 }
}
```

