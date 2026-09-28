# Soak soak-before

2 levels in one page (reloads: none), fast=2, phone emulation (844×390, DPR 3), CPU throttled 4×, served none from http://127.0.0.1:4844. Longest streak: 9. Page errors: 0.

## Budgets: **FAIL** (2: nodes, listeners)

docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §11.1 and docs/PERF.md §5. "n/a": not judged on this run. Owners are the fix plan's lanes; an offending animation names the file that defines it.

| result | when | check | budget | measured | owner |
|---|---|---|---|---|---|
| **FAIL** | after each level, back on the map (GC'd) | DOM nodes (CDP, attached + detached) | ≤ start + 600 (768) | start 168, worst 866 (after w6-br2); over after 1 of 3 boundaries, from w6-br2 | all |
| pass | after each level, back on the map (GC'd) | JS heap, MB | ≤ start + 8 (12.5) | start 4.5, worst 7.4 (after w6-br2) | all |
| **FAIL** | after each level, back on the map (GC'd) | event listeners | ≤ start + 40 (291) | start 251, worst 313 (after w6-br2); over after 1 of 3 boundaries, from w6-br2 | all |
| pass | after each level, back on the map (GC'd) | animations on the map | ≤ start + 5 (34) | start 29, worst 29 (after start) | all |
| pass | after each level, back on the map (GC'd) | live intervals | ≤ start + 1 (2) | start 1, worst 1 (after start) | all |
| pass | after each level, back on the map (GC'd) | particles on the canvas | ≤ 5 | start 0, worst 2 (after w6-br2) | F1 |
| pass | after each level, back on the map (GC'd) | nodes in the fx layer | ≤ 0 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | rAF requests/s on the still map | ≤ 5 | start 3.9, worst 3.9 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | live decoded audio, MB | ≤ 64 | start 0.9, worst 13.9 (after w6-br2) | F1, B1 |
| pass | after each level, back on the map (GC'd) | Web Audio nodes (AudioHandlers) | ≤ start + 8 (19) | start 11, worst 11 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | &lt;audio> elements alive | ≤ start + 2 (4) | start 2, worst 2 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | window.__snNavLog entries | ≤ 500 | start 0, worst 5 (after w6-br2) | F3 |
| pass | after each level, back on the map (GC'd) | the save's adjustLog entries | ≤ 200 | start 0, worst 0 (after w6-br1) | F1 |
| n/a | on the title, untouched for 5 s | live decoded audio, MB | ≤ 2 | not measured (--no-title, or an older run) | B1 |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations the compositor can't run | ≤ 2 | max 0; over in 0 of 7 samples | F1, B, C, D (by file) |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations running on hidden elements | ≤ 2 | max 0; over in 0 of 7 samples | F1, D2 (by file) |
| n/a | the still map, 0 s untouched | rAF requests/s, median | ≤ 5 | not measured (--idle 0) | F1, B1 |
| n/a | a held Next (a reward), 0 s untouched, the idle nudge included | rAF requests/s, median | ≤ 5 | not measured (--idle-next 0, or an older run) | F1, F3 (nav.tsx), B1 |
| pass | phone ×4, while playing | every screen's median fps | ≥ 50 | lowest level:w6-br2 (60.1) | D5 (the runner); otherwise the screen's owner |
| n/a | phone ×4, the still map | main thread %, median | ≤ 5 % | not measured (--idle 0) | F1 |
| n/a | phone ×4, a held Next (a reward), the idle nudge included | main thread %, median | ≤ 6 % | not measured (--idle-next 0, or an older run) | F1 (the ninja), F3 (the nudge), B1 (the reward) |
| n/a | phone ×4, the ninja standing still | main thread % at streak 0, mean | ≤ 6 % | not measured (--no-aura) | F1 |
| n/a | phone ×4, the ninja standing still | main thread % at streak 10, mean | ≤ 14 % | not measured (--no-aura) | F1 |
| n/a | phone ×4, the World Flower | main thread %, median | ≤ 30 % | not measured (no World Flower visit in this run) | B2 |
| n/a | phone ×4, the World Flower | longest task, ms | ≤ 120 ms | not measured (no World Flower visit in this run) | B2 |
| n/a | the strike stress (streak-10 strikes, 7 a second) | particles at the peak | ≤ 350 | not measured (--stress 0) | F1 |
| n/a | 10 s after the stress | particles / fx nodes left | 0 / 0 | not measured (--stress 0) | F1 |
| pass | the whole soak | page reloads | 0 | 0 | all |
| pass | the whole soak | levels the bot finished | all | 2 of 2 | the scene's owner (or bot.ts) |

## After each level (on the map, after a forced GC)

| metric | start | per level → | last | slope / level | budget |
|---|---|---|---|---|---|
| heapMB | 4.5 | 4.5 7.2 7.4 | 7.4 | 1.45 | ok (≤ start + 8 (12.5)) |
| nodes | 168 | 168 561 866 | 866 | 349 | FAIL (≤ start + 600 (768)) |
| detachedNodes | 9 | 9 409 704 | 704 | 347.5 |  |
| attachedNodes | 159 | 159 152 162 | 162 | 1.5 |  |
| listeners | 251 | 251 287 313 | 313 | 31 | FAIL (≤ start + 40 (291)) |
| globalListeners | 19 | 19 32 32 | 32 | 6.5 |  |
| animations | 29 | 29 21 21 | 21 | -4 | ok (≤ start + 5 (34)) |
| animInfinite | 9 | 9 6 6 | 6 | -1.5 |  |
| animHiddenInfinite | 0 | 0 0 0 | 0 | 0 |  |
| animMainThreadInfinite | 0 | 0 0 0 | 0 | 0 |  |
| fxDomNodes | 0 | 0 0 0 | 0 | 0 | ok (≤ 0) |
| particles | 0 | 0 1 2 | 2 | 1 | ok (≤ 5) |
| rafPerSec | 3.9 | 3.9 0 0 | 0 | -1.95 | ok (≤ 5) |
| intervals | 1 | 1 1 1 | 1 | 0 | ok (≤ start + 1 (2)) |
| pendingTimeouts | 0 | 0 0 0 | 0 | 0 |  |
| mediaAlive | 2 | 2 2 2 | 2 | 0 | ok (≤ start + 2 (4)) |
| decodedMB | 0.9 | 0.9 10.6 13.9 | 13.9 | 6.5 | ok (≤ 64) |
| decodedTotalMB | 0.9 | 0.9 10.6 13.9 | 13.9 | 6.5 |  |
| decodedClips | 2 | 2 36 55 | 55 | 26.5 |  |
| audioHandlers | 11 | 11 11 11 | 11 | 0 | ok (≤ start + 8 (19)) |
| arrayBuffers | 4 | 4 38 57 | 57 | 26.5 |  |
| layoutObjects | 117 | 117 111 121 | 121 | 2 |  |
| navLog | 0 | 0 4 5 | 5 | 2.5 | ok (≤ 500) |
| adjustLog | - | 0 0 | 0 | 0 | ok (≤ 200) |
| imagesFetched | 56 | 56 66 71 | 71 | 7.5 |  |
| audioFetched | 3 | 3 39 58 | 58 | 27.5 |  |
| imgInDomMB | 22.5 | 22.5 20.3 20.3 | 20.3 | -1.1 |  |
| rendererRssMB | 411 | 411 781 893 | 893 | 241 |  |
| gpuRssMB | 70 | 70 76 77 | 77 | 3.5 |  |

## While playing (periodic samples): first half vs second half

| metric | first half | second half |
|---|---|---|
| fps | 60.6 | 60.4 |
| slowFramePct | 0 | 0.4 |
| mainThreadPct | 27.2 | 35.6 |
| scriptPct | 4 | 4.6 |
| stylePct | 3.8 | 5 |
| layoutPct | 0.7 | 1.2 |
| recalcPerSec | 113.9 | 114.5 |
| layoutPerSec | 14.9 | 24.8 |
| rendererPct | 96 | 101.8 |
| gpuPct | 12 | 15.8 |
| longTaskMs | 20 | 0 |
| rafPerSec | 116.4 | 125 |
| rafPerFrame | 1.6 | 1.4 |
| animHiddenInfinite | 0 | 0 |
| animMainThreadInfinite | 0 | 0 |
| animations | 25.3 | 33.8 |
| animInfinite | 13.3 | 18.8 |
| particles | 10 | 16 |
| particlesPeak | 76 | 164.5 |

## Phases (the title, the still map, a held Next, the ninja's aura, the strike stress)

| phase | what | fps | main % | style % | recalcs/s | rAF/s | renderer CPU % | GPU CPU % | particles (now / peak) | fx nodes | animations | decoded MB | Nodes | heap MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| settled | after soak | 60.1 | 1.1 | 0.2 | 20.6 | 0 | 83 | 9 | 2 / 0 | 0 | 21 (6 inf, 0 main) | 13.9 | 866 | 7.4 |

## Levels

| level | kind | secs | finished | max streak | streak at end | stuck |
|---|---|---|---|---|---|---|
| w6-br1 | sort | 46 | yes | 8 | 8 |  |
| w6-br2 | sort | 36 | yes | 9 | 0 |  |

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
    "@drift",
    6
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
  "window:pointerdown:capture": 3,
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
  "100ms at http://127.0.0.1:4844/assets/play-Z1ApfqUX.js:2:342": 1
 },
 "mods": {}
}
```

