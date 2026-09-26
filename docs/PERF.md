# Performance: why the phone "melts"

Jonas, 26 Sep: *"after I play for a while, my phone melts, basically, and nothing really works anymore. I think the particle effects don't get cleared when you have ninja streaks or something."*

## The short version

- **It isn't a particle leak.** Particles and the ninja's effect nodes are cleared every time. After 20 levels in one page they are back to zero on the map. Even after 150 back-to-back streak-10 strikes (up to 461 particles and 105 effect nodes at once), everything is gone within 10 seconds. Auras don't stack either: there's never more than one ninja, and never more than 10 flames.
- **The game never lets the phone rest.** Two animation loops run every frame, forever, even on a still screen: the particle canvas (redrawn when it's empty) and the lip-sync analyser (listening to silence). They keep the main thread producing 60 frames a second, and while it does, every CSS animation on the page gets a style pass every frame. The ninja adds 24 to 40 endless animations whatever its tier. Several of them can't run on the GPU: the 9 orbit dots animate `z-index`, and up to 10 flames flicker as SVGs with drop shadows. The orbit dots run even at tiers 0–2, where they're invisible. On a phone-speed CPU, the still map costs 10–12 % of the main thread, the ninja standing still costs 15–23 %, and play costs 30–40 %. That's steady load with no idle gaps, the classic way to heat a phone until it throttles, and then "nothing really works".
- **Memory only goes up.** Every speech clip ever played stays decoded in memory (about 0.5 MB each). That's +90 MB in a 34-minute session. The title screen also decodes the title music into 61 MB of raw audio that is never played from that buffer. Every music change leaks an `<audio>` element and two Web Audio nodes.
- **Some screens are simply heavy.** On the throttled phone the runner (w1-9) redraws a 1280×720 canvas every frame and saturates the main thread (fps 29–36). The World Flower has 1,900 DOM nodes and a `box-shadow` pulse, and hits long tasks of up to 257 ms.
- **The fixes are small, and a preview of them measurably helps.** The six main fixes were applied at build time to a snapshot, with no game code touched, and played side by side with the unfixed build. On the still map, the phone's main thread went from 10.2 % to 3.5 % and frame requests from 120/s to 0. The ninja standing still at streak 0 went from 16 % to 4 %. Web Audio nodes and `<audio>` elements stopped growing, and decoded audio stayed within a budget (details in §4).

## 1. How it was measured

`scripts/treadmill/soak.ts` is new and reusable. The bot plays level after level in **one page with no reloads**, going through the map the way a child does: level → reward → Next → the World Flower trip if one is due → map → the next stone. It samples every 10 s using:

- **CDP `Performance.getMetrics`**: JS heap, `Nodes` (attached and detached), `JSEventListeners`, `LayoutCount`/`RecalcStyleCount` and their durations, `TaskDuration` (main-thread busy %), `AudioHandlers` (live Web Audio nodes), `ArrayBufferContents`, `Documents`, `Frames`.
- **Processes**: renderer and GPU process CPU % (`SystemInfo.getProcessInfo`), RSS, and at every level boundary a memory-infra dump (private footprint by allocator: v8, blink_gc, partition_alloc, cc, discardable…).
- **In-page counters** installed before the game runs:
  - animations: running, endless, endless on hidden elements, and endless ones the compositor can't run (a non-compositable property, or an SVG target);
  - DOM nodes: whole page, the fx layer, ninja spots, flames;
  - live canvas particles;
  - rAF requests per second (≈ live rAF loops);
  - fps from a 1 s probe, plus slow and janky frames;
  - live intervals and pending timeouts, long tasks;
  - `<audio>`/`<video>` elements alive (in the DOM or not), Web Audio nodes created;
  - **live** decoded audio bytes (via a `FinalizationRegistry`);
  - window/document listeners by type.
- **Module probes** (`soak.vite.config.ts`, test builds only) read module state the game never exposes: the particle array, the ninja's `owned` set, caption/clip/say/viseme/streak/store listener sets, the decoded-audio cache and the nav and help stacks.
- **Phases after the levels**: 60 s idle on the map; the ninja demo at streak 0 and at streak 10 (the aura's standing cost); then `--stress`, 150 streak-10 strikes fired at 7 a second, and 10 s to settle.
- **Boundaries**: after each level, back on the map, it forces a GC and takes a boundary sample. The invariant compares these with the first sample.

It plays a **frozen production build** of the working tree, so the other workflow's edits can't hot-reload the page mid-soak. The build uses a no-HMR, no-watch Vite config with the probes added.

| run | what | length |
|---|---|---|
| `playtest/soak/desktop-fast2` | 20 levels (w1-2 … w2-6), `?fast=2`, desktop 844×390 | 23 min |
| `playtest/soak/phone-cpu4-fast1` | 15 levels (w1-2 … w2-1) at **real speed**, phone emulation (844×390, DPR 3, touch), **CPU throttled 4×** | 34 min |
| `playtest/soak/ab-before` / `ab-after` | 12 levels each, phone ×4, `?fast=2`, run **side by side**; *after* has the fixes preview patched in (`--patched`, `soak-fixes.ts`) | 21 min each |
| `playtest/soak/verify-after` | 14 levels with the fixes preview, desktop, `?fast=2` (checks the decoded-audio budget with the live counter) | see §4 |

Each run directory has `summary.md` (tables and the invariant), `report.html` (a chart per metric over time), `samples.json`/`.csv` and `levels.json`. The A/B runs also have `heap-diff.md` (V8 and Blink heap snapshots diffed by constructor). Snapshots were built on 26 Sep, 21:10–21:44 BST. **Line numbers below are from that snapshot**; `src/ui` and `src/scenes` are being edited, so search for the quoted code if a line has moved.

## 2. Measurements (before)

### 2.1 What does *not* pile up

Desktop run, after each of 20 levels, on the map after a forced GC:

| metric | at the start | after 20 levels | |
|---|---|---|---|
| particles on the canvas | 0 | 0 (every level) | cleared |
| nodes in the fx layer | 0 | 0 (every level) | cleared |
| ninja spots / flames on the map | 0 / 0 | 0 / 0 | never more than 1 spot and 10 flames while playing |
| animations on the map | 29 | 29–30 (16 on the land-2 map) | nothing left running |
| rAF callbacks per frame | 2 | 2 | the same two always-on loops, never more (§3, fixes 1–2) |
| live intervals | 1 | 1 | `fast.ts`, bots only |
| `JSEventListeners` | 251 | 240–280 | flat |
| caption / viseme / streak listeners | 3 / 1 / 1 | 3 / 1 / 1 | flat |
| window/document listeners | 17 | 30 | +13 once in level 1 (Playwright's own capture listeners), then flat |
| JS heap | 3.7 MB | 9.8 MB | mostly compiled code warming up (heap-diff: `(code)` +4 MB) |

**The streak stress** (phone ×4, the ninja demo, 150 strikes at streak 10, 7 a second): main thread 96–99 %, fps 37–50, up to 461 particles and 105 effect nodes. Ten seconds after the last strike: **0 particles and 0 effect nodes**. On the map afterwards, animations, listeners and rAF loops are back to baseline. Strikes are expensive while they happen, but they leave nothing behind.

### 2.2 What does grow: memory

| after each level (GC'd) | start | desktop, 20 levels | phone, 15 levels at real speed (34 min) | per level |
|---|---|---|---|---|
| **decoded audio kept** (live clips) | 0.9 MB (2) | **96 MB (291 clips)** | **90 MB (262 clips)** | +4.7–5.2 MB |
| **`AudioHandlers`** (live Web Audio nodes) | 9 | **93** | **75** | +4.2 |
| **`<audio>` elements alive** | 1 | **43** | **34** | +2.1 |
| DOM nodes (CDP, attached + detached) | 165 | 386 (detached 7 → 197) | 294 | +9 (detached ~+10) |
| `window.__snNavLog` entries | 0 | 96 | 79 | +5 |
| renderer private footprint (memory-infra) | 88 MB | 618 MB | 636 MB | +24–31 MB (see note) |

Clean numbers, from a one-off experiment that drives Chrome over raw CDP, without Playwright and so without DevTools network capture:

- **300 speech clips decoded**: +178 MB footprint, +157 MB of live ArrayBuffers (**0.52 MB per clip**). Clips are 44.1 kHz mono MP3s at 56 kbps, decoded to float32 at the context's 48 kHz, about 27× their download size.
- **Just opening the title screen**: 61 MB of live ArrayBuffers straight away. That is `title.mp3` (167 s, stereo) decoded by `preload([... urls.music("title")])`.
- **24 music changes**: footprint flat, but about +40 `AudioHandlers`. The node leak is real, but its memory is small in Chrome. WebKit's per-element cost is unknown, and the fix is cheap anyway.

**Note on footprint and RSS.** Under Playwright these include DevTools' own copies of response bodies: Playwright always enables the Network domain, and the heap diff shows +4,862 `NetworkResourcesData::ResourceData`. They also include Chrome's decoded-image cache (`cc/image_memory`, which plateaus at about 450–500 MB here), so they overstate real-world growth. The music "memory leak" that shows up under Playwright disappears without DevTools. That's why the invariant uses the live, exact counters (decoded audio, audio nodes, media elements, DOM nodes, heap) and reports footprint without judging it.

### 2.3 The standing cost: the phone never idles

Phone ×4 (CPU time on a phone-speed core; renderer CPU % is meaningless under Chrome's throttling, so this uses main-thread busy %):

| situation | main thread busy | style recalcs/s | rAF requests/s |
|---|---|---|---|
| the map, nothing moving | **10–12.5 %** | 60 | 120 |
| the ninja standing still, streak 0 | **15–23 %** | 60 | 120 |
| the ninja standing still, streak 10 | **21–23 %** | 60 | 120 |
| playing, streak 0 / 1 / 2 / 3+ | 25 / 24 / 29 / **36 %** | 60–200 | 120+ |
| the runner (w1-9) | **91–100 %**, fps 29–36 in the soaks | | |
| the World Flower (after a level) | 63 % on average, peaks 98 %, long tasks up to 257 ms | | |
| 150 streak-10 strikes, 7 a second | 96–99 %, fps 37–50 | ~100 | |

On desktop the same numbers are about 5× lower (idle map 2 %, playing 7–15 %). Headless Chrome held about 60 fps almost everywhere, because the main thread isn't saturated except in the runner and the stress. The damage on a phone is sustained load (heat, then thermal throttling, then jank) rather than a single slow frame.

### 2.4 Where the standing cost comes from (ablation, phone ×4)

Each row removes one more thing from the previous row (dev build, so the loops could be stopped by name):

| the ninja demo, standing still | streak 10 | streak 0 | the map |
|---|---|---|---|
| as it is | 19.8 % | 14.4 % | 8.2 % |
| − the two always-on rAF loops | 18.5 % | 12.1 % | **3.7 %** |
| − the 9 orbit dots (`z-index` keyframes) | 16.0 % | **7.0 %** (invisible at streak 0!) | |
| − the flame flicker (animation on `<svg>`) | **7.4 %** | 6.6 % | |
| − aura, rays, rim, sparks, ground, hover, breathe | 2.8 % | 2.5 % | |
| − every animation | 1.8 % | 1.5 % | |

Micro-benchmarks, in an isolated page on phone ×4:

- **10 flames**: the flicker on the `<svg>` gives 60 recalcs/s and 3.1 % main; the same flicker on an HTML wrapper gives 0 recalcs and 0.1 %.
- **9 orbit dots**: with `z-index` in the keyframes, 60 recalcs/s and 4.2 % main whether visible or at `opacity: 0`; without it, 0 and 0.0 %.
- **A blank page**: a `transform` animation alone causes 0 recalcs/s. Add *any* rAF loop and the same animation causes 60/s. That's why the always-on loops matter beyond their own cost.
- **The runner's frame**: 0.4 ms of JavaScript but **13.5 ms of canvas raster** per frame (its own `__runPerf` hook with `flush`). The budget is 16.7 ms.

## 3. Root causes and fixes

In order of impact on a long session. Fixes 1–6 are the ones previewed in §4 (`scripts/treadmill/soak-fixes.ts` has them as exact patches against this snapshot).

### Fix 1 (heat): the particle canvas redraws every frame even when it's empty

`src/ui/ui.tsx:562-705` (`FxLayer`): `loop` does `g.clearRect(0, 0, W, H)` (`:577`) and `raf = requestAnimationFrame(loop)` (`:691`) unconditionally, for the whole life of the app. A 1280×720 canvas is invalidated and composited every frame, and the main thread can never idle. Particles only ever enter through `particles.push` in `fx.*` (`:477-560`).

Fix: sleep when there's nothing to draw, wake on the first new particle, and cap the array.

```ts
// ui.tsx, next to `const particles: Particle[] = [];` (:432)
const MAX_PARTICLES = 350; // the stress test peaked at 461; the oldest go first
let wakeFx: (() => void) | null = null;
function add(p: Particle) {
  if (particles.length >= MAX_PARTICLES) particles.shift();
  particles.push(p);
  wakeFx?.();
}
// every fx.* method: particles.push({...}) → add({...})

// FxLayer's effect: the end of loop, and start/stop
      raf = particles.length ? requestAnimationFrame(loop) : 0; // (this frame already cleared the canvas)
    };
    wakeFx = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    wakeFx();
    return () => {
      wakeFx = null;
      cancelAnimationFrame(raf);
      if (fxDomEl === domRef.current) fxDomEl = null;
    };
```

### Fix 2 (heat): the lip-sync analyser runs every frame, forever

`src/engine/lipsync.ts:31-60`: `tick` calls `requestAnimationFrame(tick)` first thing (`:32`) and is started once for the app's lifetime (`:60`). Because the Help button's `TalkingFace` is always mounted, it always has a listener. So it reads 1,024 samples and computes an RMS on every frame, even in silence.

Fix: run it only while speech plays.

```ts
// lipsync.ts
let running = false, quiet = 0;
export let wakeLipsync = () => {};
// in attachLipsync:
  const tick = (t: number) => {
    if (!analyser || !listeners.size || (quiet > 30 && current === "rest")) {
      running = false; // half a second of silence with the mouth shut: sleep until the next clip
      return;
    }
    requestAnimationFrame(tick);
    analyser.getFloatTimeDomainData(time);
    // ... rms as now ...
    quiet = rms > 0.012 ? 0 : quiet + 1;
    // ... viseme as now ...
  };
  wakeLipsync = () => {
    if (running) return;
    running = true;
    quiet = 0;
    requestAnimationFrame(tick);
  };
  wakeLipsync();

// audio.ts playBuffer (:212-213)
    src.start();
    if (bus === speechBus) (current = src), wakeLipsync();
```

With fixes 1 and 2, a still screen makes **no** rAF requests (A/B: 120/s → 0/s). Composited CSS animations then run on the GPU without touching the main thread.

### Fix 3 (heat): the aura animates what can't be seen, and part of it on the main thread

`src/ui/Ninja.tsx:1363-1391` renders 14 sparks and 9 orbit dots on every `NinjaSpot`, whatever the tier. In `src/styles.css`, these animate at every tier, including tiers where they're invisible:

- the rays: `.nj-rays` `animation: nj-swirl` (`:458`), `opacity: 0` below tier 1;
- the sparks: `.nj-sparks i` `animation: nj-rise` (`:474`), `opacity: 0` below tier 1;
- the orbit: `.nj-orbit i` `animation: nj-orbit` (`:483`), `opacity: 0` below tier 3.

Worse, the orbit keyframes (`:487-505`) animate **`z-index`**, which the compositor can't run. That's 9 main-thread animations with a style recalc and a repaint every frame, on every screen with a ninja, at every tier. Measured cost: 5 of the 14 % the idle ninja costs at streak 0. The same pattern is in the battle's dizzy stars: `bt-orbit` has `z-index` keyframes (`styles/battle.css:39-48`) and keeps running after `.bt-dizzy` has faded to `opacity: 0`.

Fix: only animate at the tiers that show it, and take `z-index` out of the keyframes.

```css
/* styles.css */
.nj-rays { … animation: nj-swirl 14s linear infinite paused; … }
.ninja-spot:is(.tier-1, .tier-2, .tier-3) .nj-rays { animation-play-state: running; }
.nj-sparks i { … animation: nj-rise 2.4s linear infinite paused; }
.ninja-spot:is(.tier-1, .tier-2, .tier-3) .nj-sparks i { animation-play-state: running; }
.nj-orbit i { … animation: nj-orbit 2.4s linear infinite paused; }
.ninja-spot.tier-3 .nj-orbit { opacity: 1; z-index: 3; }
.ninja-spot.tier-3 .nj-orbit i { animation-play-state: running; }
@keyframes nj-orbit { /* the same keyframes, without the z-index declarations */ }
```

If the dots must really pass *behind* the ninja, render two orbit containers: one before `.nj-body` (behind) and one after it (in front). Give each an opacity keyframe that shows the dot only in its half. That's two composited layers, and no `z-index` animation. (Rendering the sparks and orbit only at their tiers, `{tier >= 3 && <div className="nj-orbit">…}`, is also fine, with a CSS fade-in on mount.) For `bt-orbit`, do the same, and unmount `.bt-dizzy` when its 1.5 s life ends.

### Fix 4 (heat): the flames flicker as SVGs, which are repainted every frame

In `styles.css:557`, `.nj-flame svg { animation: nj-flicker … infinite alternate }` is on the `<svg>` element. Chrome doesn't composite animations on SVG elements, so up to 10 flames, each with a `filter: drop-shadow` (`:561-564`), are re-rasterised every frame on the main thread. It's the biggest single item in the ablation: 8.6 of the 19.8 % at streak 10. `.nj-flame.pale svg` (`:566`) does the same.

Fix: animate an HTML wrapper, which composites. Measured: 60 → 0 recalcs/s, 3.1 → 0.1 % main.

```tsx
// Ninja.tsx Flame (:1233-1239)
<span className={`nj-flame ${pale ? "pale" : ""}`} style={…}>
  <i className="nj-flick"><svg viewBox="0 0 40 54">…</svg></i>
</span>
```

```css
.nj-flame svg { width: 100%; height: 100%; overflow: visible; }
.nj-flick { display: block; width: 100%; height: 100%; transform-origin: 50% 92%; animation: nj-flicker 0.46s ease-in-out infinite alternate; animation-delay: var(--d); }
.nj-flame.pale svg { filter: drop-shadow(0 0 4px rgba(255, 244, 220, 0.9)); }
.nj-flame.pale .nj-flick { animation: nj-pend 0.7s ease-in-out infinite alternate; }
```

The same rule, "endless animations go on HTML elements with `transform`/`opacity` only", applies to these, all seen running during the soaks:

- the Help button's talking waves: `.help-waves path { animation: wave }` (`styles.css:330`), SVG paths, running whenever Sensei talks;
- the gem liquid: `.gem-liquid { animation: gem-slosh }` (`styles.css:306`, SVG paths in `ui/Gem.tsx:49-50`), up to 8 at once on the reward and the World Flower;
- the swap swirl: `.swap-swirl svg` (`styles/swap.css:56`, plus a drop shadow);
- the reading book: `.reader-book` (`styles/early.css:180`, an SVG);
- `box-shadow` pulses: `wffocus` (`scenes/Tree.tsx:364`, keyframes `:1526`) and `hintglow` (`styles.css:166,171`). Put the glow on a pseudo-element with a static shadow and pulse its `opacity`.

### Fix 5 (memory): every decoded clip is kept forever, and the title music is decoded for nothing

`src/engine/audio.ts:76-100`: `const buffers = new Map<string, Promise<AudioBuffer | null>>()` never forgets. Every line, word, sound and story page ever played stays decoded at about 0.5 MB each: +90 MB in a 34-minute session, and more in a longer one or across lands.

`src/App.tsx:357`: `preload([urls.line("tap_start"), urls.music("title")])` decodes the whole 167 s title track into **61 MB** of PCM. Music plays through `<audio>`, so this buffer is never used. (`scenes/Tree.tsx:747` decodes the 14 s `gem_victory` sting the same way, about 5 MB, which is fine once it's under the budget.)

Fix: a byte budget, least recently used out first. On a miss, the MP3 comes back from the HTTP cache and decodes in milliseconds. And don't decode the title music.

```ts
// audio.ts, around load() (:83)
const DECODED_BUDGET = 40 * 1048576; // ~130 average clips
const decodedLru = new Map<string, number>(); // url → bytes, oldest first
let decodedTotal = 0;
function remember(url: string, b: AudioBuffer) {
  const bytes = b.length * b.numberOfChannels * 4;
  decodedTotal += bytes - (decodedLru.get(url) ?? 0);
  decodedLru.delete(url);
  decodedLru.set(url, bytes);
  for (const [u, n] of decodedLru) {
    if (decodedTotal <= DECODED_BUDGET || u === url) break;
    decodedLru.delete(u);
    buffers.delete(u); // a clip that is playing keeps its buffer through its source node
    decodedTotal -= n;
  }
}
export function load(url: string): Promise<AudioBuffer | null> {
  let p = buffers.get(url);
  const seen = decodedLru.get(url);
  if (p && seen != null) (decodedLru.delete(url), decodedLru.set(url, seen)); // recently used
  if (!p) {
    p = fetch(url)
      /* … as now … */
      .then((b) => {
        bufferUrl.set(b, url);
        remember(url, b);
        return b;
      })
      /* … */
  }
  return p;
}

// App.tsx:357: music streams through <audio>; never decode it
preload([urls.line("tap_start")]);
```

### Fix 6 (memory, audio graph): every music change leaks an `<audio>` element and two nodes

`src/engine/audio.ts:414-453` (`playMusic`) makes a new `Audio` and `createMediaElementSource(el).connect(gain)` (`:443`) on every change. On cleanup (`:418-427`) it pauses, drops the `src` and disconnects `gain`, but the `MediaElementAudioSourceNode` stays connected. The node, its gain and the element are never released: +2 `AudioHandlers` and +1 `<audio>` per change, about 2 changes a level (43 elements and 93 nodes after 20 levels).

Fix: two decks, made once and reused for every track.

```ts
const decks: { el: HTMLAudioElement; gain: GainNode }[] = [];
export async function playMusic(id: string | null) {
  if (id === musicId) return;
  musicId = id;
  const c = audioCtx();
  if (!decks.length)
    for (let i = 0; i < 2; i++) {
      const el = new Audio();
      el.loop = true;
      el.preload = "auto";
      el.crossOrigin = "anonymous";
      const gain = c.createGain();
      gain.gain.value = 0;
      try {
        c.createMediaElementSource(el).connect(gain);
      } catch {}
      gain.connect(musicBus);
      decks.push({ el, gain });
    }
  const next = musicEl === decks[0] ? decks[1] : decks[0];
  if (musicEl) {
    const old = musicEl;
    old.gain.gain.setTargetAtTime(0, c.currentTime, 0.35);
    setTimeout(() => {
      if (musicEl === old) return; // it came back meanwhile
      old.el.pause();
      old.el.removeAttribute("src");
      old.el.load();
    }, 1800);
  }
  musicEl = null;
  if (!id) return;
  logAudio(urls.music(id), "music");
  /* mediaSession metadata as now */
  next.el.src = urls.music(id);
  next.gain.gain.cancelScheduledValues(c.currentTime);
  next.gain.gain.value = 0;
  musicEl = next;
  try {
    await next.el.play();
  } catch {
    return;
  }
  if (musicId === id) next.gain.gain.setTargetAtTime(1, c.currentTime, 0.6);
}
```

### Fix 7 (GPU, per strike): a full-stage blend on every impact, and a layer for every effect

These weren't previewed, because headless software compositing can't show GPU cost faithfully. They're the next thing to do for heat during play.

- `Ninja.tsx:350-355` `flash()` is a full 1280×720 radial-gradient div. `styles.css:626` gives it `.fx-flash { mix-blend-mode: screen }`. It fires on every impact at tier ≥ 2 (`:391`), and on every power-up and celebration. A full-screen blend layer makes the phone's GPU composite the whole stage into an offscreen buffer for each frame of the 260 ms flash. Use normal blending (the white radial gradient at the same alpha looks almost the same), or draw the flash on the particle canvas.
- `styles.css:608` `.fx-dom > * { will-change: transform }` promotes every pow star, flash, ribbon and clone to its own compositing layer, up to 105 at once in the stress test. Only things `fly()` moves need it: set `el.style.willChange = "transform"` in `fly()` and drop it from the rule.
- Projectile trails emit a particle on **every** frame of every flight: `onFrame: (p) => fx.glow(...)` at `Ninja.tsx:561, 594, 722, 792`, and the same in `Battle.tsx` `glide()`/`dot()` and `Early.tsx` `flyTo()`. That's twice as many particles on 120 Hz screens. Emit on alternate frames or by distance travelled, and rely on the cap from fix 1.
- `Ninja.tsx:251-262`: the `owned` set keeps removed effect nodes until 120 have piled up (`:259`). That's 442 detached nodes after the stress test. Delete from it when an effect removes itself.

### Fix 8 (the runner): a full-canvas redraw every frame

`src/scenes/Run.tsx:2107-2127` (`frame` → `draw`) repaints the whole 1280×720 canvas every frame: the scrolling background tile (`:1034-1038`), the ground with its gradient, curves and stones (`:1039-1072`), sprites, lanterns and word plates, and per-frame `shadowBlur` (`:1112`, `:1794`, `:1891`). JavaScript is 0.4 ms per frame, but the raster is 13.5 ms on phone ×4, 91 % of the main thread with nothing else going on. In the soaks, with other load on the machine, it ran at 29–36 fps. On an iPhone the canvas is GPU-backed, but it's still a full-screen redraw 60 times a second.

Fix, in order of payoff:

1. Move the scrolling background and ground out of the canvas. They can be two `<div>`s with the baked tiles as backgrounds, moved with `transform: translateX()`, which the compositor does for free. The canvas then only holds sprites, lanterns and plates.
2. Bake the remaining `shadowBlur` glows once, as `tinted()` and the flames already do.
3. The module texture cache (`Run.tsx:146`, `tex`) keeps about 12 MB of canvases for the rest of the session once the runner has been played (`mem_canvas` 3.8 → 15.7 MB). Clear it on unmount.

### Fix 9 (the World Flower): 1,900 nodes and a `box-shadow` pulse

After a level, the flower costs 63 % of the phone's main thread on average (peaks 98 %), with long tasks of up to 257 ms on entry. That's a visible freeze. A style pass over 1,900 nodes is 16 % on its own while main-thread animations run: `wffocus`, the gem slosh and the orbit. Fixes 1–4 remove most of that per-frame styling. After that:

- turn `wffocus` into an opacity pulse (fix 4);
- give the off-screen petals of the scrolling chart `content-visibility: auto`;
- profile the entry render with the React profiler for the long task.

### Minor

- `src/ui/nav.tsx:166`: `window.__snNavLog` gets one entry for every nav tap and step, forever. Keep the last 500, or only record under a bot flag.
- `src/engine/store.ts:293`: `adjustLog` grows forever. `store.set` `structuredClone`s the whole save on every call (`:169`), several times per answer, so the save's size is paid on every tap. Cap `adjustLog` at about 200 entries.
- `src/scenes/Battle.tsx:500-522`: in Gem Trials the charge bar does `setCharge` on every animation frame, re-rendering the whole 1,250-line Battle tree 60 times a second. Drive the bar with a ref and `style.transform`, or a CSS animation of the right duration.
- `src/scenes/Sort.tsx:477-487`: the falling word moves with `style.top` every frame, which forces a layout each frame. Use `translate`.
- `styles.css:554`: the flames reposition with `transition: left, top`, which lays out for 0.35 s at every streak change. Position them with a transform.
- Detached DOM nodes creep by about 10 per level (7 → 197 over 20 levels). It's small; run `soak.ts --heap` if it ever grows.
- `src/engine/fast.ts:11-14` (bots only): `document.getAnimations()` 10 times a second forces a style pass. That's fine for bots, but it inflates their recalc counts.

## 4. Fix preview: before and after, side by side

`soak.ts --patched` applies fixes 1–6 to the snapshot at build time (`scripts/treadmill/soak-fixes.ts`: 22 exact find/replace patches, all applied; no file on disk is changed). The two runs played the same 12 levels at the same time on the same machine: phone emulation, CPU ×4, `?fast=2`.

| | before | after (preview) |
|---|---|---|
| still map: main thread | 10.2 % (median) | **3.5 %** |
| still map: rAF requests | 120 /s | **0 /s** |
| the ninja standing still, streak 0 | 15–17 % | **2–5 %** |
| the ninja standing still, streak 10 | 23 % | **12 %** |
| playing: median / 90th percentile main thread | 29.6 % / 44.4 % | **25.0 % / 40.1 %** |
| endless main-thread animations while playing (max) | 29 (`nj-orbit` 9, `nj-flicker` 10, `wave` 9…) | 11 (the fix-4 list: `gem-slosh`, `wave`, `bt-orbit`…) |
| endless animations on hidden elements while playing (max) | 27 (`nj-rise` 14, `nj-orbit` 9…) | 3 (`bt-orbit`) |
| `AudioHandlers` after 12 levels | 63, +4.4 per level | **11, flat** |
| `<audio>` elements alive | 28, +2.2 per level | **2, flat** |
| live ArrayBuffers (decoded clips) | 206, +15 per level | **140, levelling off** |
| 150-strike stress: main thread | 67–76 % | 66–80 % (unchanged: fix 7 is for this) |
| the runner: median fps | 35.9 | 35.9 (unchanged: fix 8 is for this) |

(The A/B runs' `decodedMB` counted every decode ever, including re-decodes after eviction. Soaks from now on count live bytes, and `verify-after` below checks the budget with that counter.)

`verify-after` (fixes preview, desktop, `?fast=2`, 14 levels, with the live counter) confirms the budget. Live decoded audio climbs to **40 MB by level 6 and stays at 39–40 MB** to the end, while 90 MB was decoded over the session. Web Audio nodes (11), `<audio>` elements (2) and rAF requests at rest (0/s) stay flat. On the still map, the desktop main thread goes from 2 % to 0.6–0.8 %. Everything in the after-each-level invariant passes. The only failures left are the fix-4 animations (`wave`, `gem-slosh`, `bt-orbit`…) and, on the throttled phone, the runner (fix 8). Fix 7 isn't previewed, and the invariant can't see its GPU cost.

## 5. The soak invariant (proposed for the treadmill)

`soak.ts` checks the following and exits 1 with `--check`. With `--findings <runDir>/soak.json` it also writes the failures as treadmill findings (`sig: soak:<metric>`).

**After each level**, back on the map after a forced GC, each metric must be at most baseline × slack + allowance. A level leaves nothing behind, and a still screen asks for nothing:

| metric | budget | today |
|---|---|---|
| DOM nodes (CDP, attached + detached) | baseline + 600 | ok (+9 per level) |
| JS heap | baseline + 8 MB | ok |
| event listeners | baseline + 40 | ok |
| animations on the map | baseline + 5 | ok |
| particles | ≤ 5 | ok |
| nodes in the fx layer | 0 | ok |
| live intervals | baseline + 1 | ok |
| **rAF requests per second on the still map** | **≤ 5** | **FAIL: 120** (fixes 1, 2) |
| **live decoded audio** | **≤ 64 MB** | **FAIL after ~12 levels** (fix 5) |
| **Web Audio nodes** (`AudioHandlers`) | **baseline + 8** | **FAIL from level 2** (fix 6) |
| **`<audio>` elements alive** | **baseline + 2** | **FAIL from level 1** (fix 6) |

**While playing** (every 10 s sample):

| check | budget | today |
|---|---|---|
| endless animations the compositor can't run (a non-compositable property, or an SVG target) | ≤ 2 | **FAIL: up to 29** (fixes 3, 4) |
| endless animations running on hidden elements | ≤ 2 | **FAIL: up to 27** (fix 3) |

**On the throttled phone** (`--mobile --cpu 4`):

| check | budget | today |
|---|---|---|
| each screen's median fps | ≥ 50 | **FAIL: the runner 30–36 (median per run)** (fix 8) |
| main thread on the still map | ≤ 5 % | **FAIL: 10–12 %** (fixes 1–4) |

The renderer's footprint and RSS are reported but not judged. Under Playwright they include DevTools' copies of response bodies and Chrome's image cache (§2.2).

**How to run it:**

```
bun scripts/treadmill/soak.ts --mobile --cpu 4 --fast 2 --levels 12 --check --findings <runDir>/soak.json   # ~25 min
bun scripts/treadmill/soak.ts --levels 4 --idle 20 --stress 60 --check                                     # ~7 min smoke
bun scripts/treadmill/soak.ts --analyse playtest/soak/<run> --mobile --cpu 4                                # re-judge a finished run
```

**Wiring into `run.ts`.** Not done here, because the house rules allow new files only. Two lines are needed:

1. A `--soak` stage in `run.ts`, run nightly or with `--personas`: `sh("soak", ["bun", "scripts/treadmill/soak.ts", "--mobile", "--cpu", "4", "--fast", "2", "--levels", "12", "--out", `${runDir}/soak`, "--findings", `${runDir}/soak.json`])`.
2. `soak` added to the `inbox.ts` file pattern: `/^(sweep|critic|pics|joins|soak|persona-.*|jev-.*)\.json$/`.

Once fixes 1–6 land, delete `soak-fixes.ts` and the `--patched` flag. A plain soak should then match the "after" column.

## 6. Caveats

- **This is headless Chrome, not WebKit on an iPhone.** Chrome's rules are used as the proxy: what composites, what forces a style pass, how memory is accounted. WebKit also runs `transform`/`opacity` animations on the compositor, and also keeps the main thread busy when rAF loops run. The per-frame work removed here is work on any engine, but the percentages are Chrome's.
- **CPU throttling ×4 models a slower phone than a recent iPhone** (A15-class cores are close to the M-series cores used here). Read it as "how close to the edge", not as a prediction of fps. Heat comes from sustained load, and the still-screen numbers are the clearest signal.
- **Headless composites in software.** "GPU process CPU %" is a rough proxy for GPU work, and it can't show the cost of `mix-blend-mode` or large blurred layers on a real GPU, which is why fix 7 wasn't previewed.
- **fps comes from a 1 s probe every 10 s.** A permanent rAF loop of our own would keep the main thread producing frames and hide fix 1's effect. The probe adds at most 1 s of frames to each 10 s window.
