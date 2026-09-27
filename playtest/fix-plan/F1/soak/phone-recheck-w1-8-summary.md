# Soak after-core-phone-w1-8

1 levels in one page (reloads: none), fast=2, phone emulation (844×390, DPR 3), CPU throttled 4×, served none from http://127.0.0.1:4401. Longest streak: 11. Page errors: 0.

## Budgets: pass

docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §11.1 and docs/PERF.md §5. "n/a": not judged on this run. Owners are the fix plan's lanes; an offending animation names the file that defines it.

| result | when | check | budget | measured | owner |
|---|---|---|---|---|---|
| pass | after each level, back on the map (GC'd) | DOM nodes (CDP, attached + detached) | ≤ start + 600 (765) | start 165, worst 190 (after w1-8) | all |
| pass | after each level, back on the map (GC'd) | JS heap, MB | ≤ start + 8 (12) | start 4, worst 6.7 (after w1-8) | all |
| pass | after each level, back on the map (GC'd) | event listeners | ≤ start + 40 (289) | start 249, worst 275 (after w1-8) | all |
| pass | after each level, back on the map (GC'd) | animations on the map | ≤ start + 5 (34) | start 29, worst 29 (after start) | all |
| pass | after each level, back on the map (GC'd) | live intervals | ≤ start + 1 (2) | start 1, worst 1 (after start) | all |
| pass | after each level, back on the map (GC'd) | particles on the canvas | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | nodes in the fx layer | ≤ 0 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | rAF requests/s on the still map | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | live decoded audio, MB | ≤ 64 | start 0.9, worst 13.3 (after w1-8) | F1, B1 |
| pass | after each level, back on the map (GC'd) | Web Audio nodes (AudioHandlers) | ≤ start + 8 (19) | start 11, worst 11 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | &lt;audio> elements alive | ≤ start + 2 (4) | start 2, worst 2 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | window.__snNavLog entries | ≤ 500 | start 0, worst 4 (after w1-8) | F3 |
| pass | after each level, back on the map (GC'd) | the save's adjustLog entries | ≤ 200 | start 0, worst 0 (after start) | F1 |
| n/a | on the title, untouched for 5 s | live decoded audio, MB | ≤ 2 | not measured (--no-title, or an older run) | B1 |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations the compositor can't run | ≤ 2 | max 0; over in 0 of 10 samples | F1, B, C, D (by file) |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations running on hidden elements | ≤ 2 | max 2; over in 0 of 10 samples | F1, D2 (by file) |
| pass | the still map, 10 s untouched | rAF requests/s, median | ≤ 5 | 0 (max 0); main thread 1.6 % | F1, B1 |
| pass | a held Next (a reward), 40 s untouched, the idle nudge included | rAF requests/s, median | ≤ 5 | 4.2 (max 13.4); main thread 4.2 % | F1, F3 (nav.tsx), B1 |
| pass | phone ×4, while playing | every screen's median fps | ≥ 50 | lowest level:w1-8 (60.6) | D5 (the runner); otherwise the screen's owner |
| pass | phone ×4, the still map | main thread %, median | ≤ 5 % | 1.6 % | F1 |
| pass | phone ×4, a held Next (a reward), the idle nudge included | main thread %, median | ≤ 6 % | 4.2 % (5.8, 5.1, 3.2, 3.2) | F1 (the ninja), F3 (the nudge), B1 (the reward) |
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
| heapMB | 4 | 4 6.7 | 6.7 | 2.7 | ok (≤ start + 8 (12)) |
| nodes | 165 | 165 190 | 190 | 25 | ok (≤ start + 600 (765)) |
| detachedNodes | 9 | 9 24 | 24 | 15 |  |
| attachedNodes | 156 | 156 166 | 166 | 10 |  |
| listeners | 249 | 249 275 | 275 | 26 | ok (≤ start + 40 (289)) |
| globalListeners | 17 | 17 30 | 30 | 13 |  |
| animations | 29 | 29 29 | 29 | 0 | ok (≤ start + 5 (34)) |
| animInfinite | 9 | 9 9 | 9 | 0 |  |
| animHiddenInfinite | 0 | 0 0 | 0 | 0 |  |
| animMainThreadInfinite | 0 | 0 0 | 0 | 0 |  |
| fxDomNodes | 0 | 0 0 | 0 | 0 | ok (≤ 0) |
| particles | 0 | 0 0 | 0 | 0 | ok (≤ 5) |
| rafPerSec | 0 | 0 0 | 0 | 0 | ok (≤ 5) |
| intervals | 1 | 1 1 | 1 | 0 | ok (≤ start + 1 (2)) |
| pendingTimeouts | 0 | 0 0 | 0 | 0 |  |
| mediaAlive | 2 | 2 2 | 2 | 0 | ok (≤ start + 2 (4)) |
| decodedMB | 0.9 | 0.9 13.3 | 13.3 | 12.4 | ok (≤ 64) |
| decodedTotalMB | 0.9 | 0.9 13.3 | 13.3 | 12.4 |  |
| decodedClips | 2 | 2 42 | 42 | 40 |  |
| audioHandlers | 11 | 11 11 | 11 | 0 | ok (≤ start + 8 (19)) |
| arrayBuffers | 4 | 4 44 | 44 | 40 |  |
| layoutObjects | 116 | 116 129 | 129 | 13 |  |
| navLog | 0 | 0 4 | 4 | 4 | ok (≤ 500) |
| adjustLog | 0 | 0 0 | 0 | 0 | ok (≤ 200) |
| imagesFetched | 54 | 54 59 | 59 | 5 |  |
| audioFetched | 3 | 3 43 | 43 | 40 |  |
| imgInDomMB | 22.5 | 22.5 22.5 | 22.5 | 0 |  |
| rendererRssMB | 431 | 431 869 | 869 | 438 |  |
| gpuRssMB | 74 | 74 90 | 90 | 16 |  |
| footprintMB | 93.5 | 93.5 160 | 160 | 66.5 |  |
| gpuFootprintMB | 14.5 | 14.5 14.3 | 14.3 | -0.2 |  |
| mem_blink_gc | 5 | 5 19.8 | 19.8 | 14.8 |  |
| mem_blink_objects | 1.6 | 1.6 2.9 | 2.9 | 1.3 |  |
| mem_canvas | 3.5 | 3.5 3.7 | 3.7 | 0.2 |  |
| mem_cc | 193.3 | 193.3 520.8 | 520.8 | 327.5 |  |
| mem_discardable | 193.4 | 193.4 511.2 | 511.2 | 317.8 |  |
| mem_malloc | 53.5 | 53.5 57.7 | 57.7 | 4.2 |  |
| mem_media | 2.4 | 2.4 2.4 | 2.4 | 0 |  |
| mem_mojo | 0 | 0 0 | 0 | 0 |  |
| mem_parkable_images | 0 | 0 0 | 0 | 0 |  |
| mem_parkable_strings | 0 | 0 0 | 0 | 0 |  |
| mem_partition_alloc | 33.9 | 33.9 74.5 | 74.5 | 40.6 |  |
| mem_shared_memory | 222.6 | 222.6 549.9 | 549.9 | 327.3 |  |
| mem_site_storage | 0 | 0 0 | 0 | 0 |  |
| mem_skia | 0.3 | 0.3 8 | 8 | 7.7 |  |
| mem_v8 | 6.3 | 6.3 9.2 | 9.2 | 2.9 |  |
| mem_web_cache | 1.2 | 1.2 1.2 | 1.2 | 0 |  |

## While playing (periodic samples): first half vs second half

| metric | first half | second half |
|---|---|---|
| fps | 60.7 | 60.5 |
| slowFramePct | 0 | 0 |
| mainThreadPct | 16 | 17.4 |
| scriptPct | 1.8 | 1.6 |
| stylePct | 2.4 | 3.5 |
| layoutPct | 0.4 | 0.3 |
| recalcPerSec | 62.4 | 55.3 |
| layoutPerSec | 8.8 | 10.9 |
| rendererPct | 89 | 89 |
| gpuPct | 10.5 | 12.3 |
| longTaskMs | 0 | 0 |
| rafPerSec | 63.4 | 61.4 |
| rafPerFrame | 0.9 | 1 |
| animHiddenInfinite | 0 | 0.7 |
| animMainThreadInfinite | 0 | 0 |
| animations | 11 | 60.7 |
| animInfinite | 8 | 37 |
| particles | 0 | 0 |
| particlesPeak | 50 | 132.7 |

## Phases (the title, the still map, a held Next, the ninja's aura, the strike stress)

| phase | what | fps | main % | style % | recalcs/s | rAF/s | renderer CPU % | GPU CPU % | particles (now / peak) | fx nodes | animations | decoded MB | Nodes | heap MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| idle-map | map | 60.9 | 1.6 | 0.5 | 23.8 | 0 | 81 | 8 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 13.3 | 190 | 6.9 |
| settled | after soak | 60.8 | 1.4 | 0.3 | 20.4 | 0 | 81 | 9 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 13.3 | 190 | 6.7 |
| settled | the reward (w1-8), Next ready | 60.9 | 10.5 | 1.2 | 60.1 | 0 | 85 | 8 | 0 / 0 | 0 | 16 (7 inf, 0 main) | 13.3 | 275 | 6.7 |
| idle-next | the reward (w1-8), a held Next, untouched | 60.3 | 5.8 | 0.7 | 30.3 | 13.4 | 83 | 9 | 0 / 60 | 0 | 16 (8 inf, 0 main) | 13.7 | 278 | 6.6 |
| idle-next | the reward (w1-8), a held Next, untouched | 61 | 5.1 | 0.7 | 29.8 | 8.3 | 82 | 9 | 0 / 0 | 0 | 16 (8 inf, 0 main) | 13.7 | 288 | 6.7 |
| idle-next | the reward (w1-8), a held Next, untouched | 61.1 | 3.2 | 0.4 | 22.4 | 0 | 81 | 9 | 0 / 0 | 0 | 16 (8 inf, 0 main) | 13.7 | 278 | 6.7 |
| idle-next | the reward (w1-8), a held Next, untouched | 61.1 | 3.2 | 0.4 | 20 | 0 | 82 | 9 | 0 / 0 | 0 | 16 (8 inf, 0 main) | 13.7 | 278 | 6.7 |

## Levels

| level | kind | secs | finished | max streak | streak at end | stuck |
|---|---|---|---|---|---|---|
| w1-8 | swap | 92 | yes | 11 | 11 |  |

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
  "bufferCache": 42,
  "captionListeners": 3,
  "clipListeners": 0,
  "sayListeners": 1,
  "music": 1,
  "speaking": 0,
  "decodedLruMB": 13.3,
  "musicDecks": 2,
  "storeListeners": 4,
  "attemptSubs": 0,
  "saveBytes": 1432,
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
  "streakN": 11,
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

