# Soak soak

3 levels in one page (reloads: none), fast=2, phone emulation (844×390, DPR 3), CPU throttled 4×, served prod from http://127.0.0.1:4844 (snapshot built 2026-09-27T21:25:46.223Z). Longest streak: 31. Page errors: 0.

## Budgets: **FAIL** (2: idleNextRaf, flowerMain)

docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §11.1 and docs/PERF.md §5. "n/a": not judged on this run. Owners are the fix plan's lanes; an offending animation names the file that defines it.

| result | when | check | budget | measured | owner |
|---|---|---|---|---|---|
| pass | after each level, back on the map (GC'd) | DOM nodes (CDP, attached + detached) | ≤ start + 600 (846) | start 246, worst 302 (after w6-1) | all |
| pass | after each level, back on the map (GC'd) | JS heap, MB | ≤ start + 8 (16.3) | cold map 6.5, start 8.3 (after w6-br1, the warm-up), worst 10.1 (after w6-1) | all |
| pass | after each level, back on the map (GC'd) | event listeners | ≤ start + 40 (292) | start 252, worst 252 (after start) | all |
| pass | after each level, back on the map (GC'd) | animations on the map | ≤ start + 5 (34) | start 29, worst 29 (after start) | all |
| pass | after each level, back on the map (GC'd) | live intervals | ≤ start + 1 (2) | start 1, worst 1 (after start) | all |
| pass | after each level, back on the map (GC'd) | particles on the canvas | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | nodes in the fx layer | ≤ 0 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | rAF requests/s on the still map | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | live decoded audio, MB | ≤ 64 | start 1, worst 39.9 (after w6-1) | F1, B1 |
| pass | after each level, back on the map (GC'd) | Web Audio nodes (AudioHandlers) | ≤ start + 8 (19) | start 11, worst 11 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | &lt;audio> elements alive | ≤ start + 2 (4) | start 2, worst 2 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | window.__snNavLog entries | ≤ 500 | start 0, worst 42 (after w6-1) | F3 |
| pass | after each level, back on the map (GC'd) | the save's adjustLog entries | ≤ 200 | start 0, worst 0 (after start) | F1 |
| pass | on the title, untouched for 5 s | live decoded audio, MB | ≤ 2 | 0.7 MB in 2 clips | B1 |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations the compositor can't run | ≤ 2 | max 0; over in 0 of 21 samples | F1, B, C, D (by file) |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations running on hidden elements | ≤ 2 | max 0; over in 0 of 21 samples | F1, D2 (by file) |
| pass | the still map, 20 s untouched | rAF requests/s, median | ≤ 5 | 0 (max 0); main thread 1.2 % | F1, B1 |
| **FAIL** | a held Next (a reward), 20 s untouched, the idle nudge included | rAF requests/s, median | ≤ 5 | 12.1 (max 14.7); main thread 6 % | F1, F3 (nav.tsx), B1 |
| pass | phone ×4, while playing | every screen's median fps | ≥ 50 | lowest reward:w6-1 (60.4) | D5 (the runner); otherwise the screen's owner |
| pass | phone ×4, the still map | main thread %, median | ≤ 5 % | 1.2 % | F1 |
| pass | phone ×4, a held Next (a reward), the idle nudge included | main thread %, median | ≤ 6 % | 6 % (6.2, 5.7) | F1 (the ninja), F3 (the nudge), B1 (the reward) |
| pass | phone ×4, the ninja standing still | main thread % at streak 0, mean | ≤ 6 % | 3.6 % (5.7, 1.4) | F1 |
| pass | phone ×4, the ninja standing still | main thread % at streak 10, mean | ≤ 14 % | 8.3 % (10.4, 6.1) | F1 |
| **FAIL** | phone ×4, the World Flower | main thread %, median | ≤ 30 % | 34.5 % over 1 sample (34.5) | B2 |
| pass | phone ×4, the World Flower | longest task, ms | ≤ 120 ms | 50 ms | B2 |
| pass | the strike stress (150 streak-10 strikes, 7 a second) | particles at the peak | ≤ 350 | 239 (fx nodes 76) | F1 |
| pass | 10 s after the stress | particles / fx nodes left | 0 / 0 | 0 / 0 | F1 |
| pass | the whole soak | page reloads | 0 | 0 | all |
| pass | the whole soak | levels the bot finished | all | 3 of 3 | the scene's owner (or bot.ts) |

## After each level (on the map, after a forced GC)

| metric | start | per level → | last | slope / level | budget |
|---|---|---|---|---|---|
| heapMB | 6.5 | 6.5 8.3 8.5 10.1 | 10.1 | 1.1 | ok (≤ start + 8 (16.3)) |
| nodes | 246 | 246 252 267 302 | 302 | 18.3 | ok (≤ start + 600 (846)) |
| detachedNodes | 76 | 76 89 94 119 | 119 | 13.4 |  |
| attachedNodes | 170 | 170 163 173 183 | 183 | 4.9 |  |
| listeners | 252 | 252 230 230 230 | 230 | -6.6 | ok (≤ start + 40 (292)) |
| globalListeners | 20 | 20 19 19 19 | 19 | -0.3 |  |
| animations | 29 | 29 21 21 21 | 21 | -2.4 | ok (≤ start + 5 (34)) |
| animInfinite | 9 | 9 6 6 6 | 6 | -0.9 |  |
| animHiddenInfinite | 0 | 0 0 0 0 | 0 | 0 |  |
| animMainThreadInfinite | 0 | 0 0 0 0 | 0 | 0 |  |
| fxDomNodes | 0 | 0 0 0 0 | 0 | 0 | ok (≤ 0) |
| particles | 0 | 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| rafPerSec | 0 | 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| intervals | 1 | 1 1 1 1 | 1 | 0 | ok (≤ start + 1 (2)) |
| pendingTimeouts | 1 | 1 0 0 0 | 0 | -0.3 |  |
| mediaAlive | 2 | 2 2 2 2 | 2 | 0 | ok (≤ start + 2 (4)) |
| decodedMB | 1 | 1 16.8 21.6 39.9 | 39.9 | 12.15 | ok (≤ 64) |
| decodedTotalMB | 1 | 1 16.8 21.6 49.6 | 49.6 | 15.06 |  |
| decodedClips | 2 | 2 49 67 108 | 108 | 33.6 |  |
| audioHandlers | 11 | 11 11 11 11 | 11 | 0 | ok (≤ start + 8 (19)) |
| arrayBuffers | 10 | 10 57 75 116 | 116 | 33.6 |  |
| layoutObjects | 178 | 178 172 182 214 | 214 | 11.8 |  |
| navLog | 0 | 0 6 7 42 | 42 | 12.7 | ok (≤ 500) |
| adjustLog | 0 | 0 0 0 0 | 0 | 0 | ok (≤ 200) |
| imagesFetched | 58 | 58 68 70 93 | 93 | 10.7 |  |
| audioFetched | 3 | 3 52 70 134 | 134 | 41.1 |  |
| imgInDomMB | 18 | 18 13 13 13 | 13 | -1.5 |  |
| rendererRssMB | 414 | 414 793 861 973 | 973 | 174.5 |  |
| gpuRssMB | 68 | 68 78 81 81 | 81 | 4.2 |  |

## While playing (periodic samples): first half vs second half

| metric | first half | second half |
|---|---|---|
| fps | 60.7 | 60.6 |
| slowFramePct | 0 | 0 |
| mainThreadPct | 28.2 | 28.2 |
| scriptPct | 3.6 | 2.6 |
| stylePct | 4.3 | 5.2 |
| layoutPct | 0.6 | 0.3 |
| recalcPerSec | 105.4 | 61.8 |
| layoutPerSec | 17.8 | 9.2 |
| rendererPct | 95 | 95.9 |
| gpuPct | 11.8 | 14.4 |
| longTaskMs | 0 | 6.3 |
| rafPerSec | 124.1 | 86.4 |
| rafPerFrame | 1.8 | 1.3 |
| animHiddenInfinite | 0 | 0 |
| animMainThreadInfinite | 0 | 0 |
| animations | 43.6 | 68.9 |
| animInfinite | 27.4 | 52.5 |
| particles | 22.8 | 3.9 |
| particlesPeak | 120 | 131.6 |

## Phases (the title, the still map, a held Next, the ninja's aura, the strike stress)

| phase | what | fps | main % | style % | recalcs/s | rAF/s | renderer CPU % | GPU CPU % | particles (now / peak) | fx nodes | animations | decoded MB | Nodes | heap MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| title | the title, 5 s, untouched | 60.1 | 2.1 | 0.6 | 27.2 | 9.4 | 81 | 13 | 0 / 0 | 0 | 28 (21 inf, 0 main) | 0.7 | 177 | 5.3 |
| idle-map | map | 60.4 | 1.3 | 0.3 | 23.8 | 0 | 81 | 8 | 0 / 0 | 0 | 21 (6 inf, 0 main) | 39.9 | 302 | 10 |
| idle-map | map | 60.4 | 1 | 0.2 | 23.7 | 0 | 81 | 7 | 0 / 0 | 0 | 21 (6 inf, 0 main) | 39.9 | 302 | 10.1 |
| settled | after soak | 61.1 | 1.2 | 0.3 | 20.3 | 0 | 82 | 8 | 0 / 0 | 0 | 21 (6 inf, 0 main) | 39.9 | 302 | 10.1 |
| settled | the reward (w6-1), Next ready | 60.2 | 4.1 | 0.6 | 24.7 | 5.9 | 83 | 10 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 40 | 383 | 10.2 |
| idle-next | the reward (w6-1), a held Next, untouched | 60.3 | 6.2 | 0.9 | 31.3 | 14.7 | 83 | 9 | 0 / 61 | 0 | 16 (8 inf, 0 main) | 39.7 | 410 | 10.3 |
| idle-next | the reward (w6-1), a held Next, untouched | 60.4 | 5.7 | 0.8 | 30.5 | 9.6 | 83 | 9 | 0 / 0 | 0 | 16 (8 inf, 0 main) | 39.7 | 386 | 10 |
| aura-t0 | ninja demo, streak 0, idle | 60.6 | 5.7 | 1.2 | 30.8 | 8.9 | 85 | 10 | 0 / 0 | 0 | 4 (3 inf, 0 main) | 39.1 | 363 | 10.1 |
| aura-t0 | ninja demo, streak 0, idle | 60.1 | 1.4 | 0.4 | 24.1 | 0 | 81 | 8 | 0 / 0 | 0 | 4 (3 inf, 0 main) | 39.1 | 363 | 10.2 |
| aura-t3 | ninja demo, streak 10, idle | 60.5 | 10.4 | 3 | 32.5 | 14.8 | 87 | 15 | 0 / 99 | 0 | 63 (49 inf, 0 main) | 39.1 | 373 | 10.1 |
| aura-t3 | ninja demo, streak 10, idle | 60.2 | 6.1 | 2.4 | 24.7 | 0 | 83 | 17 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 39.1 | 363 | 10.2 |
| settled | before stress | 60.3 | 5.1 | 1.9 | 21.9 | 0 | 88 | 18 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 39.1 | 363 | 10.4 |
| stress | strike 1/150 | 59.7 | 18.1 | 6.4 | 58.9 | 0 | 86 | 17 | 0 / 0 | 0 | 63 (49 inf, 0 main) | 39.1 | 415 | 10.7 |
| stress | strike 52/150 | 59.3 | 81.7 | 8.8 | 76.1 | 133.6 | 135 | 31 | 239 / 223 | 30 | 74 (55 inf, 0 main) | 39.1 | 678 | 12.2 |
| stress | strike 101/150 | 59.5 | 83.7 | 9 | 78.5 | 131.7 | 134 | 32 | 177 / 238 | 37 | 81 (49 inf, 0 main) | 39.1 | 1021 | 11.8 |
| stress | strike 145/150 | 60.7 | 76.7 | 8.4 | 72 | 121.5 | 131 | 30 | 177 / 234 | 14 | 69 (51 inf, 0 main) | 39.1 | 986 | 10.4 |
| stress | last strike | 60.4 | 57.9 | 8.1 | 71.7 | 87.2 | 106 | 25 | 174 / 182 | 30 | 72 (49 inf, 0 main) | 39.1 | 682 | 10.4 |
| settled | 10 s after the stress | 60.1 | 5.3 | 1.8 | 21.7 | 0 | 78 | 17 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 39.1 | 363 | 10.5 |
| settled | map after the stress | 60.2 | 3.2 | 0.7 | 26 | 9.9 | 76 | 14 | 0 / 0 | 0 | 33 (12 inf, 0 main) | 39.1 | 301 | 10.4 |

## Levels

| level | kind | secs | finished | max streak | streak at end | stuck |
|---|---|---|---|---|---|---|
| w6-br1 | sort | 57 | yes | 8 | 8 |  |
| w6-br2 | sort | 37 | yes | 16 | 16 |  |
| w6-1 | dojo | 98 | yes | 31 | 31 |  |

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
    3
   ],
   [
    "@petal-drift-l",
    3
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
  "100ms at http://127.0.0.1:4844/assets/play-q1VSzJ7p.js:2:971": 1
 },
 "mods": {
  "visemeListeners": 1,
  "bufferCache": 108,
  "captionListeners": 3,
  "clipListeners": 5,
  "sayListeners": 2,
  "music": 1,
  "speaking": 0,
  "decodedLruMB": 39.9,
  "musicDecks": 2,
  "storeListeners": 4,
  "attemptSubs": 0,
  "saveBytes": 6091,
  "adjustLog": 0,
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
  "streakN": 31,
  "owned": 0,
  "ownedConnected": 0,
  "busy": 0,
  "spotMounted": 0,
  "moveRunning": 0,
  "spotGen": 8,
  "navStack": 1,
  "navSubs": 2,
  "nudgeSubs": 0,
  "holds": 0,
  "narrateSubs": 0
 }
}
```

