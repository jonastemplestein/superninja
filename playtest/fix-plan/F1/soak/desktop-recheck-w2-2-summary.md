# Soak after-core-desktop-waves

3 levels in one page (reloads: none), fast=2, desktop 844×390, served none from http://127.0.0.1:4401. Longest streak: 22. Page errors: 0.

## Budgets: pass

docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §11.1 and docs/PERF.md §5. "n/a": not judged on this run (the phone rows are judged only with --mobile --cpu 4; their desktop values are shown). Owners are the fix plan's lanes; an offending animation names the file that defines it.

| result | when | check | budget | measured | owner |
|---|---|---|---|---|---|
| pass | after each level, back on the map (GC'd) | DOM nodes (CDP, attached + detached) | ≤ start + 600 (765) | start 165, worst 243 (after w2-4) | all |
| pass | after each level, back on the map (GC'd) | JS heap, MB | ≤ start + 8 (12) | start 4, worst 8.2 (after w2-4) | all |
| pass | after each level, back on the map (GC'd) | event listeners | ≤ start + 40 (289) | start 249, worst 249 (after start) | all |
| pass | after each level, back on the map (GC'd) | animations on the map | ≤ start + 5 (34) | start 29, worst 29 (after start) | all |
| pass | after each level, back on the map (GC'd) | live intervals | ≤ start + 1 (2) | start 1, worst 1 (after start) | all |
| pass | after each level, back on the map (GC'd) | particles on the canvas | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | nodes in the fx layer | ≤ 0 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | rAF requests/s on the still map | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | live decoded audio, MB | ≤ 64 | start 0.9, worst 24.4 (after w2-4) | F1, B1 |
| pass | after each level, back on the map (GC'd) | Web Audio nodes (AudioHandlers) | ≤ start + 8 (19) | start 11, worst 11 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | &lt;audio> elements alive | ≤ start + 2 (4) | start 2, worst 2 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | window.__snNavLog entries | ≤ 500 | start 0, worst 18 (after w2-4) | F3 |
| pass | after each level, back on the map (GC'd) | the save's adjustLog entries | ≤ 200 | start 0, worst 0 (after start) | F1 |
| n/a | on the title, untouched for 5 s | live decoded audio, MB | ≤ 2 | not measured (--no-title, or an older run) | B1 |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations the compositor can't run | ≤ 2 | max 0; over in 0 of 54 samples | F1, B, C, D (by file) |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations running on hidden elements | ≤ 2 | max 0; over in 0 of 54 samples | F1, D2 (by file) |
| pass | the still map, 10 s untouched | rAF requests/s, median | ≤ 5 | 0 (max 0); main thread 0.7 % (desktop) | F1, B1 |
| pass | a held Next (a reward), 40 s untouched, the idle nudge included | rAF requests/s, median | ≤ 5 | 0 (max 36.6); main thread 1.7 % (desktop) | F1, F3 (nav.tsx), B1 |
| n/a | phone ×4, while playing | every screen's median fps | ≥ 50 | lowest reward:w2-4 (60.2) (not judged: desktop) | D5 (the runner); otherwise the screen's owner |
| n/a | phone ×4, the still map | main thread %, median | ≤ 5 % | 0.7 % (not judged: desktop) | F1 |
| n/a | phone ×4, a held Next (a reward), the idle nudge included | main thread %, median | ≤ 6 % | 1.7 % (1.8, 3.4, 1.5, 1.7, 3, 1.6, 1.6, 1.7, 1.6, 1.7, 1.6, 1.7, 1.6, 1.7) (not judged: desktop) | F1 (the ninja), F3 (the nudge), B1 (the reward) |
| n/a | phone ×4, the ninja standing still | main thread % at streak 0, mean | ≤ 6 % | not measured (--no-aura) | F1 |
| n/a | phone ×4, the ninja standing still | main thread % at streak 10, mean | ≤ 14 % | not measured (--no-aura) | F1 |
| n/a | phone ×4, the World Flower | main thread %, median | ≤ 30 % | 11.3 % over 4 samples (12.9, 8.5, 11, 11.5) (not judged: desktop) | B2 |
| n/a | phone ×4, the World Flower | longest task, ms | ≤ 120 ms | 0 ms (not judged: desktop) | B2 |
| n/a | the strike stress (streak-10 strikes, 7 a second) | particles at the peak | ≤ 350 | not measured (--stress 0) | F1 |
| n/a | 10 s after the stress | particles / fx nodes left | 0 / 0 | not measured (--stress 0) | F1 |
| pass | the whole soak | page reloads | 0 | 0 | all |
| pass | the whole soak | levels the bot finished | all | 3 of 3 | the scene's owner (or bot.ts) |

## After each level (on the map, after a forced GC)

| metric | start | per level → | last | slope / level | budget |
|---|---|---|---|---|---|
| heapMB | 4 | 4 6.6 7.3 8.2 | 8.2 | 1.33 | ok (≤ start + 8 (12)) |
| nodes | 165 | 165 160 233 243 | 243 | 30.7 | ok (≤ start + 600 (765)) |
| detachedNodes | 9 | 9 23 86 86 | 86 | 29.4 |  |
| attachedNodes | 156 | 156 137 147 157 | 157 | 1.3 |  |
| listeners | 249 | 249 236 238 238 | 238 | -3.1 | ok (≤ start + 40 (289)) |
| globalListeners | 17 | 17 30 30 30 | 30 | 3.9 |  |
| animations | 29 | 29 15 15 15 | 15 | -4.2 | ok (≤ start + 5 (34)) |
| animInfinite | 9 | 9 6 6 6 | 6 | -0.9 |  |
| animHiddenInfinite | 0 | 0 0 0 0 | 0 | 0 |  |
| animMainThreadInfinite | 0 | 0 0 0 0 | 0 | 0 |  |
| fxDomNodes | 0 | 0 0 0 0 | 0 | 0 | ok (≤ 0) |
| particles | 0 | 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| rafPerSec | 0 | 0 0 0 0 | 0 | 0 | ok (≤ 5) |
| intervals | 1 | 1 1 1 1 | 1 | 0 | ok (≤ start + 1 (2)) |
| pendingTimeouts | 0 | 0 0 0 0 | 0 | 0 |  |
| mediaAlive | 2 | 2 2 2 2 | 2 | 0 | ok (≤ start + 2 (4)) |
| decodedMB | 0.9 | 0.9 9 13.6 24.4 | 24.4 | 7.51 | ok (≤ 64) |
| decodedTotalMB | 0.9 | 0.9 9 13.6 24.4 | 24.4 | 7.51 |  |
| decodedClips | 2 | 2 29 48 83 | 83 | 26.2 |  |
| audioHandlers | 11 | 11 11 11 11 | 11 | 0 | ok (≤ start + 8 (19)) |
| arrayBuffers | 4 | 4 31 50 85 | 85 | 26.2 |  |
| layoutObjects | 116 | 116 98 108 118 | 118 | 1.6 |  |
| navLog | 0 | 0 4 5 18 | 18 | 5.5 | ok (≤ 500) |
| adjustLog | 0 | 0 0 0 0 | 0 | 0 | ok (≤ 200) |
| imagesFetched | 54 | 54 62 86 100 | 100 | 16.2 |  |
| audioFetched | 3 | 3 32 52 88 | 88 | 27.5 |  |
| imgInDomMB | 22.5 | 22.5 15.6 15.6 15.6 | 15.6 | -2.07 |  |
| rendererRssMB | 368 | 368 753 884 986 | 986 | 198.5 |  |
| gpuRssMB | 77 | 77 89 91 97 | 97 | 6.2 |  |
| footprintMB | 88.5 | 88.5 170.1 175.5 260.8 | 260.8 | 52.23 |  |
| gpuFootprintMB | 14.2 | 14.2 16 14.5 15.1 | 15.1 | 0.12 |  |
| mem_blink_gc | 5.1 | 5.1 15.3 18.2 26.6 | 26.6 | 6.74 |  |
| mem_blink_objects | 1.6 | 1.6 2.3 2.6 2.8 | 2.8 | 0.39 |  |
| mem_canvas | 3.5 | 3.5 3.7 3.7 3.7 | 3.7 | 0.06 |  |
| mem_cc | 135.3 | 135.3 417.3 512.3 527.8 | 527.8 | 127.25 |  |
| mem_discardable | 134.3 | 134.3 409.5 505.7 508.9 | 508.9 | 122 |  |
| mem_malloc | 48.7 | 48.7 67.4 55.1 64.5 | 64.5 | 3.51 |  |
| mem_media | 2.4 | 2.4 2.4 2.4 2.4 | 2.4 | 0 |  |
| mem_mojo | 0 | 0 0 0 0 | 0 | 0 |  |
| mem_parkable_images | 0 | 0 0 0 0 | 0 | 0 |  |
| mem_parkable_strings | 0 | 0 0 0 0 | 0 | 0 |  |
| mem_partition_alloc | 31.7 | 31.7 85.4 92.2 166 | 166 | 40.97 |  |
| mem_shared_memory | 164.9 | 164.9 447.5 534.8 552.5 | 552.5 | 125.01 |  |
| mem_site_storage | 0 | 0 0 0 0 | 0 | 0 |  |
| mem_skia | 0.2 | 0.2 1.2 1.8 1.5 | 1.5 | 0.45 |  |
| mem_v8 | 6.3 | 6.3 9.3 10.1 11.2 | 11.2 | 1.55 |  |
| mem_web_cache | 1.1 | 1.1 0.9 2.4 1.9 | 1.9 | 0.39 |  |

## While playing (periodic samples): first half vs second half

| metric | first half | second half |
|---|---|---|
| fps | 60.8 | 60.6 |
| slowFramePct | 0 | 0 |
| mainThreadPct | 13 | 10.6 |
| scriptPct | 1.9 | 1 |
| stylePct | 0.7 | 1.5 |
| layoutPct | 0.1 | 0.2 |
| recalcPerSec | 68.5 | 66.4 |
| layoutPerSec | 9 | 17 |
| rendererPct | 22.8 | 27.4 |
| gpuPct | 24.6 | 21.7 |
| longTaskMs | 0 | 0 |
| rafPerSec | 108.7 | 95.3 |
| rafPerFrame | 1.6 | 1.3 |
| animHiddenInfinite | 0 | 0 |
| animMainThreadInfinite | 0 | 0 |
| animations | 20.8 | 86.3 |
| animInfinite | 12.9 | 70.7 |
| particles | 41.9 | 35.6 |
| particlesPeak | 111.6 | 146.2 |

## Phases (the title, the still map, a held Next, the ninja's aura, the strike stress)

| phase | what | fps | main % | style % | recalcs/s | rAF/s | renderer CPU % | GPU CPU % | particles (now / peak) | fx nodes | animations | decoded MB | Nodes | heap MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| idle-map | map | 60.2 | 0.7 | 0.2 | 30.5 | 0 | 4 | 8 | 0 / 0 | 0 | 15 (6 inf, 0 main) | 24.4 | 243 | 8.3 |
| idle-map | map | 61 | 0.9 | 0.2 | 30.5 | 0 | 5 | 8 | 0 / 0 | 0 | 15 (6 inf, 0 main) | 24.4 | 243 | 8.1 |
| idle-map | map | 60.2 | 0.7 | 0.2 | 30.2 | 0 | 4 | 8 | 0 / 0 | 0 | 15 (6 inf, 0 main) | 24.4 | 243 | 8.2 |
| idle-map | map | 61 | 0.7 | 0.2 | 30.3 | 0 | 4 | 8 | 0 / 0 | 0 | 15 (6 inf, 0 main) | 24.4 | 243 | 8.3 |
| settled | after soak | 60.9 | 0.6 | 0.1 | 20.3 | 0 | 3 | 7 | 0 / 0 | 0 | 15 (6 inf, 0 main) | 24.4 | 243 | 8.2 |
| settled | the reward (w2-4), Next ready | 60.6 | 3.6 | 0.5 | 60 | 0 | 10 | 11 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 24.4 | 338 | 8.3 |
| idle-next | the reward (w2-4), a held Next, untouched | 60.8 | 1.8 | 0.3 | 34.6 | 0 | 6 | 10 | 0 / 0 | 0 | 16 (8 inf, 0 main) | 24.4 | 341 | 8.2 |
| idle-next | the reward (w2-4), a held Next, untouched | 60.9 | 3.4 | 0.4 | 46.6 | 36.6 | 9 | 11 | 0 / 56 | 0 | 16 (8 inf, 0 main) | 24.8 | 351 | 8.2 |
| idle-next | the reward (w2-4), a held Next, untouched | 60.2 | 1.5 | 0.3 | 29.9 | 0 | 5 | 11 | 0 / 0 | 0 | 16 (8 inf, 0 main) | 24.8 | 351 | 8.4 |
| idle-next | the reward (w2-4), a held Next, untouched | 61 | 1.7 | 0.3 | 32.2 | 0 | 6 | 11 | 0 / 0 | 0 | 16 (8 inf, 0 main) | 24.8 | 341 | 8.2 |
| idle-next | the reward (w2-4), a held Next, untouched | 60.8 | 3 | 0.4 | 45.7 | 22.8 | 8 | 11 | 0 / 0 | 0 | 16 (8 inf, 0 main) | 24.8 | 341 | 8.2 |
| idle-next | the reward (w2-4), a held Next, untouched | 60.3 | 1.6 | 0.3 | 31.6 | 0 | 5 | 11 | 0 / 0 | 0 | 16 (8 inf, 0 main) | 24.8 | 341 | 8.3 |
| idle-next | the reward (w2-4), a held Next, untouched | 60.2 | 1.6 | 0.3 | 31.7 | 0 | 5 | 11 | 0 / 0 | 0 | 16 (8 inf, 0 main) | 24.8 | 341 | 8.5 |
| idle-next | the reward (w2-4), a held Next, untouched | 60.9 | 1.7 | 0.3 | 31.5 | 0 | 6 | 11 | 0 / 0 | 0 | 16 (8 inf, 0 main) | 24.8 | 341 | 8.2 |
| idle-next | the reward (w2-4), a held Next, untouched | 60.4 | 1.6 | 0.3 | 31.6 | 0 | 5 | 11 | 0 / 0 | 0 | 16 (8 inf, 0 main) | 24.8 | 341 | 8.4 |
| idle-next | the reward (w2-4), a held Next, untouched | 61.1 | 1.7 | 0.3 | 30 | 0 | 5 | 11 | 0 / 0 | 0 | 16 (8 inf, 0 main) | 24.8 | 341 | 8.2 |
| idle-next | the reward (w2-4), a held Next, untouched | 60.1 | 1.6 | 0.3 | 30.5 | 0 | 5 | 11 | 0 / 0 | 0 | 16 (8 inf, 0 main) | 24.8 | 341 | 8.4 |
| idle-next | the reward (w2-4), a held Next, untouched | 60.1 | 1.7 | 0.3 | 32 | 0 | 5 | 11 | 0 / 0 | 0 | 16 (8 inf, 0 main) | 24.8 | 341 | 8.2 |
| idle-next | the reward (w2-4), a held Next, untouched | 61 | 1.6 | 0.3 | 31.2 | 0 | 5 | 11 | 0 / 0 | 0 | 16 (8 inf, 0 main) | 24.8 | 341 | 8.4 |
| idle-next | the reward (w2-4), a held Next, untouched | 61 | 1.7 | 0.3 | 31.5 | 0 | 5 | 10 | 0 / 0 | 0 | 16 (8 inf, 0 main) | 24.8 | 341 | 8.2 |

## Levels

| level | kind | secs | finished | max streak | streak at end | stuck |
|---|---|---|---|---|---|---|
| w2-2 | battle | 36 | yes | 12 | 12 |  |
| w2-3 | run | 47 | yes | 18 | 18 |  |
| w2-4 | dojo | 75 | yes | 22 | 15 |  |

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
  "bufferCache": 83,
  "captionListeners": 3,
  "clipListeners": 0,
  "sayListeners": 1,
  "music": 1,
  "speaking": 0,
  "decodedLruMB": 24.4,
  "musicDecks": 2,
  "storeListeners": 4,
  "attemptSubs": 0,
  "saveBytes": 2766,
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
  "streakN": 15,
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

