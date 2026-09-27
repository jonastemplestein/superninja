# Soak after-core-phone-gems

3 levels in one page (reloads: none), fast=2, phone emulation (844×390, DPR 3), CPU throttled 4×, served none from http://127.0.0.1:4401. Longest streak: 29. Page errors: 0.

## Budgets: **FAIL** (3: idleNextMain, flowerMain, flowerTask)

docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §11.1 and docs/PERF.md §5. "n/a": not judged on this run. Owners are the fix plan's lanes; an offending animation names the file that defines it.

| result | when | check | budget | measured | owner |
|---|---|---|---|---|---|
| pass | after each level, back on the map (GC'd) | DOM nodes (CDP, attached + detached) | ≤ start + 600 (765) | start 165, worst 217 (after w1-8) | all |
| pass | after each level, back on the map (GC'd) | JS heap, MB | ≤ start + 8 (12) | start 4, worst 8.1 (after w1-8) | all |
| pass | after each level, back on the map (GC'd) | event listeners | ≤ start + 40 (289) | start 249, worst 275 (after w1-6) | all |
| pass | after each level, back on the map (GC'd) | animations on the map | ≤ start + 5 (34) | start 29, worst 29 (after start) | all |
| pass | after each level, back on the map (GC'd) | live intervals | ≤ start + 1 (2) | start 1, worst 1 (after start) | all |
| pass | after each level, back on the map (GC'd) | particles on the canvas | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | nodes in the fx layer | ≤ 0 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | rAF requests/s on the still map | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | live decoded audio, MB | ≤ 64 | start 0.9, worst 31 (after w1-8) | F1, B1 |
| pass | after each level, back on the map (GC'd) | Web Audio nodes (AudioHandlers) | ≤ start + 8 (19) | start 11, worst 11 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | &lt;audio> elements alive | ≤ start + 2 (4) | start 2, worst 2 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | window.__snNavLog entries | ≤ 500 | start 0, worst 12 (after w1-8) | F3 |
| pass | after each level, back on the map (GC'd) | the save's adjustLog entries | ≤ 200 | start 0, worst 0 (after start) | F1 |
| n/a | on the title, untouched for 5 s | live decoded audio, MB | ≤ 2 | not measured (--no-title, or an older run) | B1 |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations the compositor can't run | ≤ 2 | max 0; over in 0 of 57 samples | F1, B, C, D (by file) |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations running on hidden elements | ≤ 2 | max 0; over in 0 of 57 samples | F1, D2 (by file) |
| pass | the still map, 10 s untouched | rAF requests/s, median | ≤ 5 | 0 (max 0); main thread 2.5 % | F1, B1 |
| pass | a held Next (a reward), 40 s untouched, the idle nudge included | rAF requests/s, median | ≤ 5 | 0 (max 36.2); main thread 6.6 % | F1, F3 (nav.tsx), B1 |
| pass | phone ×4, while playing | every screen's median fps | ≥ 50 | lowest tree (60.4) | D5 (the runner); otherwise the screen's owner |
| pass | phone ×4, the still map | main thread %, median | ≤ 5 % | 2.5 % | F1 |
| **FAIL** | phone ×4, a held Next (a reward), the idle nudge included | main thread %, median | ≤ 6 % | 6.6 % (6.8, 14, 6.6, 6.2, 12.3, 6.3, 6.6, 6.7, 6.5, 6.9, 6.1, 6.5, 6.4, 6.4) | F1 (the ninja), F3 (the nudge), B1 (the reward) |
| n/a | phone ×4, the ninja standing still | main thread % at streak 0, mean | ≤ 6 % | not measured (--no-aura) | F1 |
| n/a | phone ×4, the ninja standing still | main thread % at streak 10, mean | ≤ 14 % | not measured (--no-aura) | F1 |
| **FAIL** | phone ×4, the World Flower | main thread %, median | ≤ 30 % | 44.1 % over 2 samples (54, 34.2) | B2 |
| **FAIL** | phone ×4, the World Flower | longest task, ms | ≤ 120 ms | 136 ms | B2 |
| n/a | the strike stress (streak-10 strikes, 7 a second) | particles at the peak | ≤ 350 | not measured (--stress 0) | F1 |
| n/a | 10 s after the stress | particles / fx nodes left | 0 / 0 | not measured (--stress 0) | F1 |
| pass | the whole soak | page reloads | 0 | 0 | all |
| pass | the whole soak | levels the bot finished | all | 3 of 3 | the scene's owner (or bot.ts) |

## After each level (on the map, after a forced GC)

| metric | start | per level → | last | slope / level | budget |
|---|---|---|---|---|---|
| heapMB | 4 | 4 6.6 7.7 8.1 | 8.1 | 1.34 | ok (≤ start + 8 (12)) |
| nodes | 165 | 165 190 207 217 | 217 | 17.3 | ok (≤ start + 600 (765)) |
| detachedNodes | 9 | 9 24 31 31 | 31 | 7.3 |  |
| attachedNodes | 156 | 156 166 176 186 | 186 | 10 |  |
| listeners | 249 | 249 275 275 275 | 275 | 7.8 | ok (≤ start + 40 (289)) |
| globalListeners | 17 | 17 30 30 30 | 30 | 3.9 |  |
| animations | 29 | 29 29 29 29 | 29 | 0 | ok (≤ start + 5 (34)) |
| animInfinite | 9 | 9 9 9 9 | 9 | 0 |  |
| animHiddenInfinite | 0 | 0 0 0 0 | 0 | 0 |  |
| animMainThreadInfinite | 0 | 0 0 0 0 | 0 | 0 |  |
| fxDomNodes | 0 | 0 0 0 0 | 0 | 0 | ok (≤ 0) |
| particles | 0 | 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| rafPerSec | 0 | 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| intervals | 1 | 1 1 1 1 | 1 | 0 | ok (≤ start + 1 (2)) |
| pendingTimeouts | 0 | 0 0 0 0 | 0 | 0 |  |
| mediaAlive | 2 | 2 2 2 2 | 2 | 0 | ok (≤ start + 2 (4)) |
| decodedMB | 0.9 | 0.9 9.2 24.8 31 | 31 | 10.59 | ok (≤ 64) |
| decodedTotalMB | 0.9 | 0.9 9.2 24.8 31 | 31 | 10.59 |  |
| decodedClips | 2 | 2 26 74 89 | 89 | 30.9 |  |
| audioHandlers | 11 | 11 11 11 11 | 11 | 0 | ok (≤ start + 8 (19)) |
| arrayBuffers | 4 | 4 28 76 91 | 91 | 30.9 |  |
| layoutObjects | 116 | 116 129 145 155 | 155 | 13.3 |  |
| navLog | 0 | 0 4 11 12 | 12 | 4.3 | ok (≤ 500) |
| adjustLog | 0 | 0 0 0 0 | 0 | 0 | ok (≤ 200) |
| imagesFetched | 54 | 54 56 67 69 | 69 | 5.6 |  |
| audioFetched | 3 | 3 28 78 93 | 93 | 32 |  |
| imgInDomMB | 22.5 | 22.5 22.5 22.5 22.5 | 22.5 | 0 |  |
| rendererRssMB | 424 | 424 754 951 1003 | 1003 | 193.4 |  |
| gpuRssMB | 75 | 75 90 106 106 | 106 | 10.9 |  |
| footprintMB | 93.8 | 93.8 165.5 219.7 257.5 | 257.5 | 54.53 |  |
| gpuFootprintMB | 14.8 | 14.8 16.9 16.3 16.4 | 16.4 | 0.42 |  |
| mem_blink_gc | 4.9 | 4.9 17.3 25.8 34.6 | 34.6 | 9.76 |  |
| mem_blink_objects | 1.7 | 1.7 2.5 2.7 3.3 | 3.3 | 0.5 |  |
| mem_canvas | 3.5 | 3.5 3.7 3.7 3.7 | 3.7 | 0.06 |  |
| mem_cc | 184.8 | 184.8 409 532.7 520.2 | 520.2 | 112.99 |  |
| mem_discardable | 185.8 | 185.8 402.1 513.6 513.8 | 513.8 | 109.55 |  |
| mem_malloc | 53.8 | 53.8 71.2 62.3 65.9 | 65.9 | 2.74 |  |
| mem_media | 2.4 | 2.4 2.4 2.4 2.4 | 2.4 | 0 |  |
| mem_mojo | 0 | 0 0 0 0 | 0 | 0 |  |
| mem_parkable_images | 0 | 0 0 0 0 | 0 | 0 |  |
| mem_parkable_strings | 0 | 0 0 0 0 | 0 | 0 |  |
| mem_partition_alloc | 32.5 | 32.5 74.3 124.2 160.5 | 160.5 | 43.39 |  |
| mem_shared_memory | 213.6 | 213.6 439.9 561.3 551.5 | 551.5 | 113.51 |  |
| mem_site_storage | 0 | 0 0 0 0 | 0 | 0 |  |
| mem_skia | 0.3 | 0.3 1.3 3.9 8.9 | 8.9 | 2.84 |  |
| mem_v8 | 6.3 | 6.3 9.1 10.5 10.9 | 10.9 | 1.52 |  |
| mem_web_cache | 1.2 | 1.2 1.2 1.2 1.2 | 1.2 | 0 |  |

## While playing (periodic samples): first half vs second half

| metric | first half | second half |
|---|---|---|
| fps | 60.6 | 60.7 |
| slowFramePct | 0 | 0 |
| mainThreadPct | 31 | 40 |
| scriptPct | 2.6 | 3 |
| stylePct | 5.6 | 7.7 |
| layoutPct | 0.4 | 0.6 |
| recalcPerSec | 63.5 | 64.8 |
| layoutPerSec | 9.5 | 13 |
| rendererPct | 98.4 | 103.2 |
| gpuPct | 21.5 | 22.6 |
| longTaskMs | 0 | 6.8 |
| rafPerSec | 78.9 | 78.3 |
| rafPerFrame | 1.1 | 1.2 |
| animHiddenInfinite | 0 | 0 |
| animMainThreadInfinite | 0 | 0 |
| animations | 54.8 | 88.9 |
| animInfinite | 42.2 | 67.5 |
| particles | 5.6 | 15.3 |
| particlesPeak | 77.3 | 97.8 |

## Phases (the title, the still map, a held Next, the ninja's aura, the strike stress)

| phase | what | fps | main % | style % | recalcs/s | rAF/s | renderer CPU % | GPU CPU % | particles (now / peak) | fx nodes | animations | decoded MB | Nodes | heap MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| idle-map | map | 60.2 | 2.4 | 0.7 | 30.3 | 0 | 83 | 12 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 31 | 217 | 8.2 |
| idle-map | map | 60.8 | 2.7 | 0.7 | 30.2 | 0 | 84 | 12 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 31 | 217 | 8 |
| idle-map | map | 61.1 | 2.5 | 0.6 | 30.5 | 0 | 83 | 13 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 31 | 217 | 8.1 |
| idle-map | map | 60.9 | 2.5 | 0.6 | 30.4 | 0 | 83 | 12 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 31 | 217 | 8.2 |
| settled | after soak | 61 | 1.2 | 0.2 | 19.8 | 0 | 82 | 11 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 31 | 217 | 8.1 |
| settled | the reward (w1-8), Next ready | 61 | 14.2 | 2.5 | 62.4 | 0 | 88 | 10 | 0 / 0 | 0 | 18 (9 inf, 0 main) | 31 | 277 | 8.1 |
| idle-next | the reward (w1-8), a held Next, untouched | 60.3 | 6.8 | 1.4 | 31.3 | 0 | 85 | 10 | 0 / 0 | 0 | 18 (10 inf, 0 main) | 31 | 280 | 8 |
| idle-next | the reward (w1-8), a held Next, untouched | 60.8 | 14 | 2 | 42.9 | 36.2 | 89 | 12 | 0 / 57 | 0 | 18 (10 inf, 0 main) | 31.4 | 304 | 8.1 |
| idle-next | the reward (w1-8), a held Next, untouched | 60.8 | 6.6 | 1.2 | 26.7 | 0 | 85 | 11 | 0 / 0 | 0 | 20 (10 inf, 0 main) | 31.4 | 280 | 8 |
| idle-next | the reward (w1-8), a held Next, untouched | 60.6 | 6.2 | 1.3 | 28.3 | 0 | 84 | 11 | 0 / 0 | 0 | 18 (10 inf, 0 main) | 31.4 | 280 | 8.1 |
| idle-next | the reward (w1-8), a held Next, untouched | 60.6 | 12.3 | 2.2 | 46.1 | 22.8 | 86 | 11 | 0 / 0 | 0 | 18 (10 inf, 0 main) | 31.4 | 292 | 8 |
| idle-next | the reward (w1-8), a held Next, untouched | 60.3 | 6.3 | 1.2 | 28.1 | 0 | 85 | 11 | 0 / 0 | 0 | 18 (10 inf, 0 main) | 31.4 | 280 | 8 |
| idle-next | the reward (w1-8), a held Next, untouched | 60.2 | 6.6 | 1.3 | 31 | 0 | 84 | 11 | 0 / 0 | 0 | 18 (10 inf, 0 main) | 31.4 | 280 | 8.1 |
| idle-next | the reward (w1-8), a held Next, untouched | 60.8 | 6.7 | 1.3 | 29 | 0 | 85 | 11 | 0 / 0 | 0 | 18 (10 inf, 0 main) | 31.4 | 280 | 8 |
| idle-next | the reward (w1-8), a held Next, untouched | 61 | 6.5 | 1.4 | 30.8 | 0 | 84 | 11 | 0 / 0 | 0 | 18 (10 inf, 0 main) | 31.4 | 280 | 8.1 |
| idle-next | the reward (w1-8), a held Next, untouched | 60.3 | 6.9 | 1.4 | 29.8 | 0 | 85 | 11 | 0 / 0 | 0 | 20 (10 inf, 0 main) | 31.4 | 280 | 7.9 |
| idle-next | the reward (w1-8), a held Next, untouched | 60.2 | 6.1 | 1.4 | 30 | 0 | 84 | 11 | 0 / 0 | 0 | 18 (10 inf, 0 main) | 31.4 | 280 | 7.9 |
| idle-next | the reward (w1-8), a held Next, untouched | 60.3 | 6.5 | 1.4 | 30.5 | 0 | 84 | 11 | 0 / 0 | 0 | 20 (10 inf, 0 main) | 31.4 | 280 | 8.1 |
| idle-next | the reward (w1-8), a held Next, untouched | 61 | 6.4 | 1.4 | 30.3 | 0 | 84 | 11 | 0 / 0 | 0 | 18 (10 inf, 0 main) | 31.4 | 280 | 7.9 |
| idle-next | the reward (w1-8), a held Next, untouched | 60.3 | 6.4 | 1.5 | 31.5 | 0 | 83 | 11 | 0 / 0 | 0 | 18 (10 inf, 0 main) | 31.4 | 280 | 8 |

## Levels

| level | kind | secs | finished | max streak | streak at end | stuck |
|---|---|---|---|---|---|---|
| w1-6 | battle | 36 | yes | 10 | 10 |  |
| w1-7 | soundhunt | 82 | yes | 17 | 17 |  |
| w1-8 | swap | 52 | yes | 29 | 29 |  |

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
    "@drift",
    6
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
  "100ms at http://127.0.0.1:4401/assets/play-lRHVmce6.js:1:971": 1
 },
 "mods": {
  "visemeListeners": 1,
  "bufferCache": 89,
  "captionListeners": 3,
  "clipListeners": 0,
  "sayListeners": 1,
  "music": 1,
  "speaking": 0,
  "decodedLruMB": 31,
  "musicDecks": 2,
  "storeListeners": 4,
  "attemptSubs": 0,
  "saveBytes": 1713,
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
  "streakN": 29,
  "owned": 0,
  "ownedConnected": 0,
  "busy": 0,
  "spotMounted": 0,
  "moveRunning": 0,
  "spotGen": 7,
  "navStack": 1,
  "navSubs": 2,
  "nudgeSubs": 0,
  "holds": 0,
  "narrateSubs": 0
 }
}
```

