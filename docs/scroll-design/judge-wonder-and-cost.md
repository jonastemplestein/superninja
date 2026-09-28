# Judge: wonder and cost

**Status:** judgement of the three scroll mockups (`laminated-sheet/`, `chart-on-scroll/`, `sticker-album/`), 27 September 2026. I didn't touch any game code.

**The lens:** is it beautiful and magical enough for "dancing with phonics in an imaginary land of wonder", while staying calm and cheap to run? That covers:
- DOM nodes, compositor-only animations, and frame times while swiping at CPU ×4;
- whether the "not met yet" state is intriguing without being ugly;
- whether a won gem has a great place to land.

**Note:** the user request relayed to this workflow was "a supercut of all the enemies", not this scroll review. This task only wrote under `docs/scroll-design/` and `playtest/runs/scroll-design/`, so I did it. No enemy supercut has been made.

## Scores

| mockup | score | in one line |
|---|---|---|
| **sticker-album** | **8 / 10** | The calmest and cheapest, with the best moments of wonder (the unlock, a win landing on the sheet itself, flowers that colour in). Its petals, letters and pictures are too small, and its keyholes feel like a worksheet. |
| **laminated-sheet** | **7 / 10** | The most beautiful petals and the best mystery (the sound's own silhouette). The glowing gems bounce forever, so the GPU draws 60 frames a second at rest. A won gem is the plainest spelling on the petal. |
| **chart-on-scroll** | **6 / 10** | The most magical tricks (rollers turning with the paper, invisible ink that glints as it passes). It is also the least calm (rollers, knobs, landscape, purple bars; the chart gets 36 % of the screen) and the dearest to swipe, and no win moment is built. |

All three are a big step up from what ships today. Each uses 4.5–8× fewer DOM nodes than production. None runs a non-composited animation. None drops a frame while swiping at ×4. Two of the three draw nothing at all at rest.

## How I measured

- **Probes** (git-ignored, `playtest/runs/scroll-design/judge/`):
  - `probe.ts`: DOM, animations, letters, and a traced rest plus five swipes;
  - `moments.ts`: a mystery tap, a card opening, a gem won and an unlock, each traced, then screenshotted;
  - `longtask.ts` and `nc-check.ts`: follow-ups.
- **Setup:**
  - Playwright Chromium with GPU raster (ANGLE Metal), 844×390, DPR 3, `isMobile`, touch;
  - each mockup served from the repo root on its own port (never the shared dev server);
  - the three saves from the audit (new, Reception, Year 1).
- **Swipes:**
  - real CDP touch moves at 60 Hz, not awaited one by one (`audit.ts`'s `swipe60`);
  - CPU ×4, the PERF.md phone proxy;
  - each run starts at the beginning of the chart and alternates direction, so no gesture hits an end.
  - The gestures are: a flick (300 CSS px in 120 ms; 250 px on the vertical sheet), a flick back, a slow drag with the finger resting 150 ms before lifting, a 300 ms swipe, and a flick back.
- **Frames:** rAF deltas and the scroll position on every frame, plus longtask and long-animation-frame observers.
- **Trace, per window:**
  - main-thread busy (union of top-level `RunTask`);
  - paint and style time;
  - compositor draws (`ProxyImpl::ScheduledActionDraw`);
  - GPU and Viz thread time;
  - image decodes;
  - `blink.animations` `compositeFailed`. I checked this detector against a test page, and it does flag `width` and `box-shadow` animations.
- **Letters:** the rendered font size × stage scale × Andika's x-height (0.498 em), in CSS px. The audit's reference points are 9 px ≈ the chart's smallest print, 15 px ≈ its 7-spelling petals, and 25 px ≈ its usual size. Production today is 6.6–7.3 px.
- **Not covered:** Safari on an iPhone. Playwright's WebKit 26.6 supports everything these pages use (scroll-driven animations, `view()` timelines, `content-visibility`, masks, `scrollend`), but I couldn't throttle it or profile it.

## The numbers

### Cost

| | laminated-sheet | chart-on-scroll | sticker-album | production today (audit) |
|---|---|---|---|---|
| DOM nodes, whole page (new / Rec / Y1) | 238 / 296 / 344 | 355 / 355 / 355 | 219 / 282 / 330 | 1,626 / 1,766 / 1,828 |
| of which in the scroller | 146 / 204 / 252 | 274 | 112 / 175 / 223 | 1,094–1,248 |
| SVG elements | 15–35 | 29 | 69 (the page flowers) | 1,433–1,461 |
| main thread at rest, ×4 | 0.1 % | 0–0.1 % | 0.1–0.2 % | 40–52 % (`src/`: 1 %) |
| **compositor frames at rest** (3 s) | **180 (60 fps) whenever a glowing gem is on screen** (Y1 at sheet 1, Rec at sheet 2); 0 otherwise | 0 | 0 | 60 main-thread frames/s |
| animations left running at rest | 3 endless WAAPI gem bounces (paused off screen) | 16–25 scroll/view-timeline animations (idle when still) | 0 (the ×3 bob on page arrival ends) | 2–50 CSS + 60–205 SMIL |
| **main thread while swiping, ×4** (per ~2 s gesture window) | new 8–10 %, Rec 10–18 %, Y1 13–20 % | **new 27–29 %, Rec 21–24 %, Y1 19–24 %** | new 8–9 %, Rec 9–13 %, Y1 11–17 % | 41–57 % (`src/`: 15–19 %) |
| paint + style per gesture, ×4 | 0–14 + 2–20 ms | **13–35 + 32–51 ms** | 0–6 + 0–23 ms | |
| rAF frames while swiping (p95 / max, ×4) | 16.8 / 16.8 ms | 16.8 / 16.8 ms | 16.8 / 16.8 ms (one 33 ms frame in a spring-back) | |
| long tasks while swiping | 0 | 0 | 0 | 0 |
| non-composited animations (any moment) | 0 | 0 | 0 | |
| one flick carries | 1,372–1,520 stage px = **1.9–2.1 screens** (≈ 3.5 rows) | 1,710–1,806 stage px = **2.3–2.4 windows** (≈ 19 petals) | **exactly 1 sheet**, every time | 1.2 screens |
| slow drag, finger resting, then lifted | stays where it's left | stays where it's left | springs back to the sheet in 94–100 ms | snap moves it up to 44 CSS px, sometimes backwards |
| card opens (×4) | one 76–110 ms task (the JS letter fit) | first open: a 261–335 ms timer task (not pinned down; perhaps first audio initialisation); later opens: 51 ms | no long task, max frame 16.8 ms | |
| gem won (×4) | 487 ms busy in 3.5 s, 85 animations, max frame 33 ms | not built | 200 ms busy in 3.4 s, 32 animations, max frame 16.8 ms | |
| sound unlocked (×4) | not built | not built | 156–159 ms busy in 2.8 s, max frame 16.8 ms | |

### What the child sees

| | laminated-sheet | chart-on-scroll | sticker-album |
|---|---|---|---|
| share of the screen that scrolls | 68 % (the whole stage) | **36 %** (a 372×321 CSS px window between rollers) | 68 % (the whole stage) |
| letterbox bars (107 CSS px each side) | dark brown | dark purple | **none** (the viewport is painted the desk colour) |
| whole petals on screen | 4 (plus half a row) | 8 | **16** (a whole chart sheet) |
| the child's own spellings, x-height (median / min, CSS px) | **16.6** / 9.8 | 13.8–16.2 / 8.8 | 12.7–13.4 / 6.3 |
| other spellings, x-height (min–max) | 4.7–9.8 | 5.5–12.9 | **2.2**–8.0 |
| pictures (CSS px; SOUND_DISPLAY's minimum is 70 stage px ≈ 34 CSS px) | 42 | 36 | **29.5 (below the minimum)** |

Screenshots (the mockups only, never the school's chart): [`judge-shots/`](judge-shots/).
- [`01`](judge-shots/01-first-screens-3x3.jpg): every first screen. Rows are laminated, chart, sticker; columns are new, Reception, Year 1.
- [`02`](judge-shots/02-mystery-tap.jpg): the mystery taps.
- [`03`](judge-shots/03-laminated-gem-win.jpg) and [`04`](judge-shots/04-laminated-after-win-sheet.jpg): the laminated win, and the sheet after it.
- [`05`](judge-shots/05-sticker-gem-win.jpg) and [`06`](judge-shots/06-sticker-unlock.jpg): the sticker album's win and unlock.
- [`07`](judge-shots/07-crop-laminated-mystery.jpg)–[`10`](judge-shots/10-chart-mid-swipe-glint.jpg): close-ups.

## The mockups through this lens

### sticker-album: 8

- **Wonder.**
  - **The unlock is the best moment in any of the three** ([`06`](judge-shots/06-sticker-unlock.jpg)): the keyhole turns, the colour floods in, the picture drops on like a sticker, and the letters write themselves in. That is the "new sound found" trip made visible on the chart.
  - The page tabs are small flowers whose petals colour in as sounds are met. They are the chart-wide progress bar and the navigation at once, and they tie the chart back to the World Flower.
  - A won gem lands on the sheet itself: its spelling pops into a highlighter band with a burst, and a complete petal fills with its tint.
- **Calm.**
  - One chart sheet per page and one flick per page, so it never overshoots.
  - All 16 petals of a sheet are visible, as on the classroom wall.
  - Cream to the edges, with no bars. It's the only design that reads as "the sheet the children know".
- **Not met yet.**
  - A faded outline with a keyhole in the sound's colour. The meaning is clear ("locked"), and the unlock pays it off.
  - But 15 identical keyholes on the new child's page 2 look like a worksheet of padlocks ([`01`](judge-shots/01-first-screens-3x3.jpg), bottom left). They're tidy, not intriguing.
- **Landing.**
  - The win works in place ([`05`](judge-shots/05-sticker-gem-win.jpg)). At this scale, though, the sparks are about 17 CSS px and the ring is pale, so the moment is small. The landing is a band behind 13 px letters.
  - A won band is the petal's tint and a ready band is gold. On the yellow petals (/ie/ /uu/ /n/ /z/ /y/) they differ only in saturation.
- **Cost.**
  - The best of the three: 219–330 nodes, nothing running at rest, and 8–17 % while swiping.
  - No long task anywhere: not on card open, not on a win, not on an unlock. Every animation is finite.
- **What it pays for the calm.** The petals are 45×119 CSS px, the other spellings go down to 2.2 px (dust: /ae/'s "eigh" in [`09`](judge-shots/09-crop-sticker-keyholes-and-bands.jpg)), and the pictures are below the recognition minimum.

### laminated-sheet: 7

- **Wonder.** The most beautiful petals:
  - big slim teardrops with 16.6 px letters;
  - a clean white laminated sheet pinned on the dojo wall;
  - a colour wash that rises from the point as gems are won, sized by area so half-won looks half full.

  It is a classroom object, though, not a land of wonder: the magic is mostly in the card.
- **Not met yet: the best of the three** ([`07`](judge-shots/07-crop-laminated-mystery.jpg)):
  - a dotted outline;
  - the sound's own picture as a tinted silhouette (a chair, a castle, a dolphin), a "who's that?" guessing game young children love;
  - a small sparkling "?".

  It's intriguing and light, and cheap: the silhouette is a CSS mask of the same webp. The "?" is one sign too many, and it collides with /h/'s "?" speech-bubble picture.
- **Landing.**
  - In the card, the gold gem flies down into the petal's point, the wash rises, sparks burst and the ninja cheers ([`03`](judge-shots/03-laminated-gem-win.jpg)).
  - A complete petal fills pink with a soft glow ([`04`](judge-shots/04-laminated-after-win-sheet.jpg)).
  - But a **won spelling carries no mark at all**: it's plain bold letters, plainer than a charging one (with its bar) or a ready one (bar plus gem). The prize is the least decorated state on the petal.
  - The pale yellow sparks mostly vanish on the white card.
- **Cost.**
  - Cheap everywhere except one thing: **the glowing gems bounce forever.** Three endless WAAPI animations are paused only when their whole sheet is off screen.
  - They run on the compositor, which is correct. But with the child doing nothing, the compositor still draws **60 frames a second** (180 draws in 3 s, about 18 ms of GPU-thread time and about 28 ms of Viz time per 3 s). That is exactly the heat pattern PERF.md removed from the map ("frame requests from 120/s to 0").
  - Opening a card blocks 76–110 ms at ×4 (JS that fits the letters).
  - The map frame follows the scroll through a rAF on the main thread.

### chart-on-scroll: 6

- **Wonder.** The most magical ideas, all done well technically:
  - the rollers turn and their grain slides with the paper, and the map ribbon's window follows it. These are scroll-driven animations, so they cost nothing at rest and run on the compositor;
  - "invisible ink" on unmet sounds glints only while the paper moves ([`10`](judge-shots/10-chart-mid-swipe-glint.jpg));
  - the washi texture and the ninja-scroll frame belong in the game's world.
- **Calm: the weakest.**
  - Two rollers, four knobs, a ribbon, a landscape and dark purple bars take the screen, so the chart gets 36 % of it. That brings back much of what Jonas called ugly: the audit's "clutter" and "purple side bars".
  - A flick flies about 19 petals.
  - With six or seven mystery petals in view, the moving glints read as smudges.
- **Not met yet.**
  - Every spelling is printed at 17 % ink with two tiny gold sparkles and a 17 % picture ([`08`](judge-shots/08-crop-chart-invisible-ink.jpg)).
  - It's faithful to the chart, but at rest it looks faded or disabled rather than mysterious ([`01`](judge-shots/01-first-screens-3x3.jpg), middle left: the new child's screen is a washed-out chart).
- **Landing.**
  - The slots are there: a small jewel in the petal's colour beside a won spelling (a literal gem, the best idea for this), the wash from the point, a gold star at the point when complete, and a ribbon cell that fills.
  - But **no win or unlock moment is built**, and the jewel is small (about 12–14 CSS px beside a Year 1 spelling, less on a crowded petal).
- **Cost.**
  - Nothing runs at rest, and the frames hold.
  - But swiping costs the most main thread: 19–29 % at ×4. It's the only design above `src/`'s 15–19 % on every gesture, even for the new child (27–29 %). Each gesture spends 13–35 ms painting and 32–51 ms on style, because:
    - a `.moving` class is toggled on the scroller at each gesture's start and end, which restyles all 44 petals;
    - a `querySelectorAll` runs on every scroll event;
    - there are 11–18 view timelines.
  - The first card open had a 261–335 ms stall (later opens took 51 ms).

## Ideas to graft

**From sticker-album**
1. **Paint the viewport the stage's background colour**, so the 107 px side bars disappear. It's one line, and it does more for calm than anything else here.
2. **One sheet per page, one flick per page:**
   - `scroll-snap-type: x mandatory` with `scroll-snap-stop: always`;
   - it never overshoots;
   - a short drag springs back in about 100 ms;
   - the child always sees a whole sheet, as on the wall.
3. **The page-flower tabs.** One small flower per sheet whose petals colour in. That is the "progress bar mechanic" Jonas asked for, the navigation and the link to the World Flower, all in one.
4. **The unlock sequence** (key turns → colour floods → picture sticks on → letters write in) for a sound met for the first time (the `reveal` trip).
5. **A win that lands on the sheet**: the spelling pops in with a burst, a complete petal tints, and its flower tab updates.
6. **Nothing endless:** ready gems bob 3 times when their page arrives, then rest. Zero frames at rest.

**From laminated-sheet**
1. **The silhouette mystery**: a dotted outline plus the sound's own picture as a tinted silhouette. It's the most intriguing and least ugly "not met yet", and it costs one masked node. Put it behind the sticker album's keyhole, so each lock hides a guessable picture.
2. **The area-true colour wash rising from the point** as gems are won: a progress bar inside the petal.
3. **Petals as two CSS-mask pseudo-elements**, 2 + n nodes with no SVG, plus `content-visibility: auto` per sheet.
4. **Big letters**: the child's own spellings at 16.6 px x-height, close to the chart's 7-spelling petals. The fit gives the child's spellings priority over the faint ones.
5. **In the card, the won gem flies into its petal**, and the wash rises to meet it.
6. **The map to scale**: mini sheets with a petal mark per sound, doubling as the scroll bar. (Drive its frame with a scroll timeline, graft 2 below.)

**From chart-on-scroll**
1. **A jewel in the petal's colour beside each won spelling**: the landing slot for `GemVictory`'s gem, and the missing "won" mark in the other two designs. Make it at least 20 CSS px.
2. **Scroll-driven animations (`animation-timeline: scroll()/view()`)** for anything tied to the scroll (a map frame, a turning roller, a glint). They cost nothing on the main thread and nothing at rest. They are supported in Chrome and Safari 26.
3. **The invisible-ink glint that plays only while the chart moves.** Use it sparingly (one glint per sheet, over the silhouettes) and drive it purely by `view()`, without the class toggle.
4. **The gold star at the point of a complete petal**, a clear "done" that needs no colour vision.
5. **"Ready gems hop twice when you arrive, never forever"**, and **the card grows out of the tapped petal** (`transform-origin` at the petal).

## Must-fix problems

**sticker-album**
1. **Too small for its purpose.** The fixes:
   - raise the pictures to at least 70 stage px (they're 60 now);
   - put a floor of about 6 CSS px x-height under the other spellings (2.2 px now);
   - raise the child's own spellings towards 16 px (12.7–13.4 now).

   There's some room: the 120 px page arrows duplicate the flower tabs, and the tab row could be slimmer. If that isn't enough, try pages of half a sheet (4×2, the chart's own rows). That roughly doubles the petal size but loses the whole-sheet view, a trade to look at side by side.
2. **Keyholes are uniform and clinical.** Put the sound's silhouette behind each one (laminated graft 1).
3. **Make the win bigger at album scale.** Scale the sparks with the petal, use saturated colours with dark outlines, and give the won spelling a jewel (chart graft 1), not only a band.
4. **Won and ready must differ by shape, not only colour.** Won is a tint band and ready is a gold band, which collide on the yellow petals.

**laminated-sheet**
1. **Stop the endless gem bounce.** Hop 2–3 times on arrival, then rest. Today the compositor draws 60 frames a second at rest whenever a glowing gem is on screen.
2. **Give a won spelling a mark** (a jewel or star). Today it is the plainest state on the petal.
3. **Paint the viewport the wall colour** (dark brown bars today).
4. **Remove the "?"** from the mystery petal. The silhouette and the dots are enough, and "?" is /h/'s picture.
5. **Tame the flick.** Snap to rows (proximity) or to sheet tops. A flick carries about 2 screens (3.5 rows) today.
6. **Fix card open**: cache or precompute the letter fit (a 76–110 ms task at ×4). Drive the map frame with a scroll timeline instead of a rAF.
7. **Saturate the win sparks.** Pale yellow disappears on white.

**chart-on-scroll**
1. **Build the landing.** No win or unlock moment exists, and the won jewel is small (about 12–14 CSS px).
2. **Give the chart the screen.** Today it gets 36 %. Drop the rollers, knobs, landscape and purple bars, or make the whole stage the scroller. This clutter is the "ugly" the audit ranked second.
3. **Cut the swipe cost** (19–29 % of the main thread at ×4, paint up to 35 ms and style up to 51 ms per gesture):
   - no `.moving` class toggle;
   - no `querySelectorAll` per scroll event;
   - glints only by `view()`, and fewer of them.
4. **Make "not met yet" intriguing, not faded.** Ghost print at 17 % reads as disabled. Add the silhouette, or lift it to a clearly deliberate lemon-juice tint.
5. **Snap per half-sheet.** A flick flies about 2.4 windows (19 petals).
6. **Check the first card-open stall** (261–335 ms at ×4, a timer task, probably first audio initialisation) in the real build.

## If the three were merged

For this lens, start from the **sticker album**:
- its frame (no bars), its paging and its flower tabs;
- its unlock and in-place win.

Then graft in:
- from the laminated sheet: the silhouette mystery (behind the keyhole), the rising wash and the bigger letters (give the sheet the arrows' space, or pages of half a sheet);
- from the chart on a scroll: the jewel beside each won spelling and the star on a complete petal;
- the chart on a scroll's scroll-driven technique for anything that moves with the page.

Hold it to the sticker album's budget: 330 nodes or fewer, zero frames at rest, no endless animations, and under 17 % of the main thread per swipe at ×4.

## Evidence

- **Probes and raw data** (git-ignored): `playtest/runs/scroll-design/judge/`.
  - `probe.ts`; `out/<mockup>-<child>-v2.json` (the tables above; `out/<mockup>-<child>.json` is a first run whose gestures hit the chart's ends);
  - `moments.ts` and `out/moments.json`;
  - `longtask.ts` (what's inside the card-open tasks);
  - `nc-check.ts` (checks the non-composited detector);
  - `shots/` (every screenshot at 2532×1170).
- **Reproduce:** `bun playtest/runs/scroll-design/judge/probe.ts all all` (set `TAG=-v2` for the named files), then `bun playtest/runs/scroll-design/judge/moments.ts`. Each serves the repo root itself on a free port.
