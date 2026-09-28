# Soak soak-phone

4 levels in one page (reloads: none), fast=2, phone emulation (844×390, DPR 3), CPU throttled 4×, served prod from http://127.0.0.1:4822 (snapshot built 2026-09-27T11:36:18.697Z). Longest streak: 20. Page errors: 0.

## Budgets: **FAIL** (4: listeners, intervals, rafPerSec, idleRaf)

docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §11.1 and docs/PERF.md §5. "n/a": not judged on this run. Owners are the fix plan's lanes; an offending animation names the file that defines it.

| result | when | check | budget | measured | owner |
|---|---|---|---|---|---|
| pass | after each level, back on the map (GC'd) | DOM nodes (CDP, attached + detached) | ≤ start + 600 (837) | start 237, worst 340 (after w1-5) | all |
| pass | after each level, back on the map (GC'd) | JS heap, MB | ≤ start + 8 (13.3) | start 5.3, worst 10.2 (after w1-5) | all |
| **FAIL** | after each level, back on the map (GC'd) | event listeners | ≤ start + 40 (292) | start 252, worst 331 (after w1-3); over after 4 of 5 boundaries, from w1-2 | all |
| pass | after each level, back on the map (GC'd) | animations on the map | ≤ start + 5 (34) | start 29, worst 30 (after w1-5) | all |
| **FAIL** | after each level, back on the map (GC'd) | live intervals | ≤ start + 1 (2) | start 1, worst 3 (after w1-4); over after 2 of 5 boundaries, from w1-4 | all |
| pass | after each level, back on the map (GC'd) | particles on the canvas | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | nodes in the fx layer | ≤ 0 | start 0, worst 0 (after start) | F1 |
| **FAIL** | after each level, back on the map (GC'd) | rAF requests/s on the still map | ≤ 5 | start 10.9, worst 10.9 (after start); over after 1 of 5 boundaries, from start | F1 |
| pass | after each level, back on the map (GC'd) | live decoded audio, MB | ≤ 64 | start 1, worst 39.9 (after w1-4) | F1, B1 |
| pass | after each level, back on the map (GC'd) | Web Audio nodes (AudioHandlers) | ≤ start + 8 (19) | start 11, worst 11 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | &lt;audio> elements alive | ≤ start + 2 (4) | start 2, worst 2 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | window.__snNavLog entries | ≤ 500 | start 0, worst 66 (after w1-5) | F3 |
| pass | after each level, back on the map (GC'd) | the save's adjustLog entries | ≤ 200 | start 0, worst 0 (after start) | F1 |
| pass | on the title, untouched for 5 s | live decoded audio, MB | ≤ 2 | 0.7 MB in 2 clips | B1 |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations the compositor can't run | ≤ 2 | max 0; over in 0 of 25 samples | F1, B, C, D (by file) |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations running on hidden elements | ≤ 2 | max 0; over in 0 of 25 samples | F1, D2 (by file) |
| **FAIL** | the still map, 5 s untouched | rAF requests/s, median | ≤ 5 | 12.8 (max 12.8); main thread 2.9 % | F1, B1 |
| n/a | a held Next (a reward), 0 s untouched, the idle nudge included | rAF requests/s, median | ≤ 5 | not measured (--idle-next 0, or an older run) | F1, F3 (nav.tsx), B1 |
| pass | phone ×4, while playing | every screen's median fps | ≥ 50 | lowest level:w1-2 (60.4) | D5 (the runner); otherwise the screen's owner |
| pass | phone ×4, the still map | main thread %, median | ≤ 5 % | 2.9 % | F1 |
| n/a | phone ×4, a held Next (a reward), the idle nudge included | main thread %, median | ≤ 6 % | not measured (--idle-next 0, or an older run) | F1 (the ninja), F3 (the nudge), B1 (the reward) |
| pass | phone ×4, the ninja standing still | main thread % at streak 0, mean | ≤ 6 % | 2.3 % (3.2, 1.3) | F1 |
| pass | phone ×4, the ninja standing still | main thread % at streak 10, mean | ≤ 14 % | 6.2 % (7.7, 4.7) | F1 |
| pass | phone ×4, the World Flower | main thread %, median | ≤ 30 % | 29.7 % over 3 samples (29.7, 29.6, 41) | B2 |
| pass | phone ×4, the World Flower | longest task, ms | ≤ 120 ms | 75 ms | B2 |
| n/a | the strike stress (streak-10 strikes, 7 a second) | particles at the peak | ≤ 350 | not measured (--stress 0) | F1 |
| n/a | 10 s after the stress | particles / fx nodes left | 0 / 0 | not measured (--stress 0) | F1 |
| pass | the whole soak | page reloads | 0 | 0 | all |
| pass | the whole soak | levels the bot finished | all | 4 of 4 | the scene's owner (or bot.ts) |

## After each level (on the map, after a forced GC)

| metric | start | per level → | last | slope / level | budget |
|---|---|---|---|---|---|
| heapMB | 5.3 | 5.3 9 9.5 10 10.2 | 10.2 | 1.08 | ok (≤ start + 8 (13.3)) |
| nodes | 237 | 237 297 316 328 340 | 340 | 23.7 | ok (≤ start + 600 (837)) |
| detachedNodes | 76 | 76 126 135 137 137 | 137 | 13.3 |  |
| attachedNodes | 161 | 161 171 181 191 203 | 203 | 10.4 |  |
| listeners | 252 | 252 305 331 304 304 | 304 | 10.3 | FAIL (≤ start + 40 (292)) |
| globalListeners | 20 | 20 33 33 33 33 | 33 | 2.6 |  |
| animations | 29 | 29 29 29 29 30 | 30 | 0.2 | ok (≤ start + 5 (34)) |
| animInfinite | 9 | 9 8 9 9 10 | 10 | 0.3 |  |
| animHiddenInfinite | 0 | 0 0 0 0 0 | 0 | 0 |  |
| animMainThreadInfinite | 0 | 0 0 0 0 0 | 0 | 0 |  |
| fxDomNodes | 0 | 0 0 0 0 0 | 0 | 0 | ok (≤ 0) |
| particles | 0 | 0 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| rafPerSec | 10.9 | 10.9 0 0 0 0 | 0 | -2.18 | FAIL (≤ 5) |
| intervals | 1 | 1 1 1 3 3 | 3 | 0.6 | FAIL (≤ start + 1 (2)) |
| pendingTimeouts | 1 | 1 2 1 1 1 | 1 | -0.1 |  |
| mediaAlive | 2 | 2 2 2 2 2 | 2 | 0 | ok (≤ start + 2 (4)) |
| decodedMB | 1 | 1 25 32.5 39.9 39.7 | 39.7 | 9.23 | ok (≤ 64) |
| decodedTotalMB | 1 | 1 25 32.5 50.1 54 | 54 | 13.11 |  |
| decodedClips | 2 | 2 60 82 95 98 | 98 | 22.7 |  |
| audioHandlers | 11 | 11 11 10 10 10 | 10 | -0.3 | ok (≤ start + 8 (19)) |
| arrayBuffers | 10 | 10 68 90 103 106 | 106 | 22.7 |  |
| layoutObjects | 178 | 178 223 234 246 259 | 259 | 18.5 |  |
| navLog | 0 | 0 21 32 56 66 | 66 | 16.7 | ok (≤ 500) |
| adjustLog | 0 | 0 0 0 0 0 | 0 | 0 | ok (≤ 200) |
| imagesFetched | 56 | 56 74 83 83 83 | 83 | 6.3 |  |
| audioFetched | 3 | 3 63 85 124 133 | 133 | 32.1 |  |
| imgInDomMB | 18 | 18 17.8 18 18 18 | 18 | 0.02 |  |
| rendererRssMB | 412 | 412 789 909 958 993 | 993 | 133.1 |  |
| gpuRssMB | 68 | 68 79 91 92 93 | 93 | 6.3 |  |

## While playing (periodic samples): first half vs second half

| metric | first half | second half |
|---|---|---|
| fps | 60.5 | 60.6 |
| slowFramePct | 0.2 | 0 |
| mainThreadPct | 23.3 | 27.3 |
| scriptPct | 2.6 | 2.4 |
| stylePct | 4 | 5.1 |
| layoutPct | 0.3 | 0.4 |
| recalcPerSec | 61.6 | 63.9 |
| layoutPerSec | 6.2 | 10.3 |
| rendererPct | 94.4 | 95.1 |
| gpuPct | 17.4 | 18.8 |
| longTaskMs | 9.8 | 11.8 |
| rafPerSec | 71.8 | 81 |
| rafPerFrame | 1.3 | 1.2 |
| animHiddenInfinite | 0 | 0 |
| animMainThreadInfinite | 0 | 0 |
| animations | 39.6 | 56.2 |
| animInfinite | 25.5 | 39 |
| particles | 19.5 | 9.7 |
| particlesPeak | 92.2 | 99 |

## Phases (the title, the still map, a held Next, the ninja's aura, the strike stress)

| phase | what | fps | main % | style % | recalcs/s | rAF/s | renderer CPU % | GPU CPU % | particles (now / peak) | fx nodes | animations | decoded MB | Nodes | heap MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| title | the title, 5 s, untouched | 60.3 | 4 | 1.3 | 27.7 | 11.9 | 83 | 18 | 0 / 0 | 0 | 28 (21 inf, 0 main) | 0.7 | 168 | 5.2 |
| idle-map | map | 60.9 | 2.9 | 0.6 | 28.3 | 12.8 | 81 | 9 | 0 / 0 | 0 | 30 (10 inf, 0 main) | 39.4 | 339 | 10 |
| settled | after soak | 60.6 | 2.6 | 0.4 | 21.8 | 9.9 | 82 | 9 | 0 / 0 | 0 | 34 (13 inf, 0 main) | 39.4 | 350 | 10.2 |
| aura-t0 | ninja demo, streak 0, idle | 60.4 | 3.2 | 0.8 | 24.3 | 6.8 | 82 | 8 | 0 / 0 | 0 | 4 (3 inf, 0 main) | 39.4 | 422 | 10 |
| aura-t0 | ninja demo, streak 0, idle | 60.9 | 1.3 | 0.3 | 25.1 | 0 | 80 | 6 | 0 / 0 | 0 | 4 (3 inf, 0 main) | 39.4 | 422 | 10.2 |
| aura-t3 | ninja demo, streak 10, idle | 60.7 | 7.7 | 2.4 | 34 | 15 | 84 | 11 | 0 / 99 | 0 | 60 (49 inf, 0 main) | 39.4 | 380 | 10.1 |
| aura-t3 | ninja demo, streak 10, idle | 60.3 | 4.7 | 1.7 | 24.8 | 0 | 83 | 11 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 39.4 | 370 | 10 |
| settled | map after the stress | 60.8 | 2.4 | 0.4 | 21.9 | 3 | 81 | 9 | 0 / 0 | 0 | 34 (13 inf, 0 main) | 39.4 | 350 | 10.2 |

## Levels

| level | kind | secs | finished | max streak | streak at end | stuck |
|---|---|---|---|---|---|---|
| w1-2 | firstsound | 91 | yes | 8 | 8 |  |
| w1-3 | firstsound | 74 | yes | 16 | 16 |  |
| w1-4 | dojo | 75 | yes | 16 | 10 |  |
| w1-5 | dojo | 43 | yes | 20 | 20 |  |

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
    "@petal-drift-l",
    4
   ],
   [
    "@petal-drift-r",
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
  "100ms at http://127.0.0.1:4822/assets/play-BQKrr0Wu.js:2:971": 1,
  "250ms at window.setInterval (http://127.0.0.1:4822/assets/play-BQKrr0Wu.js:2:957) < at http://127.0.0.1:4822/assets/play-BQKrr0Wu.js:10:468647": 2
 },
 "mods": {
  "visemeListeners": 1,
  "bufferCache": 98,
  "captionListeners": 3,
  "clipListeners": 3,
  "sayListeners": 2,
  "music": 1,
  "speaking": 0,
  "decodedLruMB": 39.7,
  "musicDecks": 2,
  "storeListeners": 4,
  "attemptSubs": 0,
  "saveBytes": 5180,
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
  "streakN": 20,
  "owned": 0,
  "ownedConnected": 0,
  "busy": 0,
  "spotMounted": 0,
  "moveRunning": 0,
  "spotGen": 11,
  "navStack": 1,
  "navSubs": 2,
  "nudgeSubs": 0,
  "holds": 0,
  "narrateSubs": 0
 }
}
```

