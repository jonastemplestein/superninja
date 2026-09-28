# Soak soak-phone-w5

5 levels in one page (reloads: none), fast=2, phone emulation (844×390, DPR 3), CPU throttled 4×, served prod from http://127.0.0.1:4843 (snapshot built 2026-09-27T11:44:55.652Z). Longest streak: 41. Page errors: 0.

## Budgets: **FAIL** (2: fps, flowerMain)

docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §11.1 and docs/PERF.md §5. "n/a": not judged on this run. Owners are the fix plan's lanes; an offending animation names the file that defines it.

| result | when | check | budget | measured | owner |
|---|---|---|---|---|---|
| pass | after each level, back on the map (GC'd) | DOM nodes (CDP, attached + detached) | ≤ start + 600 (806) | start 206, worst 350 (after w5-8) | all |
| pass | after each level, back on the map (GC'd) | JS heap, MB | ≤ start + 8 (13.4) | start 5.4, worst 11.2 (after w5-8) | all |
| pass | after each level, back on the map (GC'd) | event listeners | ≤ start + 40 (292) | start 252, worst 252 (after start) | all |
| pass | after each level, back on the map (GC'd) | animations on the map | ≤ start + 5 (34) | start 29, worst 29 (after start) | all |
| pass | after each level, back on the map (GC'd) | live intervals | ≤ start + 1 (2) | start 1, worst 1 (after start) | all |
| pass | after each level, back on the map (GC'd) | particles on the canvas | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | nodes in the fx layer | ≤ 0 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | rAF requests/s on the still map | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | live decoded audio, MB | ≤ 64 | start 1, worst 39.9 (after w5-7) | F1, B1 |
| pass | after each level, back on the map (GC'd) | Web Audio nodes (AudioHandlers) | ≤ start + 8 (19) | start 11, worst 11 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | &lt;audio> elements alive | ≤ start + 2 (4) | start 2, worst 2 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | window.__snNavLog entries | ≤ 500 | start 0, worst 128 (after w5-8) | F3 |
| pass | after each level, back on the map (GC'd) | the save's adjustLog entries | ≤ 200 | start 0, worst 0 (after start) | F1 |
| n/a | on the title, untouched for 5 s | live decoded audio, MB | ≤ 2 | not measured (--no-title, or an older run) | B1 |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations the compositor can't run | ≤ 2 | max 0; over in 0 of 30 samples | F1, B, C, D (by file) |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations running on hidden elements | ≤ 2 | max 0; over in 0 of 30 samples | F1, D2 (by file) |
| pass | the still map, 20 s untouched | rAF requests/s, median | ≤ 5 | 0 (max 0); main thread 1.6 % | F1, B1 |
| n/a | a held Next (a reward), 0 s untouched, the idle nudge included | rAF requests/s, median | ≤ 5 | not measured (--idle-next 0, or an older run) | F1, F3 (nav.tsx), B1 |
| **FAIL** | phone ×4, while playing | every screen's median fps | ≥ 50 | under on tree (48.9) | D5 (the runner); otherwise the screen's owner |
| pass | phone ×4, the still map | main thread %, median | ≤ 5 % | 1.6 % | F1 |
| n/a | phone ×4, a held Next (a reward), the idle nudge included | main thread %, median | ≤ 6 % | not measured (--idle-next 0, or an older run) | F1 (the ninja), F3 (the nudge), B1 (the reward) |
| n/a | phone ×4, the ninja standing still | main thread % at streak 0, mean | ≤ 6 % | not measured (--no-aura) | F1 |
| n/a | phone ×4, the ninja standing still | main thread % at streak 10, mean | ≤ 14 % | not measured (--no-aura) | F1 |
| **FAIL** | phone ×4, the World Flower | main thread %, median | ≤ 30 % | 41.1 % over 2 samples (39, 43.2) | B2 |
| pass | phone ×4, the World Flower | longest task, ms | ≤ 120 ms | 79 ms | B2 |
| n/a | the strike stress (streak-10 strikes, 7 a second) | particles at the peak | ≤ 350 | not measured (--stress 0) | F1 |
| n/a | 10 s after the stress | particles / fx nodes left | 0 / 0 | not measured (--stress 0) | F1 |
| pass | the whole soak | page reloads | 0 | 0 | all |
| pass | the whole soak | levels the bot finished | all | 5 of 5 | the scene's owner (or bot.ts) |

## After each level (on the map, after a forced GC)

| metric | start | per level → | last | slope / level | budget |
|---|---|---|---|---|---|
| heapMB | 5.4 | 5.4 8.3 9.1 10.6 11.1 11.2 | 11.2 | 1.11 | ok (≤ start + 8 (13.4)) |
| nodes | 206 | 206 202 283 330 340 350 | 350 | 33.74 | ok (≤ start + 600 (806)) |
| detachedNodes | 45 | 45 54 125 162 162 162 | 162 | 27.03 |  |
| attachedNodes | 161 | 161 148 158 168 178 188 | 188 | 6.71 |  |
| listeners | 252 | 252 247 249 249 249 249 | 249 | -0.26 | ok (≤ start + 40 (292)) |
| globalListeners | 20 | 20 32 32 32 32 32 | 32 | 1.71 |  |
| animations | 29 | 29 18 18 18 18 18 | 18 | -1.57 | ok (≤ start + 5 (34)) |
| animInfinite | 9 | 9 6 6 6 6 6 | 6 | -0.43 |  |
| animHiddenInfinite | 0 | 0 0 0 0 0 0 | 0 | 0 |  |
| animMainThreadInfinite | 0 | 0 0 0 0 0 0 | 0 | 0 |  |
| fxDomNodes | 0 | 0 0 0 0 0 0 | 0 | 0 | ok (≤ 0) |
| particles | 0 | 0 0 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| rafPerSec | 0 | 0 0 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| intervals | 1 | 1 1 1 1 1 1 | 1 | 0 | ok (≤ start + 1 (2)) |
| pendingTimeouts | 1 | 1 0 0 0 0 0 | 0 | -0.14 |  |
| mediaAlive | 2 | 2 2 2 2 2 2 | 2 | 0 | ok (≤ start + 2 (4)) |
| decodedMB | 1 | 1 16.4 24.6 39.6 39.9 39.4 | 39.4 | 7.93 | ok (≤ 64) |
| decodedTotalMB | 1 | 1 16.4 24.6 55.6 65 73.9 | 73.9 | 15.47 |  |
| decodedClips | 2 | 2 43 72 108 112 119 | 119 | 23.66 |  |
| audioHandlers | 11 | 11 11 11 11 11 11 | 11 | 0 | ok (≤ start + 8 (19)) |
| arrayBuffers | 10 | 10 51 80 116 120 127 | 127 | 23.66 |  |
| layoutObjects | 147 | 147 135 145 186 196 206 | 206 | 14.83 |  |
| navLog | 0 | 0 31 53 91 109 128 | 128 | 26.06 | ok (≤ 500) |
| adjustLog | 0 | 0 0 0 0 0 0 | 0 | 0 | ok (≤ 200) |
| imagesFetched | 56 | 56 70 92 115 117 118 | 118 | 13.54 |  |
| audioFetched | 3 | 3 45 75 151 173 188 | 188 | 39.57 |  |
| imgInDomMB | 18 | 18 13.4 13.4 13.4 13.4 13.4 | 13.4 | -0.66 |  |
| rendererRssMB | 319 | 319 703 891 1020 1072 1095 | 1095 | 146.17 |  |
| gpuRssMB | 74 | 74 89 93 94 95 95 | 95 | 3.54 |  |
| footprintMB | 78.1 | 78.1 138.2 173.6 268.6 285.4 294.9 | 294.9 | 46.3 |  |
| gpuFootprintMB | 14.3 | 14.3 14.5 14.6 14.8 15.6 15.7 | 15.7 | 0.3 |  |
| mem_blink_gc | 4.7 | 4.7 15.9 20.2 31.9 43.1 44.5 | 44.5 | 8.35 |  |
| mem_blink_objects | 1.9 | 1.9 2.8 3.5 4.2 4.3 4.2 | 4.2 | 0.48 |  |
| mem_canvas | 3.5 | 3.5 3.6 3.8 3.8 3.8 3.8 | 3.8 | 0.06 |  |
| mem_cc | 104.3 | 104.3 397 512 524.8 519.2 508.8 | 508.8 | 68.63 |  |
| mem_discardable | 107.2 | 107.2 385.2 499.6 511.5 515.3 511.4 | 511.4 | 69.23 |  |
| mem_malloc | 48.7 | 48.7 47.5 54.2 79.7 72.6 78.7 | 78.7 | 7.17 |  |
| mem_media | 2.4 | 2.4 2.3 2.3 2.3 2.3 2.3 | 2.3 | -0.01 |  |
| mem_mojo | 0 | 0 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_images | 0 | 0 0 0 0 0 0 | 0 | 0 |  |
| mem_parkable_strings | 0 | 0 0 0 0 0 0 | 0 | 0 |  |
| mem_partition_alloc | 16.5 | 16.5 60.1 84.6 149.4 169.8 185.9 | 185.9 | 35.45 |  |
| mem_shared_memory | 131 | 131 421.3 536 552.5 551.5 548.2 | 548.2 | 71.23 |  |
| mem_site_storage | 0 | 0 0 0 0 0 0 | 0 | 0 |  |
| mem_skia | 0.3 | 0.3 2.1 2.2 2.7 2.9 3.4 | 3.4 | 0.53 |  |
| mem_v8 | 7.3 | 7.3 10.6 11.6 13.2 13.8 13.9 | 13.9 | 1.26 |  |
| mem_web_cache | 1.3 | 1.3 1.2 2.6 2.2 2 2 | 2 | 0.16 |  |

## While playing (periodic samples): first half vs second half

| metric | first half | second half |
|---|---|---|
| fps | 60.2 | 58.3 |
| slowFramePct | 0.4 | 1.6 |
| mainThreadPct | 41.3 | 43.4 |
| scriptPct | 4.4 | 3.8 |
| stylePct | 4.3 | 7.6 |
| layoutPct | 0.3 | 0.6 |
| recalcPerSec | 62.6 | 64.6 |
| layoutPerSec | 8.4 | 13.2 |
| rendererPct | 97.6 | 102.2 |
| gpuPct | 18.8 | 30.7 |
| longTaskMs | 49.6 | 40.4 |
| rafPerSec | 90.5 | 86.2 |
| rafPerFrame | 1.5 | 1.3 |
| animHiddenInfinite | 0 | 0 |
| animMainThreadInfinite | 0 | 0 |
| animations | 38 | 69.8 |
| animInfinite | 24.5 | 45.6 |
| particles | 16.6 | 34.2 |
| particlesPeak | 105 | 141.1 |

## Phases (the title, the still map, a held Next, the ninja's aura, the strike stress)

| phase | what | fps | main % | style % | recalcs/s | rAF/s | renderer CPU % | GPU CPU % | particles (now / peak) | fx nodes | animations | decoded MB | Nodes | heap MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| idle-map | map | 60.2 | 1.7 | 0.4 | 23.7 | 0 | 83 | 6 | 0 / 0 | 0 | 18 (6 inf, 0 main) | 39.4 | 350 | 11.1 |
| idle-map | map | 60.3 | 1.5 | 0.4 | 23.7 | 0 | 82 | 6 | 0 / 0 | 0 | 18 (6 inf, 0 main) | 39.4 | 350 | 11.2 |
| settled | after soak | 60.9 | 1.8 | 0.4 | 20.3 | 0 | 83 | 7 | 0 / 0 | 0 | 18 (6 inf, 0 main) | 39.4 | 350 | 11.2 |

## Levels

| level | kind | secs | finished | max streak | streak at end | stuck |
|---|---|---|---|---|---|---|
| w5-4 | swap | 62 | yes | 8 | 8 |  |
| w5-5 | run | 53 | yes | 14 | 14 |  |
| w5-6 | dojo | 130 | yes | 34 | 34 |  |
| w5-7 | battle | 51 | yes | 41 | 6 |  |
| w5-8 | swap | 52 | yes | 16 | 16 |  |

## Last boundary: what is still running

```
{
 "animations": {
  "total": 18,
  "running": 6,
  "infinite": 6,
  "hiddenInfinite": 0,
  "mainThreadInfinite": 0,
  "finishedKept": 12,
  "top": [
   [
    "@popin",
    11
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
  "100ms at http://127.0.0.1:4843/assets/play-CV59cowx.js:2:971": 1
 },
 "mods": {
  "visemeListeners": 1,
  "bufferCache": 119,
  "captionListeners": 3,
  "clipListeners": 3,
  "sayListeners": 2,
  "music": 1,
  "speaking": 0,
  "decodedLruMB": 39.4,
  "musicDecks": 2,
  "storeListeners": 4,
  "attemptSubs": 0,
  "saveBytes": 8433,
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
  "streakN": 16,
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

