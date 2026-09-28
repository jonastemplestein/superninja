# Soak soak-w1-6b

1 levels in one page (reloads: none), fast=2, phone emulation (844×390, DPR 3), CPU throttled 4×, served prod from http://127.0.0.1:4842 (snapshot built 2026-09-27T10:45:23.579Z). Longest streak: 8. Page errors: 0.

## Budgets: **FAIL** (1: listeners)

docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §11.1 and docs/PERF.md §5. "n/a": not judged on this run. Owners are the fix plan's lanes; an offending animation names the file that defines it.

| result | when | check | budget | measured | owner |
|---|---|---|---|---|---|
| pass | after each level, back on the map (GC'd) | DOM nodes (CDP, attached + detached) | ≤ start + 600 (837) | start 237, worst 263 (after w1-6) | all |
| pass | after each level, back on the map (GC'd) | JS heap, MB | ≤ start + 8 (13.4) | start 5.4, worst 8.3 (after w1-6) | all |
| **FAIL** | after each level, back on the map (GC'd) | event listeners | ≤ start + 40 (292) | start 252, worst 332 (after w1-6); over after 1 of 2 boundaries, from w1-6 | all |
| pass | after each level, back on the map (GC'd) | animations on the map | ≤ start + 5 (34) | start 29, worst 29 (after start) | all |
| pass | after each level, back on the map (GC'd) | live intervals | ≤ start + 1 (2) | start 1, worst 1 (after start) | all |
| pass | after each level, back on the map (GC'd) | particles on the canvas | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | nodes in the fx layer | ≤ 0 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | rAF requests/s on the still map | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | live decoded audio, MB | ≤ 64 | start 1, worst 12.2 (after w1-6) | F1, B1 |
| pass | after each level, back on the map (GC'd) | Web Audio nodes (AudioHandlers) | ≤ start + 8 (19) | start 11, worst 11 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | &lt;audio> elements alive | ≤ start + 2 (4) | start 2, worst 2 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | window.__snNavLog entries | ≤ 500 | start 0, worst 16 (after w1-6) | F3 |
| pass | after each level, back on the map (GC'd) | the save's adjustLog entries | ≤ 200 | start 0, worst 0 (after start) | F1 |
| pass | on the title, untouched for 5 s | live decoded audio, MB | ≤ 2 | 0.7 MB in 2 clips | B1 |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations the compositor can't run | ≤ 2 | max 0; over in 0 of 14 samples | F1, B, C, D (by file) |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations running on hidden elements | ≤ 2 | max 0; over in 0 of 14 samples | F1, D2 (by file) |
| pass | the still map, 60 s untouched | rAF requests/s, median | ≤ 5 | 0 (max 12.8); main thread 2.1 % | F1, B1 |
| pass | a held Next (a reward), 40 s untouched, the idle nudge included | rAF requests/s, median | ≤ 5 | 4.3 (max 13.7); main thread 4.9 % | F1, F3 (nav.tsx), B1 |
| pass | phone ×4, while playing | every screen's median fps | ≥ 50 | lowest level:w1-6 (60.2) | D5 (the runner); otherwise the screen's owner |
| pass | phone ×4, the still map | main thread %, median | ≤ 5 % | 2.1 % | F1 |
| pass | phone ×4, a held Next (a reward), the idle nudge included | main thread %, median | ≤ 6 % | 4.9 % (7, 5.8, 4.1, 3.6) | F1 (the ninja), F3 (the nudge), B1 (the reward) |
| pass | phone ×4, the ninja standing still | main thread % at streak 0, mean | ≤ 6 % | 2.6 % (3.8, 1.4) | F1 |
| pass | phone ×4, the ninja standing still | main thread % at streak 10, mean | ≤ 14 % | 8.8 % (11, 6.6) | F1 |
| n/a | phone ×4, the World Flower | main thread %, median | ≤ 30 % | not measured (no World Flower visit in this run) | B2 |
| n/a | phone ×4, the World Flower | longest task, ms | ≤ 120 ms | not measured (no World Flower visit in this run) | B2 |
| pass | the strike stress (150 streak-10 strikes, 7 a second) | particles at the peak | ≤ 350 | 199 (fx nodes 76) | F1 |
| pass | 10 s after the stress | particles / fx nodes left | 0 / 0 | 0 / 0 | F1 |
| pass | the whole soak | page reloads | 0 | 0 | all |
| pass | the whole soak | levels the bot finished | all | 1 of 1 | the scene's owner (or bot.ts) |

## After each level (on the map, after a forced GC)

| metric | start | per level → | last | slope / level | budget |
|---|---|---|---|---|---|
| heapMB | 5.4 | 5.4 8.3 | 8.3 | 2.9 | ok (≤ start + 8 (13.4)) |
| nodes | 237 | 237 263 | 263 | 26 | ok (≤ start + 600 (837)) |
| detachedNodes | 76 | 76 92 | 92 | 16 |  |
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
| decodedMB | 1 | 1 12.2 | 12.2 | 11.2 | ok (≤ 64) |
| decodedTotalMB | 1 | 1 12.2 | 12.2 | 11.2 |  |
| decodedClips | 2 | 2 30 | 30 | 28 |  |
| audioHandlers | 11 | 11 11 | 11 | 0 | ok (≤ start + 8 (19)) |
| arrayBuffers | 10 | 10 38 | 38 | 28 |  |
| layoutObjects | 178 | 178 193 | 193 | 15 |  |
| navLog | 0 | 0 16 | 16 | 16 | ok (≤ 500) |
| adjustLog | 0 | 0 0 | 0 | 0 | ok (≤ 200) |
| imagesFetched | 56 | 56 59 | 59 | 3 |  |
| audioFetched | 3 | 3 32 | 32 | 29 |  |
| imgInDomMB | 18 | 18 18 | 18 | 0 |  |
| rendererRssMB | 433 | 433 665 | 665 | 232 |  |
| gpuRssMB | 83 | 83 93 | 93 | 10 |  |
| footprintMB | 84.9 | 84.9 131.4 | 131.4 | 46.5 |  |
| gpuFootprintMB | 16.7 | 16.7 15.6 | 15.6 | -1.1 |  |
| mem_blink_gc | 5.6 | 5.6 15.1 | 15.1 | 9.5 |  |
| mem_blink_objects | 2.1 | 2.1 2.9 | 2.9 | 0.8 |  |
| mem_canvas | 3.5 | 3.5 3.7 | 3.7 | 0.2 |  |
| mem_cc | 174.8 | 174.8 363.3 | 363.3 | 188.5 |  |
| mem_discardable | 198.5 | 198.5 350.3 | 350.3 | 151.8 |  |
| mem_malloc | 54.8 | 54.8 48.8 | 48.8 | -6 |  |
| mem_media | 2.4 | 2.4 2.4 | 2.4 | 0 |  |
| mem_mojo | 0 | 0 0 | 0 | 0 |  |
| mem_parkable_images | 0 | 0 0 | 0 | 0 |  |
| mem_parkable_strings | 0 | 0 0 | 0 | 0 |  |
| mem_partition_alloc | 17.1 | 17.1 51.6 | 51.6 | 34.5 |  |
| mem_shared_memory | 226.3 | 226.3 386.8 | 386.8 | 160.5 |  |
| mem_site_storage | 0 | 0 0 | 0 | 0 |  |
| mem_skia | 0.5 | 0.5 1.4 | 1.4 | 0.9 |  |
| mem_v8 | 7.2 | 7.2 10.3 | 10.3 | 3.1 |  |
| mem_web_cache | 1.3 | 1.3 1.4 | 1.4 | 0.1 |  |

## While playing (periodic samples): first half vs second half

| metric | first half | second half |
|---|---|---|
| fps | 60.2 | 59.8 |
| slowFramePct | 0 | 2.5 |
| mainThreadPct | 19.6 | 27.6 |
| scriptPct | 3 | 3 |
| stylePct | 2.3 | 4.1 |
| layoutPct | 0.4 | 0.4 |
| recalcPerSec | 62 | 66.7 |
| layoutPerSec | 7.4 | 12 |
| rendererPct | 92 | 95.5 |
| gpuPct | 15 | 17 |
| longTaskMs | 0 | 0 |
| rafPerSec | 73 | 93.5 |
| rafPerFrame | 1 | 1.9 |
| animHiddenInfinite | 0 | 0 |
| animMainThreadInfinite | 0 | 0 |
| animations | 12 | 47 |
| animInfinite | 7 | 24.5 |
| particles | 2 | 78 |
| particlesPeak | 131 | 180.5 |

## Phases (the title, the still map, a held Next, the ninja's aura, the strike stress)

| phase | what | fps | main % | style % | recalcs/s | rAF/s | renderer CPU % | GPU CPU % | particles (now / peak) | fx nodes | animations | decoded MB | Nodes | heap MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| title | the title, 5 s, untouched | 61 | 2.7 | 1.1 | 26.6 | 7.9 | 83 | 17 | 0 / 0 | 0 | 28 (21 inf, 0 main) | 0.7 | 178 | 5.2 |
| idle-map | map | 60.4 | 3.9 | 0.9 | 32.1 | 12.8 | 84 | 12 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 12.2 | 261 | 8.1 |
| idle-map | map | 60.6 | 3.8 | 0.9 | 32.3 | 12.8 | 84 | 13 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 12.2 | 275 | 8.5 |
| idle-map | map | 60.4 | 2 | 0.6 | 23.8 | 0 | 83 | 12 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 12.2 | 275 | 8.7 |
| idle-map | map | 60.2 | 2 | 0.6 | 23.7 | 0 | 83 | 12 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 12.2 | 275 | 8.3 |
| idle-map | map | 60.6 | 2 | 0.6 | 23.8 | 0 | 83 | 12 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 12.2 | 275 | 8.5 |
| idle-map | map | 60.9 | 2.1 | 0.6 | 23.8 | 0 | 83 | 12 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 12.2 | 261 | 8.1 |
| settled | after soak | 60.3 | 1.7 | 0.6 | 20.7 | 0 | 101 | 14 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 12.2 | 261 | 8.2 |
| settled | the reward (w1-6), Next ready | 60.5 | 11 | 1.4 | 52.6 | 0 | 101 | 13 | 0 / 0 | 0 | 14 (7 inf, 0 main) | 12.9 | 318 | 8.3 |
| idle-next | the reward (w1-6), a held Next, untouched | 60.7 | 7 | 0.8 | 30.5 | 13.7 | 84 | 12 | 0 / 60 | 0 | 14 (7 inf, 0 main) | 13.3 | 318 | 8.2 |
| idle-next | the reward (w1-6), a held Next, untouched | 60.5 | 5.8 | 0.9 | 30.2 | 8.6 | 83 | 12 | 0 / 0 | 0 | 14 (7 inf, 0 main) | 13.3 | 318 | 8.2 |
| idle-next | the reward (w1-6), a held Next, untouched | 60.4 | 4.1 | 0.6 | 24.8 | 0 | 83 | 12 | 0 / 0 | 0 | 14 (7 inf, 0 main) | 13.3 | 318 | 8.2 |
| idle-next | the reward (w1-6), a held Next, untouched | 60.4 | 3.6 | 0.7 | 24.9 | 0 | 83 | 12 | 0 / 0 | 0 | 14 (7 inf, 0 main) | 13.3 | 318 | 8.4 |
| aura-t0 | ninja demo, streak 0, idle | 61.1 | 3.8 | 0.7 | 27.3 | 0 | 82 | 12 | 0 / 0 | 0 | 4 (3 inf, 0 main) | 13.3 | 347 | 8.4 |
| aura-t0 | ninja demo, streak 0, idle | 60.8 | 1.4 | 0.4 | 25 | 0 | 80 | 11 | 0 / 0 | 0 | 4 (3 inf, 0 main) | 13.3 | 347 | 8.5 |
| aura-t3 | ninja demo, streak 10, idle | 60.5 | 11 | 3.1 | 34.7 | 15.1 | 86 | 17 | 0 / 99 | 0 | 60 (49 inf, 0 main) | 13.9 | 339 | 8.5 |
| aura-t3 | ninja demo, streak 10, idle | 60.2 | 6.6 | 2.6 | 24.5 | 0 | 86 | 17 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 13.9 | 329 | 8.2 |
| settled | before stress | 60.4 | 6 | 2.5 | 22.6 | 0 | 86 | 17 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 13.9 | 329 | 8.5 |
| stress | strike 1/150 | 59.7 | 22.9 | 6.4 | 61.8 | 1.8 | 92 | 17 | 26 / 0 | 3 | 66 (51 inf, 0 main) | 13.9 | 386 | 8.2 |
| stress | strike 44/150 | 60.4 | 85.4 | 10.2 | 95.3 | 128.8 | 134 | 31 | 136 / 242 | 30 | 73 (49 inf, 0 main) | 13.9 | 670 | 10 |
| stress | strike 88/150 | 61.1 | 87.9 | 10 | 96.4 | 137.2 | 136 | 31 | 162 / 222 | 16 | 69 (51 inf, 0 main) | 13.9 | 436 | 9.4 |
| stress | strike 135/150 | 59.7 | 88.1 | 10.3 | 97.9 | 130 | 137 | 32 | 160 / 213 | 30 | 75 (49 inf, 0 main) | 13.9 | 664 | 10.2 |
| stress | last strike | 61 | 78.6 | 9.8 | 90.5 | 119.3 | 131 | 29 | 117 / 218 | 6 | 65 (49 inf, 0 main) | 13.9 | 499 | 9 |
| settled | 10 s after the stress | 60.6 | 5.6 | 2.6 | 20.5 | 0 | 86 | 17 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 13.9 | 329 | 8.7 |
| settled | map after the stress | 60.3 | 6 | 1.2 | 37.6 | 26.7 | 86 | 13 | 0 / 0 | 0 | 32 (12 inf, 0 main) | 13.9 | 277 | 8.6 |

## Levels

| level | kind | secs | finished | max streak | streak at end | stuck |
|---|---|---|---|---|---|---|
| w1-6 | battle | 39 | yes | 8 | 8 |  |

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
    5
   ],
   [
    "@petal-drift-l",
    1
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
  "100ms at http://127.0.0.1:4842/assets/play-ea8S_C_A.js:2:971": 1
 },
 "mods": {
  "visemeListeners": 1,
  "bufferCache": 30,
  "captionListeners": 3,
  "clipListeners": 3,
  "sayListeners": 2,
  "music": 1,
  "speaking": 0,
  "decodedLruMB": 12.2,
  "musicDecks": 2,
  "storeListeners": 4,
  "attemptSubs": 0,
  "saveBytes": 2222,
  "adjustLog": 0,
  "poseSubs": 1,
  "particles": 0,
  "particleKinds": {},
  "glowCache": 7,
  "helpStack": 1,
  "nudgeListeners": 1,
  "uprightSubs": 1,
  "imgCache": 2,
  "fxDomChildren": 0,
  "streakListeners": 1,
  "streakSubs": 0,
  "streakN": 8,
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

