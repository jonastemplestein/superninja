# Soak soak-w1-8

1 levels in one page (reloads: none), fast=2, phone emulation (844×390, DPR 3), CPU throttled 4×, served prod from http://127.0.0.1:4843 (snapshot built 2026-09-27T18:44:33.794Z). Longest streak: 10. Page errors: 0.

## Budgets: **FAIL** (4: listeners, idleRaf, idleNextRaf, idleNextMain)

docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §11.1 and docs/PERF.md §5. "n/a": not judged on this run. Owners are the fix plan's lanes; an offending animation names the file that defines it.

| result | when | check | budget | measured | owner |
|---|---|---|---|---|---|
| pass | after each level, back on the map (GC'd) | DOM nodes (CDP, attached + detached) | ≤ start + 600 (815) | start 215, worst 246 (after w1-8) | all |
| pass | after each level, back on the map (GC'd) | JS heap, MB | ≤ start + 8 (13.4) | start 5.4, worst 8.6 (after w1-8) | all |
| **FAIL** | after each level, back on the map (GC'd) | event listeners | ≤ start + 40 (292) | start 252, worst 332 (after w1-8); over after 1 of 2 boundaries, from w1-8 | all |
| pass | after each level, back on the map (GC'd) | animations on the map | ≤ start + 5 (34) | start 29, worst 29 (after start) | all |
| pass | after each level, back on the map (GC'd) | live intervals | ≤ start + 1 (2) | start 1, worst 1 (after start) | all |
| pass | after each level, back on the map (GC'd) | particles on the canvas | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | nodes in the fx layer | ≤ 0 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | rAF requests/s on the still map | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | live decoded audio, MB | ≤ 64 | start 1, worst 14.8 (after w1-8) | F1, B1 |
| pass | after each level, back on the map (GC'd) | Web Audio nodes (AudioHandlers) | ≤ start + 8 (19) | start 11, worst 11 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | &lt;audio> elements alive | ≤ start + 2 (4) | start 2, worst 2 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | window.__snNavLog entries | ≤ 500 | start 0, worst 36 (after w1-8) | F3 |
| pass | after each level, back on the map (GC'd) | the save's adjustLog entries | ≤ 200 | start 0, worst 0 (after start) | F1 |
| n/a | on the title, untouched for 5 s | live decoded audio, MB | ≤ 2 | not measured (--no-title, or an older run) | B1 |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations the compositor can't run | ≤ 2 | max 0; over in 0 of 10 samples | F1, B, C, D (by file) |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations running on hidden elements | ≤ 2 | max 0; over in 0 of 10 samples | F1, D2 (by file) |
| **FAIL** | the still map, 20 s untouched | rAF requests/s, median | ≤ 5 | 13.3 (max 13.3); main thread 2.9 % | F1, B1 |
| **FAIL** | a held Next (a reward), 20 s untouched, the idle nudge included | rAF requests/s, median | ≤ 5 | 11.9 (max 14.3); main thread 7 % | F1, F3 (nav.tsx), B1 |
| pass | phone ×4, while playing | every screen's median fps | ≥ 50 | lowest reward:w1-8 (60.4) | D5 (the runner); otherwise the screen's owner |
| pass | phone ×4, the still map | main thread %, median | ≤ 5 % | 2.9 % | F1 |
| **FAIL** | phone ×4, a held Next (a reward), the idle nudge included | main thread %, median | ≤ 6 % | 7 % (7.9, 6) | F1 (the ninja), F3 (the nudge), B1 (the reward) |
| pass | phone ×4, the ninja standing still | main thread % at streak 0, mean | ≤ 6 % | 3.1 % (4.6, 1.5) | F1 |
| pass | phone ×4, the ninja standing still | main thread % at streak 10, mean | ≤ 14 % | 7.4 % (9.5, 5.3) | F1 |
| n/a | phone ×4, the World Flower | main thread %, median | ≤ 30 % | not measured (no World Flower visit in this run) | B2 |
| n/a | phone ×4, the World Flower | longest task, ms | ≤ 120 ms | not measured (no World Flower visit in this run) | B2 |
| n/a | the strike stress (streak-10 strikes, 7 a second) | particles at the peak | ≤ 350 | not measured (--stress 0) | F1 |
| n/a | 10 s after the stress | particles / fx nodes left | 0 / 0 | not measured (--stress 0) | F1 |
| pass | the whole soak | page reloads | 0 | 0 | all |
| pass | the whole soak | levels the bot finished | all | 1 of 1 | the scene's owner (or bot.ts) |

## After each level (on the map, after a forced GC)

| metric | start | per level → | last | slope / level | budget |
|---|---|---|---|---|---|
| heapMB | 5.4 | 5.4 8.6 | 8.6 | 3.2 | ok (≤ start + 8 (13.4)) |
| nodes | 215 | 215 246 | 246 | 31 | ok (≤ start + 600 (815)) |
| detachedNodes | 45 | 45 66 | 66 | 21 |  |
| attachedNodes | 170 | 170 180 | 180 | 10 |  |
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
| decodedMB | 1 | 1 14.8 | 14.8 | 13.8 | ok (≤ 64) |
| decodedTotalMB | 1 | 1 14.8 | 14.8 | 13.8 |  |
| decodedClips | 2 | 2 39 | 39 | 37 |  |
| audioHandlers | 11 | 11 11 | 11 | 0 | ok (≤ start + 8 (19)) |
| arrayBuffers | 10 | 10 47 | 47 | 37 |  |
| layoutObjects | 147 | 147 162 | 162 | 15 |  |
| navLog | 0 | 0 36 | 36 | 36 | ok (≤ 500) |
| adjustLog | 0 | 0 0 | 0 | 0 | ok (≤ 200) |
| imagesFetched | 58 | 58 65 | 65 | 7 |  |
| audioFetched | 3 | 3 40 | 40 | 37 |  |
| imgInDomMB | 18 | 18 18 | 18 | 0 |  |
| rendererRssMB | 324 | 324 743 | 743 | 419 |  |
| gpuRssMB | 78 | 78 91 | 91 | 13 |  |
| footprintMB | 78.1 | 78.1 136 | 136 | 57.9 |  |
| gpuFootprintMB | 14.2 | 14.2 14.3 | 14.3 | 0.1 |  |
| mem_blink_gc | 4.9 | 4.9 17.9 | 17.9 | 13 |  |
| mem_blink_objects | 1.9 | 1.9 2.7 | 2.7 | 0.8 |  |
| mem_canvas | 3.5 | 3.5 3.8 | 3.8 | 0.3 |  |
| mem_cc | 113.4 | 113.4 435.1 | 435.1 | 321.7 |  |
| mem_discardable | 109.9 | 109.9 422.9 | 422.9 | 313 |  |
| mem_malloc | 47.6 | 47.6 47.3 | 47.3 | -0.3 |  |
| mem_media | 2.4 | 2.4 2.4 | 2.4 | 0 |  |
| mem_mojo | 0 | 0 0 | 0 | 0 |  |
| mem_parkable_images | 0 | 0 0 | 0 | 0 |  |
| mem_parkable_strings | 0 | 0 0 | 0 | 0 |  |
| mem_partition_alloc | 17.6 | 17.6 58 | 58 | 40.4 |  |
| mem_shared_memory | 142.2 | 142.2 460 | 460 | 317.8 |  |
| mem_site_storage | 0 | 0 0 | 0 | 0 |  |
| mem_skia | 0.2 | 0.2 1.9 | 1.9 | 1.7 |  |
| mem_v8 | 7.4 | 7.4 10.7 | 10.7 | 3.3 |  |
| mem_web_cache | 1.6 | 1.6 1.7 | 1.7 | 0.1 |  |

## While playing (periodic samples): first half vs second half

| metric | first half | second half |
|---|---|---|
| fps | 60.6 | 60.7 |
| slowFramePct | 0 | 0 |
| mainThreadPct | 11.4 | 25.5 |
| scriptPct | 1.5 | 2.5 |
| stylePct | 1.9 | 5 |
| layoutPct | 0.2 | 0.3 |
| recalcPerSec | 60.8 | 63.2 |
| layoutPerSec | 6.8 | 12.3 |
| rendererPct | 85.3 | 93 |
| gpuPct | 8.7 | 13.3 |
| longTaskMs | 0 | 0 |
| rafPerSec | 68.9 | 86.9 |
| rafPerFrame | 1 | 1.2 |
| animHiddenInfinite | 0 | 0 |
| animMainThreadInfinite | 0 | 0 |
| animations | 15 | 63.7 |
| animInfinite | 8 | 38 |
| particles | 0 | 0 |
| particlesPeak | 51 | 148.7 |

## Phases (the title, the still map, a held Next, the ninja's aura, the strike stress)

| phase | what | fps | main % | style % | recalcs/s | rAF/s | renderer CPU % | GPU CPU % | particles (now / peak) | fx nodes | animations | decoded MB | Nodes | heap MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| idle-map | map | 61 | 3.1 | 0.7 | 32.4 | 13.3 | 82 | 10 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 14.8 | 244 | 8.3 |
| idle-map | map | 60.9 | 2.7 | 0.7 | 32.6 | 13.3 | 81 | 9 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 14.8 | 258 | 8.7 |
| settled | after soak | 61 | 1.2 | 0.3 | 20.8 | 0 | 81 | 9 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 14.8 | 244 | 8.4 |
| settled | the reward (w1-8), Next ready | 60.3 | 2.7 | 0.3 | 20.3 | 0 | 82 | 10 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 15.5 | 327 | 8.4 |
| idle-next | the reward (w1-8), a held Next, untouched | 60.5 | 7.9 | 1 | 31.3 | 14.3 | 85 | 12 | 0 / 61 | 0 | 16 (8 inf, 0 main) | 15.9 | 350 | 8.5 |
| idle-next | the reward (w1-8), a held Next, untouched | 60.3 | 6 | 0.8 | 30.9 | 9.5 | 84 | 11 | 0 / 0 | 0 | 16 (8 inf, 0 main) | 15.9 | 330 | 8.3 |
| aura-t0 | ninja demo, streak 0, idle | 60.2 | 4.6 | 1.1 | 26.6 | 0 | 84 | 12 | 0 / 0 | 0 | 4 (3 inf, 0 main) | 15.9 | 679 | 8.7 |
| aura-t0 | ninja demo, streak 0, idle | 60.3 | 1.5 | 0.4 | 24.6 | 0 | 82 | 10 | 0 / 0 | 0 | 4 (3 inf, 0 main) | 15.9 | 679 | 8.8 |
| aura-t3 | ninja demo, streak 10, idle | 60.5 | 9.5 | 2.6 | 30.5 | 15 | 86 | 14 | 0 / 99 | 0 | 60 (49 inf, 0 main) | 16.6 | 307 | 8.6 |
| aura-t3 | ninja demo, streak 10, idle | 60.3 | 5.3 | 1.8 | 20.6 | 0 | 83 | 14 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 16.6 | 307 | 8.6 |
| settled | map after the stress | 60.6 | 3.1 | 0.5 | 25.2 | 14.3 | 83 | 10 | 0 / 0 | 0 | 32 (12 inf, 0 main) | 16.6 | 255 | 8.6 |

## Levels

| level | kind | secs | finished | max streak | streak at end | stuck |
|---|---|---|---|---|---|---|
| w1-8 | swap | 69 | yes | 10 | 10 |  |

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
    "@petal-drift-r",
    3
   ],
   [
    "@petal-drift-l",
    3
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
  "100ms at http://127.0.0.1:4843/assets/play-D2f099y6.js:2:971": 1
 },
 "mods": {
  "visemeListeners": 1,
  "bufferCache": 39,
  "captionListeners": 3,
  "clipListeners": 3,
  "sayListeners": 2,
  "music": 1,
  "speaking": 0,
  "decodedLruMB": 14.8,
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

