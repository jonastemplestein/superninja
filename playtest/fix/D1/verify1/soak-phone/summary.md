# Soak soak-phone

2 levels in one page (reloads: none), fast=2, phone emulation (844×390, DPR 3), CPU throttled 4×, served none from http://127.0.0.1:4741. Longest streak: 17. Page errors: 0.

## Budgets: pass

docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §11.1 and docs/PERF.md §5. "n/a": not judged on this run. Owners are the fix plan's lanes; an offending animation names the file that defines it.

| result | when | check | budget | measured | owner |
|---|---|---|---|---|---|
| pass | after each level, back on the map (GC'd) | DOM nodes (CDP, attached + detached) | ≤ start + 600 (815) | start 215, worst 261 (after w2-2) | all |
| pass | after each level, back on the map (GC'd) | JS heap, MB | ≤ start + 8 (17.6) | cold map 6.5, start 9.6 (after w2-1, the warm-up), worst 10.1 (after w2-2) | all |
| pass | after each level, back on the map (GC'd) | event listeners | ≤ start + 40 (292) | start 252, worst 252 (after start) | all |
| pass | after each level, back on the map (GC'd) | animations on the map | ≤ start + 5 (34) | start 29, worst 29 (after start) | all |
| pass | after each level, back on the map (GC'd) | live intervals | ≤ start + 1 (2) | start 1, worst 1 (after start) | all |
| pass | after each level, back on the map (GC'd) | particles on the canvas | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | nodes in the fx layer | ≤ 0 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | rAF requests/s on the still map | ≤ 5 | start 0, worst 0 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | live decoded audio, MB | ≤ 64 | start 1, worst 39.7 (after w2-2) | F1, B1 |
| pass | after each level, back on the map (GC'd) | Web Audio nodes (AudioHandlers) | ≤ start + 8 (19) | start 11, worst 11 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | &lt;audio> elements alive | ≤ start + 2 (4) | start 2, worst 2 (after start) | F1 |
| pass | after each level, back on the map (GC'd) | window.__snNavLog entries | ≤ 500 | start 0, worst 54 (after w2-2) | F3 |
| pass | after each level, back on the map (GC'd) | the save's adjustLog entries | ≤ 200 | start 0, worst 0 (after start) | F1 |
| n/a | on the title, untouched for 5 s | live decoded audio, MB | ≤ 2 | not measured (--no-title, or an older run) | B1 |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations the compositor can't run | ≤ 2 | max 0; over in 0 of 16 samples | F1, B, C, D (by file) |
| pass | while playing, and on still screens (title, map, a held Next), every sample | endless animations running on hidden elements | ≤ 2 | max 0; over in 0 of 16 samples | F1, D2 (by file) |
| pass | the still map, 20 s untouched | rAF requests/s, median | ≤ 5 | 0 (max 0); main thread 1.1 % | F1, B1 |
| n/a | a held Next (a reward), 0 s untouched, the idle nudge included | rAF requests/s, median | ≤ 5 | not measured (--idle-next 0, or an older run) | F1, F3 (nav.tsx), B1 |
| pass | phone ×4, while playing | every screen's median fps | ≥ 50 | lowest reward:w2-1 (60.3) | D5 (the runner); otherwise the screen's owner |
| pass | phone ×4, the still map | main thread %, median | ≤ 5 % | 1.1 % | F1 |
| n/a | phone ×4, a held Next (a reward), the idle nudge included | main thread %, median | ≤ 6 % | not measured (--idle-next 0, or an older run) | F1 (the ninja), F3 (the nudge), B1 (the reward) |
| pass | phone ×4, the ninja standing still | main thread % at streak 0, mean | ≤ 6 % | 1.9 % (2.5, 1.2) | F1 |
| pass | phone ×4, the ninja standing still | main thread % at streak 10, mean | ≤ 14 % | 5.4 % (6.8, 4.1) | F1 |
| pass | phone ×4, the World Flower | main thread %, median | ≤ 30 % | 19.6 % over 2 samples (19.7, 19.5) | B2 |
| pass | phone ×4, the World Flower | longest task, ms | ≤ 120 ms | 0 ms | B2 |
| n/a | the strike stress (streak-10 strikes, 7 a second) | particles at the peak | ≤ 350 | not measured (--stress 0) | F1 |
| n/a | 10 s after the stress | particles / fx nodes left | 0 / 0 | not measured (--stress 0) | F1 |
| pass | the whole soak | page reloads | 0 | 0 | all |
| pass | the whole soak | levels the bot finished | all | 2 of 2 | the scene's owner (or bot.ts) |

## After each level (on the map, after a forced GC)

| metric | start | per level → | last | slope / level | budget |
|---|---|---|---|---|---|
| heapMB | 6.5 | 6.5 9.6 10.1 | 10.1 | 1.8 | ok (≤ start + 8 (17.6)) |
| nodes | 215 | 215 246 261 | 261 | 23 | ok (≤ start + 600 (815)) |
| detachedNodes | 45 | 45 95 100 | 100 | 27.5 |  |
| attachedNodes | 170 | 170 151 161 | 161 | -4.5 |  |
| listeners | 252 | 252 212 212 | 212 | -20 | ok (≤ start + 40 (292)) |
| globalListeners | 20 | 20 19 19 | 19 | -0.5 |  |
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
| decodedMB | 1 | 1 36 39.7 | 39.7 | 19.35 | ok (≤ 64) |
| decodedTotalMB | 1 | 1 36 43.1 | 43.1 | 21.05 |  |
| decodedClips | 2 | 2 89 100 | 100 | 49 |  |
| audioHandlers | 11 | 11 11 11 | 11 | 0 | ok (≤ start + 8 (19)) |
| arrayBuffers | 10 | 10 97 108 | 108 | 49 |  |
| layoutObjects | 147 | 147 160 170 | 170 | 11.5 |  |
| navLog | 0 | 0 37 54 | 54 | 27 | ok (≤ 500) |
| adjustLog | 0 | 0 0 0 | 0 | 0 | ok (≤ 200) |
| imagesFetched | 58 | 58 82 82 | 82 | 12 |  |
| audioFetched | 3 | 3 92 109 | 109 | 53 |  |
| imgInDomMB | 18 | 18 11 11 | 11 | -3.5 |  |
| rendererRssMB | 323 | 323 890 939 | 939 | 308 |  |
| gpuRssMB | 78 | 78 91 91 | 91 | 6.5 |  |
| footprintMB | 78.5 | 78.5 186.6 216.5 | 216.5 | 69 |  |
| gpuFootprintMB | 14.4 | 14.4 13.7 14.1 | 14.1 | -0.15 |  |
| mem_blink_gc | 5 | 5 17.8 23 | 23 | 9 |  |
| mem_blink_objects | 1.9 | 1.9 3.3 3.4 | 3.4 | 0.75 |  |
| mem_canvas | 3.5 | 3.5 3.8 3.8 | 3.8 | 0.15 |  |
| mem_cc | 102.8 | 102.8 513.6 512.3 | 512.3 | 204.75 |  |
| mem_discardable | 107.1 | 107.1 512.1 513.7 | 513.7 | 203.3 |  |
| mem_malloc | 47.7 | 47.7 52.6 53.7 | 53.7 | 3 |  |
| mem_media | 2.4 | 2.4 2.4 2.4 | 2.4 | 0 |  |
| mem_mojo | 0 | 0 0 0 | 0 | 0 |  |
| mem_parkable_images | 0 | 0 0 0 | 0 | 0 |  |
| mem_parkable_strings | 0 | 0 0 0 | 0 | 0 |  |
| mem_partition_alloc | 17 | 17 108.7 136.2 | 136.2 | 59.6 |  |
| mem_shared_memory | 128.7 | 128.7 537.1 537.9 | 537.9 | 204.6 |  |
| mem_site_storage | 0 | 0 0 0 | 0 | 0 |  |
| mem_skia | 0.2 | 0.2 1 1.7 | 1.7 | 0.75 |  |
| mem_v8 | 8.5 | 8.5 11.9 12.6 | 12.6 | 2.05 |  |
| mem_web_cache | 1.7 | 1.7 1.5 1.5 | 1.5 | -0.1 |  |

## While playing (periodic samples): first half vs second half

| metric | first half | second half |
|---|---|---|
| fps | 60.9 | 60.5 |
| slowFramePct | 0 | 0 |
| mainThreadPct | 13.4 | 22.2 |
| scriptPct | 1.7 | 2.3 |
| stylePct | 1.8 | 3.7 |
| layoutPct | 0.2 | 0.3 |
| recalcPerSec | 61.3 | 62.6 |
| layoutPerSec | 8.1 | 10.8 |
| rendererPct | 86.4 | 91.9 |
| gpuPct | 8.1 | 15.1 |
| longTaskMs | 0 | 0 |
| rafPerSec | 83 | 92 |
| rafPerFrame | 1.3 | 1.4 |
| animHiddenInfinite | 0 | 0 |
| animMainThreadInfinite | 0 | 0 |
| animations | 25.6 | 58.9 |
| animInfinite | 13.4 | 37.3 |
| particles | 14.1 | 57.4 |
| particlesPeak | 100.4 | 174.1 |

## Phases (the title, the still map, a held Next, the ninja's aura, the strike stress)

| phase | what | fps | main % | style % | recalcs/s | rAF/s | renderer CPU % | GPU CPU % | particles (now / peak) | fx nodes | animations | decoded MB | Nodes | heap MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| idle-map | map | 60.1 | 1.1 | 0.2 | 23.6 | 0 | 80 | 4 | 0 / 0 | 0 | 15 (6 inf, 0 main) | 39.7 | 261 | 10 |
| idle-map | map | 60.1 | 1 | 0.2 | 23.8 | 0 | 79 | 4 | 0 / 0 | 0 | 15 (6 inf, 0 main) | 39.7 | 261 | 10.2 |
| settled | after soak | 60.5 | 0.8 | 0.2 | 20.9 | 0 | 80 | 5 | 0 / 0 | 0 | 15 (6 inf, 0 main) | 39.7 | 261 | 10.1 |
| aura-t0 | ninja demo, streak 0, idle | 60.3 | 2.5 | 0.6 | 25.9 | 0 | 81 | 7 | 0 / 0 | 0 | 4 (3 inf, 0 main) | 39.7 | 396 | 10.2 |
| aura-t0 | ninja demo, streak 0, idle | 60 | 1.2 | 0.2 | 24.5 | 0 | 80 | 6 | 0 / 0 | 0 | 4 (3 inf, 0 main) | 39.7 | 396 | 10.3 |
| aura-t3 | ninja demo, streak 10, idle | 60.8 | 6.8 | 2 | 33.6 | 15 | 83 | 11 | 0 / 98 | 0 | 60 (49 inf, 0 main) | 39.4 | 344 | 10.2 |
| aura-t3 | ninja demo, streak 10, idle | 60.3 | 4.1 | 1.6 | 24.6 | 0 | 82 | 11 | 0 / 0 | 0 | 60 (49 inf, 0 main) | 39.4 | 344 | 10.1 |
| settled | map after the stress | 60.8 | 1.4 | 0.3 | 21.4 | 0 | 80 | 8 | 0 / 0 | 0 | 29 (9 inf, 0 main) | 39.3 | 272 | 10.2 |

## Levels

| level | kind | secs | finished | max streak | streak at end | stuck |
|---|---|---|---|---|---|---|
| w2-1 | dojo | 123 | yes | 8 | 8 |  |
| w2-2 | battle | 40 | yes | 17 | 17 |  |

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
    4
   ],
   [
    "@petal-drift-l",
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
  "window:pointerdown:capture": 2,
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
  "window:orientationchange": 1
 },
 "intervals": {
  "100ms at http://127.0.0.1:4741/assets/play-n1LAdCju.js:2:971": 1
 },
 "mods": {
  "visemeListeners": 1,
  "bufferCache": 100,
  "captionListeners": 3,
  "clipListeners": 5,
  "sayListeners": 2,
  "music": 1,
  "speaking": 0,
  "decodedLruMB": 39.7,
  "musicDecks": 2,
  "storeListeners": 4,
  "attemptSubs": 0,
  "saveBytes": 5550,
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
  "streakN": 17,
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

