# Soak soak-phone

2 levels in one page (reloads: none), fast=2, phone emulation (844×390, DPR 3), CPU throttled 4×, served prod from http://127.0.0.1:4841 (snapshot built 2026-09-27T10:42:10.698Z). Longest streak: 26. Page errors: 0.

## Budgets: **FAIL** (1: flowerMain)

docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §11.1 and docs/PERF.md §5. "n/a": not judged on this run. Owners are the fix plan's lanes; an offending animation names the file that defines it.

| result | when | check | budget | measured | owner |
|---|---|---|---|---|---|
| pass | after each level, back on the map (GC'd) | DOM nodes (CDP, attached + detached) | ≤ start + 600 (806) | start 206, worst 252 (after w2-2) | all |
| pass | after each level, back on the map (GC'd) | JS heap, MB | ≤ start + 8 (13.4) | start 5.4, worst 9.9 (after w2-2) | all |
| pass | after each level, back on the map (GC'd) | event listeners | ≤ start + 40 (292) | start 252, worst 252 (after start) | all |
| pass | after each level, back on the map (GC'd) | animations on the map | ≤ start + 5 (34) | start 29, worst 29 (after start) | all |
| pass | after each level, back on the map (GC'd) | live intervals | ≤ start + 1 (2) | start 1, worst 1 (after start) | all |
| pass | after each level, back on the map (GC'd) | particles on the canvas | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | nodes in the fx layer | ≤ 0 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | rAF requests/s on the still map | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | live decoded audio, MB | ≤ 64 | start 1, worst 39 (after w2-2) | F1, B1 |
| pass | after each level, back on the map (GC'd) | Web Audio nodes (AudioHandlers) | ≤ start + 8 (19) | start 11, worst 11 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | &lt;audio> elements alive | ≤ start + 2 (4) | start 2, worst 2 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | window.__snNavLog entries | ≤ 500 | start 0, worst 55 (after w2-2) | F3 |
| pass | after each level, back on the map (GC'd) | the save's adjustLog entries | ≤ 200 | start 0, worst 0 (after start) | F1 |
| n/a | on the title, untouched for 5 s | live decoded audio, MB | ≤ 2 | not measured (--no-title, or an older run) | B1 |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations the compositor can't run | ≤ 2 | max 0; over in 0 of 15 samples | F1, B, C, D (by file) |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations running on hidden elements | ≤ 2 | max 0; over in 0 of 15 samples | F1, D2 (by file) |
| pass | the still map, 20 s untouched | rAF requests/s, median | ≤ 5 | 0 (max 0); main thread 1.6 % | F1, B1 |
| n/a | a held Next (a reward), 0 s untouched, the idle nudge included | rAF requests/s, median | ≤ 5 | not measured (--idle-next 0, or an older run) | F1, F3 (nav.tsx), B1 |
| pass | phone ×4, while playing | every screen's median fps | ≥ 50 | lowest level:w2-1 (60.6) | D5 (the runner); otherwise the screen's owner |
| pass | phone ×4, the still map | main thread %, median | ≤ 5 % | 1.6 % | F1 |
| n/a | phone ×4, a held Next (a reward), the idle nudge included | main thread %, median | ≤ 6 % | not measured (--idle-next 0, or an older run) | F1 (the ninja), F3 (the nudge), B1 (the reward) |
| pass | phone ×4, the ninja standing still | main thread % at streak 0, mean | ≤ 6 % | 3 % (4.1, 1.9) | F1 |
| pass | phone ×4, the ninja standing still | main thread % at streak 10, mean | ≤ 14 % | 8.8 % (11, 6.6) | F1 |
| **FAIL** | phone ×4, the World Flower | main thread %, median | ≤ 30 % | 40.2 % over 2 samples (45.4, 35) | B2 |
| pass | phone ×4, the World Flower | longest task, ms | ≤ 120 ms | 66 ms | B2 |
| n/a | the strike stress (streak-10 strikes, 7 a second) | particles at the peak | ≤ 350 | not measured (--stress 0) | F1 |
| n/a | 10 s after the stress | particles / fx nodes left | 0 / 0 | not measured (--stress 0) | F1 |
| pass | the whole soak | page reloads | 0 | 0 | all |
| pass | the whole soak | levels the bot finished | all | 2 of 2 | the scene's owner (or bot.ts) |

## After each level (on the map, after a forced GC)

| metric | start | per level → | last | slope / level | budget |
|---|---|---|---|---|---|
| heapMB | 5.4 | 5.4 9.4 9.9 | 9.9 | 2.25 | ok (≤ start + 8 (13.4)) |
| nodes | 206 | 206 242 252 | 252 | 23 | ok (≤ start + 600 (806)) |
| detachedNodes | 45 | 45 100 100 | 100 | 27.5 |  |
| attachedNodes | 161 | 161 142 152 | 152 | -4.5 |  |
| listeners | 252 | 252 238 238 | 238 | -7 | ok (≤ start + 40 (292)) |
| globalListeners | 20 | 20 32 32 | 32 | 6 |  |
| animations | 29 | 29 15 15 | 15 | -7 | ok (≤ start + 5 (34)) |
| animInfinite | 9 | 9 6 6 | 6 | -1.5 |  |
| animHiddenInfinite | 0 | 0 0 0 | 0 | 0 |  |
| animMainThreadInfinite | 0 | 0 0 0 | 0 | 0 |  |
| fxDomNodes | 0 | 0 0 0 | 0 | 0 | ok (≤ 0) |
| particles | 0 | 0 0 0 | 0 | 0 | ok (≤ 5) |
| rafPerSec | 0 | 0 0 0 | 0 | 0 | ok (≤ 5) |
| intervals | 1 | 1 1 1 | 1 | 0 | ok (≤ start + 1 (2)) |
| pendingTimeouts | 1 | 1 0 0 | 0 | -0.5 |  |
| mediaAlive | 2 | 2 2 2 | 2 | 0 | ok (≤ start + 2 (4)) |
| decodedMB | 1 | 1 34.7 39 | 39 | 19 | ok (≤ 64) |
| decodedTotalMB | 1 | 1 34.7 41.7 | 41.7 | 20.35 |  |
| decodedClips | 2 | 2 86 98 | 98 | 48 |  |
| audioHandlers | 11 | 11 11 11 | 11 | 0 | ok (≤ start + 8 (19)) |
| arrayBuffers | 10 | 10 94 106 | 106 | 48 |  |
| layoutObjects | 147 | 147 160 170 | 170 | 11.5 |  |
| navLog | 0 | 0 38 55 | 55 | 27.5 | ok (≤ 500) |
| adjustLog | 0 | 0 0 0 | 0 | 0 | ok (≤ 200) |
| imagesFetched | 56 | 56 80 82 | 82 | 13 |  |
| audioFetched | 3 | 3 89 106 | 106 | 51.5 |  |
| imgInDomMB | 18 | 18 11 11 | 11 | -3.5 |  |
| rendererRssMB | 324 | 324 924 965 | 965 | 320.5 |  |
| gpuRssMB | 79 | 79 93 94 | 94 | 7.5 |  |
| footprintMB | 77.6 | 77.6 206.5 235.7 | 235.7 | 79.05 |  |
| gpuFootprintMB | 14.7 | 14.7 14.5 15.7 | 15.7 | 0.5 |  |
| mem_blink_gc | 4.8 | 4.8 24.7 32.4 | 32.4 | 13.8 |  |
| mem_blink_objects | 1.9 | 1.9 3.3 3.6 | 3.6 | 0.85 |  |
| mem_canvas | 3.5 | 3.5 3.8 3.8 | 3.8 | 0.15 |  |
| mem_cc | 103.6 | 103.6 530.5 518.2 | 518.2 | 207.3 |  |
| mem_discardable | 105.5 | 105.5 513 512 | 512 | 203.25 |  |
| mem_malloc | 47.5 | 47.5 63.9 65 | 65 | 8.75 |  |
| mem_media | 2.4 | 2.4 2.4 2.4 | 2.4 | 0 |  |
| mem_mojo | 0 | 0 0 0 | 0 | 0 |  |
| mem_parkable_images | 0 | 0 0 0 | 0 | 0 |  |
| mem_parkable_strings | 0 | 0 0 0 | 0 | 0 |  |
| mem_partition_alloc | 16.6 | 16.6 104.5 132.3 | 132.3 | 57.85 |  |
| mem_shared_memory | 132.1 | 132.1 555.2 548.9 | 548.9 | 208.4 |  |
| mem_site_storage | 0 | 0 0 0 | 0 | 0 |  |
| mem_skia | 0.3 | 0.3 2.5 2.1 | 2.1 | 0.9 |  |
| mem_v8 | 7.2 | 7.2 11.7 12.4 | 12.4 | 2.6 |  |
| mem_web_cache | 1.3 | 1.3 1.2 1.2 | 1.2 | -0.05 |  |

## While playing (periodic samples): first half vs second half

| metric | first half | second half |
|---|---|---|
| fps | 60.6 | 60.9 |
| slowFramePct | 0 | 0 |
| mainThreadPct | 22.2 | 41.6 |
| scriptPct | 2.8 | 3.6 |
| stylePct | 3 | 7.2 |
| layoutPct | 0.5 | 0.6 |
| recalcPerSec | 63.2 | 66 |
| layoutPerSec | 10.7 | 14.2 |
| rendererPct | 92.8 | 103.4 |
| gpuPct | 12.3 | 22.9 |
| longTaskMs | 0 | 9.4 |
| rafPerSec | 83.7 | 91.2 |
| rafPerFrame | 1.1 | 1.3 |
| animHiddenInfinite | 0 | 0 |
| animMainThreadInfinite | 0 | 0 |
| animations | 24.3 | 75 |
| animInfinite | 14.8 | 53.3 |
| particles | 1.7 | 51 |
| particlesPeak | 89.3 | 168 |

## Phases (the title, the still map, a held Next, the ninja's aura, the strike stress)

| phase | what | fps | main % | style % | recalcs/s | rAF/s | renderer CPU % | GPU CPU % | particles (now / peak) | fx nodes | animations | decoded MB | Nodes | heap MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| idle-map | map | 60.3 | 1.7 | 0.4 | 23.8 | 0 | 82 | 8 | 0 / 0 | 0 | 15 (6 inf, 0 main) | 39 | 252 | 9.8 |
| idle-map | map | 60.2 | 1.5 | 0.4 | 23.8 | 0 | 82 | 8 | 0 / 0 | 0 | 15 (6 inf, 0 main) | 39 | 252 | 10 |
| settled | after soak | 60.4 | 1.3 | 0.4 | 20.8 | 0 | 83 | 6 | 0 / 0 | 0 | 15 (6 inf, 0 main) | 39 | 252 | 9.9 |
| aura-t0 | ninja demo, streak 0, idle | 61 | 4.1 | 1.1 | 26.4 | 0 | 85 | 10 | 0 / 0 | 0 | 4 (3 inf, 0 main) | 39 | 387 | 10 |
| aura-t0 | ninja demo, streak 0, idle | 60.3 | 1.9 | 0.4 | 25.3 | 0 | 82 | 9 | 0 / 0 | 0 | 4 (3 inf, 0 main) | 39 | 387 | 10.2 |
| aura-t3 | ninja demo, streak 10, idle | 60.8 | 11 | 3.1 | 34.6 | 15.1 | 88 | 15 | 0 / 99 | 0 | 60 (49 inf, 0 main) | 39.7 | 335 | 10 |
| aura-t3 | ninja demo, streak 10, idle | 60.7 | 6.6 | 2.6 | 24.6 | 0 | 86 | 16 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 39.7 | 335 | 9.9 |
| settled | map after the stress | 60.8 | 1.8 | 0.5 | 20.1 | 0 | 84 | 13 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 39.7 | 263 | 10 |

## Levels

| level | kind | secs | finished | max streak | streak at end | stuck |
|---|---|---|---|---|---|---|
| w2-1 | dojo | 120 | yes | 17 | 17 |  |
| w2-2 | battle | 40 | yes | 26 | 26 |  |

## Last boundary: what is still running

```
{
 "animations": {
  "total": 15,
  "running": 6,
  "infinite": 6,
  "hiddenInfinite": 0,
  "mainThreadInfinite": 0,
  "finishedKept": 9,
  "top": [
   [
    "@popin",
    8
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
  "100ms at http://127.0.0.1:4841/assets/play-CLIfImqf.js:2:971": 1
 },
 "mods": {
  "visemeListeners": 1,
  "bufferCache": 98,
  "captionListeners": 3,
  "clipListeners": 3,
  "sayListeners": 2,
  "music": 1,
  "speaking": 0,
  "decodedLruMB": 39,
  "musicDecks": 2,
  "storeListeners": 4,
  "attemptSubs": 0,
  "saveBytes": 5432,
  "adjustLog": 0,
  "poseSubs": 1,
  "particles": 0,
  "particleKinds": {},
  "glowCache": 17,
  "helpStack": 1,
  "nudgeListeners": 1,
  "uprightSubs": 1,
  "imgCache": 2,
  "fxDomChildren": 0,
  "streakListeners": 1,
  "streakSubs": 0,
  "streakN": 26,
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

