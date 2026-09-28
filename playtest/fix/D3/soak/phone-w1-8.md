# Soak soak-phone

1 levels in one page (reloads: none), fast=2, phone emulation (844×390, DPR 3), CPU throttled 4×, served prod from http://127.0.0.1:4843 (snapshot built 2026-09-27T11:34:52.576Z). Longest streak: 10. Page errors: 0.

## Budgets: **FAIL** (2: listeners, idleRaf)

docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §11.1 and docs/PERF.md §5. "n/a": not judged on this run. Owners are the fix plan's lanes; an offending animation names the file that defines it.

| result | when | check | budget | measured | owner |
|---|---|---|---|---|---|
| pass | after each level, back on the map (GC'd) | DOM nodes (CDP, attached + detached) | ≤ start + 600 (806) | start 206, worst 237 (after w1-8) | all |
| pass | after each level, back on the map (GC'd) | JS heap, MB | ≤ start + 8 (13.4) | start 5.4, worst 8.5 (after w1-8) | all |
| **FAIL** | after each level, back on the map (GC'd) | event listeners | ≤ start + 40 (292) | start 252, worst 332 (after w1-8); over after 1 of 2 boundaries, from w1-8 | all |
| pass | after each level, back on the map (GC'd) | animations on the map | ≤ start + 5 (34) | start 29, worst 29 (after start) | all |
| pass | after each level, back on the map (GC'd) | live intervals | ≤ start + 1 (2) | start 1, worst 1 (after start) | all |
| pass | after each level, back on the map (GC'd) | particles on the canvas | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | nodes in the fx layer | ≤ 0 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | rAF requests/s on the still map | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | live decoded audio, MB | ≤ 64 | start 1, worst 14.6 (after w1-8) | F1, B1 |
| pass | after each level, back on the map (GC'd) | Web Audio nodes (AudioHandlers) | ≤ start + 8 (19) | start 11, worst 11 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | &lt;audio> elements alive | ≤ start + 2 (4) | start 2, worst 2 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | window.__snNavLog entries | ≤ 500 | start 0, worst 36 (after w1-8) | F3 |
| pass | after each level, back on the map (GC'd) | the save's adjustLog entries | ≤ 200 | start 0, worst 0 (after start) | F1 |
| n/a | on the title, untouched for 5 s | live decoded audio, MB | ≤ 2 | not measured (--no-title, or an older run) | B1 |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations the compositor can't run | ≤ 2 | max 0; over in 0 of 8 samples | F1, B, C, D (by file) |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations running on hidden elements | ≤ 2 | max 0; over in 0 of 8 samples | F1, D2 (by file) |
| **FAIL** | the still map, 20 s untouched | rAF requests/s, median | ≤ 5 | 12.8 (max 12.8); main thread 3.9 % | F1, B1 |
| n/a | a held Next (a reward), 0 s untouched, the idle nudge included | rAF requests/s, median | ≤ 5 | not measured (--idle-next 0, or an older run) | F1, F3 (nav.tsx), B1 |
| pass | phone ×4, while playing | every screen's median fps | ≥ 50 | lowest level:w1-8 (60.4) | D5 (the runner); otherwise the screen's owner |
| pass | phone ×4, the still map | main thread %, median | ≤ 5 % | 3.9 % | F1 |
| n/a | phone ×4, a held Next (a reward), the idle nudge included | main thread %, median | ≤ 6 % | not measured (--idle-next 0, or an older run) | F1 (the ninja), F3 (the nudge), B1 (the reward) |
| n/a | phone ×4, the ninja standing still | main thread % at streak 0, mean | ≤ 6 % | not measured (--no-aura) | F1 |
| n/a | phone ×4, the ninja standing still | main thread % at streak 10, mean | ≤ 14 % | not measured (--no-aura) | F1 |
| n/a | phone ×4, the World Flower | main thread %, median | ≤ 30 % | not measured (no World Flower visit in this run) | B2 |
| n/a | phone ×4, the World Flower | longest task, ms | ≤ 120 ms | not measured (no World Flower visit in this run) | B2 |
| n/a | the strike stress (streak-10 strikes, 7 a second) | particles at the peak | ≤ 350 | not measured (--stress 0) | F1 |
| n/a | 10 s after the stress | particles / fx nodes left | 0 / 0 | not measured (--stress 0) | F1 |
| pass | the whole soak | page reloads | 0 | 0 | all |
| pass | the whole soak | levels the bot finished | all | 1 of 1 | the scene's owner (or bot.ts) |

## After each level (on the map, after a forced GC)

| metric | start | per level → | last | slope / level | budget |
|---|---|---|---|---|---|
| heapMB | 5.4 | 5.4 8.5 | 8.5 | 3.1 | ok (≤ start + 8 (13.4)) |
| nodes | 206 | 206 237 | 237 | 31 | ok (≤ start + 600 (806)) |
| detachedNodes | 45 | 45 66 | 66 | 21 |  |
| attachedNodes | 161 | 161 171 | 171 | 10 |  |
| listeners | 252 | 252 332 | 332 | 80 | FAIL (≤ start + 40 (292)) |
| globalListeners | 20 | 20 33 | 33 | 13 |  |
| animations | 29 | 29 29 | 29 | 0 | ok (≤ start + 5 (34)) |
| animInfinite | 9 | 9 9 | 9 | 0 |  |
| animHiddenInfinite | 0 | 0 0 | 0 | 0 |  |
| animMainThreadInfinite | 0 | 0 0 | 0 | 0 |  |
| fxDomNodes | 0 | 0 0 | 0 | 0 | ok (≤ 0) |
| particles | 0 | 0 0 | 0 | 0 | ok (≤ 5) |
| rafPerSec | 0 | 0 0 | 0 | 0 | ok (≤ 5) |
| intervals | 1 | 1 1 | 1 | 0 | ok (≤ start + 1 (2)) |
| pendingTimeouts | 1 | 1 1 | 1 | 0 |  |
| mediaAlive | 2 | 2 2 | 2 | 0 | ok (≤ start + 2 (4)) |
| decodedMB | 1 | 1 14.6 | 14.6 | 13.6 | ok (≤ 64) |
| decodedTotalMB | 1 | 1 14.6 | 14.6 | 13.6 |  |
| decodedClips | 2 | 2 39 | 39 | 37 |  |
| audioHandlers | 11 | 11 11 | 11 | 0 | ok (≤ start + 8 (19)) |
| arrayBuffers | 10 | 10 47 | 47 | 37 |  |
| layoutObjects | 147 | 147 162 | 162 | 15 |  |
| navLog | 0 | 0 36 | 36 | 36 | ok (≤ 500) |
| adjustLog | 0 | 0 0 | 0 | 0 | ok (≤ 200) |
| imagesFetched | 56 | 56 63 | 63 | 7 |  |
| audioFetched | 3 | 3 40 | 40 | 37 |  |
| imgInDomMB | 18 | 18 18 | 18 | 0 |  |
| rendererRssMB | 319 | 319 762 | 762 | 443 |  |
| gpuRssMB | 74 | 74 90 | 90 | 16 |  |
| footprintMB | 77.6 | 77.6 140.8 | 140.8 | 63.2 |  |
| gpuFootprintMB | 13.7 | 13.7 14.2 | 14.2 | 0.5 |  |
| mem_blink_gc | 4.7 | 4.7 19.8 | 19.8 | 15.1 |  |
| mem_blink_objects | 1.9 | 1.9 2.9 | 2.9 | 1 |  |
| mem_canvas | 3.5 | 3.5 3.8 | 3.8 | 0.3 |  |
| mem_cc | 104.3 | 104.3 431 | 431 | 326.7 |  |
| mem_discardable | 107.2 | 107.2 429.7 | 429.7 | 322.5 |  |
| mem_malloc | 48.9 | 48.9 49.7 | 49.7 | 0.8 |  |
| mem_media | 2.4 | 2.4 2.4 | 2.4 | 0 |  |
| mem_mojo | 0 | 0 0 | 0 | 0 |  |
| mem_parkable_images | 0 | 0 0 | 0 | 0 |  |
| mem_parkable_strings | 0 | 0 0 | 0 | 0 |  |
| mem_partition_alloc | 16.8 | 16.8 57.6 | 57.6 | 40.8 |  |
| mem_shared_memory | 131 | 131 455.7 | 455.7 | 324.7 |  |
| mem_site_storage | 0 | 0 0 | 0 | 0 |  |
| mem_skia | 0.3 | 0.3 2.2 | 2.2 | 1.9 |  |
| mem_v8 | 7.3 | 7.3 10.6 | 10.6 | 3.3 |  |
| mem_web_cache | 1.3 | 1.3 1.4 | 1.4 | 0.1 |  |

## While playing (periodic samples): first half vs second half

| metric | first half | second half |
|---|---|---|
| fps | 60.4 | 60.6 |
| slowFramePct | 0 | 0 |
| mainThreadPct | 20.1 | 41.6 |
| scriptPct | 2.7 | 3.8 |
| stylePct | 3.5 | 7.9 |
| layoutPct | 0.3 | 0.9 |
| recalcPerSec | 62.8 | 66.1 |
| layoutPerSec | 7.8 | 19.6 |
| rendererPct | 91.7 | 102.7 |
| gpuPct | 13.7 | 21 |
| longTaskMs | 0 | 0 |
| rafPerSec | 70.9 | 84.6 |
| rafPerFrame | 1 | 1.4 |
| animHiddenInfinite | 0 | 0 |
| animMainThreadInfinite | 0 | 0 |
| animations | 23.3 | 42.7 |
| animInfinite | 13 | 25 |
| particles | 1 | 16.3 |
| particlesPeak | 70.3 | 145.3 |

## Phases (the title, the still map, a held Next, the ninja's aura, the strike stress)

| phase | what | fps | main % | style % | recalcs/s | rAF/s | renderer CPU % | GPU CPU % | particles (now / peak) | fx nodes | animations | decoded MB | Nodes | heap MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| idle-map | map | 60.2 | 4.1 | 0.9 | 31.8 | 12.8 | 84 | 14 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 14.6 | 235 | 8.3 |
| idle-map | map | 60.5 | 3.7 | 1 | 31.4 | 12.8 | 83 | 14 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 14.6 | 249 | 8.7 |
| settled | after soak | 60.6 | 1.7 | 0.4 | 19.3 | 0 | 83 | 13 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 14.6 | 235 | 8.4 |

## Levels

| level | kind | secs | finished | max streak | streak at end | stuck |
|---|---|---|---|---|---|---|
| w1-8 | swap | 67 | yes | 10 | 10 |  |

## Last boundary: what is still running

```
{
 "animations": {
  "total": 29,
  "running": 9,
  "infinite": 9,
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
  "100ms at http://127.0.0.1:4843/assets/play-CSvAVode.js:2:971": 1
 },
 "mods": {
  "visemeListeners": 1,
  "bufferCache": 39,
  "captionListeners": 3,
  "clipListeners": 3,
  "sayListeners": 2,
  "music": 1,
  "speaking": 0,
  "decodedLruMB": 14.6,
  "musicDecks": 2,
  "storeListeners": 4,
  "attemptSubs": 0,
  "saveBytes": 2517,
  "adjustLog": 0,
  "poseSubs": 1,
  "particles": 0,
  "particleKinds": {},
  "glowCache": 12,
  "helpStack": 1,
  "nudgeListeners": 1,
  "uprightSubs": 1,
  "imgCache": 2,
  "fxDomChildren": 0,
  "streakListeners": 1,
  "streakSubs": 0,
  "streakN": 10,
  "owned": 0,
  "ownedConnected": 0,
  "busy": 0,
  "spotMounted": 0,
  "moveRunning": 0,
  "spotGen": 2,
  "navStack": 1,
  "navSubs": 2,
  "nudgeSubs": 0,
  "holds": 0,
  "narrateSubs": 0
 }
}
```

