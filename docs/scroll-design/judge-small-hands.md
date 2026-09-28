# Judge: can small hands use it?

**Status:** one judge's verdict on the three petal-scroll mockups, 27 September 2026, about 06:00 BST. It uses one lens only: **can a 3–8-year-old use it on a phone in landscape?** That means tapping, swiping, finding a sound, opening and closing a petal's card, and reading the spellings at 390 px tall. Other judges cover how much it looks like the school chart, performance and fun.

**What was tested:** [`laminated-sheet/`](laminated-sheet/), [`chart-on-scroll/`](chart-on-scroll/) and [`sticker-album/`](sticker-album/), served from the repo root on a private port. Every test ran in Playwright Chromium at **844×390 CSS px, DPR 3, `isMobile`, `hasTouch`**. The touches were real touch events (CDP `Input.dispatchTouchEvent`), never mouse drags, and there were about 60 gestures per mockup. The children were Year 1 (all touch tests), Reception and new (arrival screens). The scripts and raw JSON are in `playtest/runs/scroll-design/judge-small-hands/` (git-ignored). The evidence shots are in [`judge-small-hands/`](judge-small-hands/): green outlines are tap targets of at least 44×44 CSS px, red ones are smaller.

**Units:** all sizes are CSS px on the phone. On an 844×390 phone (about 460 ppi, DPR 3), **1 CSS px ≈ 0.17 mm**, so 44 px ≈ 7.3 mm. The game's stage is 1280×720, scaled by **0.49**, so 100 stage px ≈ 49 CSS px. "x-height" is the height of a lowercase *a*, *e* or *o*. It is the size that matters for beginner readers.

---

## 1. Verdict

| mockup | score | in one line |
|---|---|---|
| **laminated-sheet** | **8 / 10** | It is the safest to touch and the easiest to read. It scrolls from anywhere, and a tap that catches the moving sheet never opens a card. It has the biggest petals (110×207) and the biggest letters (the child's own spellings have a median x-height of 16.7 px). But only **4 petals** fit fully on screen, because it scrolls along the phone's short side. |
| **sticker-album** | **7.5 / 10** | It is the easiest place to find a sound. Any swipe of 80 px or more turns exactly one page, from anywhere on screen. A whole sheet (16 petals) is visible at once, the page tabs and arrows jump in one tap, and any tap outside the card closes it. But the petals are only **50 px wide**, and some of the child's own spellings are **6.3 px** tall (about 1 mm). |
| **chart-on-scroll** | **5 / 10** | The petal sizes are good (90×164) and the word cards on the card are the best of the three. But only the paper window scrolls: that is **44 % of the screen width**, so swipes starting on the ninja, the rollers or the frame do nothing. A tap that stops the moving paper opens a card. With a card open, half the spots "outside the card" are live buttons (Home, the World Flower, Hear it again, Help). |

**The winner on this lens is laminated-sheet**, narrowly ahead of sticker-album. They fail in opposite ways. Laminated is comfortable per petal but has too little overview. Sticker-album has the whole overview but petals too small to read. The best result for small hands is **half-sheet pages** (§4): sticker-album's paging, tabs and scrim, with 4×2 petals per page (a half-sheet, the framing chart-on-scroll uses) filling the stage. Laminated's tap guard, letter fitting and silhouettes go on top. Half a sheet keeps the class chart's own four columns, which the 8×2 sheet in sticker-album does not.

---

## 2. Scorecard

| weight | criterion | laminated-sheet | chart-on-scroll | sticker-album |
|---:|---|:-:|:-:|:-:|
| 20 % | Tap targets are at least 44 px, on the chart and on the card | 8 | 5 | 7 |
| 25 % | Scrolling is smooth, works from anywhere and never fights a tap | 9 | 4 | 8 |
| 20 % | It's easy to find a sound | 6 | 6 | 9 |
| 15 % | The card opens and closes easily | 8 | 5 | 9 |
| 20 % | Spellings are legible at 390 px tall | 9 | 6 | 5 |
| | **Weighted total** | **8.05** | **5.15** | **7.55** |

---

## 3. What I measured

### 3.1 On arrival (Year 1)

| | laminated-sheet | chart-on-scroll | sticker-album |
|---|---|---|---|
| Area that scrolls | the whole stage (629×354) | the paper window only (**372×321**) | the whole stage (629×354) |
| How far there is to go | 6.9 screen heights, vertical | 5.8 windows, horizontal | 3 pages, horizontal, snapping |
| Petals fully on screen | **4** (plus 4 cut off) | 8 | **16** |
| Petal hit box | **110×207** (the whole cell) | 90×164 | **50×140**, neighbours touching |
| Picture on the shoulder | 42×42 | 36×36 | 30×30 |
| Child's own spellings, x-height (all 47–49 of Year 1's) | min 9.8 · p25 14.7 · **median 16.7** | min 8.8 · p25 9.7 · median 13.8 | **min 6.3** · p25 9.6 · median 12.7 |
| Smallest own spellings | – | /s/: s ss x at 8.8 | **/k/: c k ck q x at 6.3** (font about 12.6 px); /s/ at 7.4–7.6 |
| Faint (not-yet) spellings, x-height | 4.5–9.8 | 5.6–9.4 | **2.2–5.6** (texture, not letters) |
| Frame buttons | 49 (Home, Hear it again, World Flower), Help 61 | 49–57, Help 61 | 49, arrows 59, tabs 74×49, Help 61 |
| Tap targets under 44 on the chart screen | none | **the ribbon: 366×18** (30 tall with its padding) | none |

My legibility rule of thumb (not a standard): early-reader books print at an x-height of about 3 mm at arm's length. At phone distance that needs an x-height of about **12 px (2 mm)** for comfort. 9–12 px is readable with effort, and below 9 px is too small for a beginner. On the card, where the reading happens, aim for 16 px or more.

### 3.2 Touch: swipes and taps (Year 1, real touch events)

| gesture | laminated-sheet | chart-on-scroll | sticker-album |
|---|---|---|---|
| Flick starting on a petal (240 px in 180 ms) | scrolls 316 px, no card | scrolls 334 px, no card | turns 1 page, no card |
| Slow drag (200 px in 1.2 s) | follows the finger 1:1 after about 18 px of slop | same | same, then snaps to the next page |
| Lazy swipe (80 px in 150 ms) | moves 88 px | moves 83 px | **turns a page** |
| Diagonal flick, 35° off the axis | works | works | works |
| Swipe in the wrong direction or 50° off the axis | nothing, no card | nothing, no card | nothing, no card |
| Swipe starting on the ninja, the frame, the top or the bottom | **5 of 5 scroll** | **only 1 of 5 scrolls** (the ninja, the frame, the rollers and the ribbon are dead) | 4 of 5 (the tab strip is the exception, correctly) |
| Swipe starting in the letterbox bars (107 px each side) | nothing | nothing | nothing |
| Tap that catches the chart while it is still moving | **never opens** (3 of 3) | **opens a card (2 of 2)** | opens a card 3 of 6 times, and the tap doesn't stop the snap |
| Wobbly tap (the finger slides 6 or 12 px) | opens | opens | opens |
| Press and hold (900 ms) | opens | opens | opens |
| Hold 300 or 700 ms, then drag | scrolls, no card | scrolls, no card | turns a page, no card |
| Double tap on a petal | card stays open (the 2nd tap lands on the card) | same | same (the 2nd tap plays the sound again) |
| Tap on the petal's picture | opens that petal (4 of 4) | opens that petal (4 of 4) | opens that petal (4 of 4) |
| Tap on a sound not met yet | shakes, Sensei says it's a secret, no card | ink stirs, Sensei speaks, no card | key wiggles, clunk, Sensei speaks, no card |

### 3.3 Finding a sound (Year 1, from the opening view)

I modelled the child as flicking while the sound is far away and then slowly dragging it into view.

| | laminated-sheet | chart-on-scroll | sticker-album |
|---|---|---|---|
| Moves to /k/ (sheet 2) | 5 | 5 | 1–3 |
| Moves to /sh/ (sheet 3) | 7 | 8 | 2–3 |
| Moves to /zh/ (the far end) | 7 | 7 | 2 |
| One-tap jump | the map: **53×203**, a tap or a drag. A tap at its foot showed /sh/ and /zh/. A tap 10 px to its left does nothing. | the ribbon: **366×18** (30 tall in practice). A tap at its end works, but a drag along it does nothing. | three rosette **tabs of 74×49** and **arrows of 59×59**. The Back arrow is disabled on page 1. |

### 3.4 The petal's card

| | laminated-sheet | chart-on-scroll | sticker-album |
|---|---|---|---|
| Tap to open (card fully there) | 136 ms | 117 ms, grows out of the petal | 128 ms, grows out of the petal |
| Close button | 49×49 | 49×49 | 45×45 |
| Tap outside the card: 8 spots in the stage | 6 close; **top-left hits Home, bottom-right hits Help** | 4 close; **top-left hits Home, top-right Hear it again, right-middle the World Flower, bottom-right Help** | **8 of 8 close** |
| Swipe on the card | the chart behind stays still, the card stays open | same | same |
| Letters on the card, own spellings (x-height) | **22.8** | 19.5 | 13.7 |
| Targets under 44 | **the gem battle button, 41×41**; faint spellings as buttons, 44×17 each | **the ready gem, 36×39**; gem lines 58×34 and 47×27 | none (gem slots 46×49, words 47 tall, close 45) |
| Word cards | 105×49 with a picture | **95×69**, picture above the word | 51–97×47 |

### 3.5 Cost (5 flicks at 4× CPU slowdown)

All three are cheap: **330–355 DOM nodes** (the live World Flower had 1,900), **no long tasks**, and a frame p95 of 16.8 ms. Scrolling is native in all three, so scrolling itself won't separate them. Chart-on-scroll does the most while moving (a glint on every mystery petal, rollers driven by the scroll), and it was still fine.

---

## 4. The recommendation for small hands: half-sheet pages

- **Paging:** sticker-album's engine: `scroll-snap-type: x mandatory` with `scroll-snap-stop: always`, and the scroller filling the stage. The rosette tabs and the 59 px arrows stay.
- **Pages:** each page is half a class sheet, **4 across × 2 rows**, so 6 pages in all. That is the framing chart-on-scroll uses, but here it fills the stage and isn't a 372 px window. On a phone the petals come out at about **120×150 px**, more than twice sticker-album's 50×140. The child's own spellings can then be fitted at an x-height of 12 px or more.
- **Tabs:** 3 rosettes (one per sheet), each with 2 halves, or 6 tabs.
- **Scrim:** sticker-album's scrim, above every frame button.
- **From laminated-sheet:** the tap guard, the whole cell as the button, silhouette pictures on sounds not met yet, and its letter fitting.
- **From chart-on-scroll:** the card grows out of the petal, and ghost example words fill a card that would otherwise be nearly empty.

---

## 5. Best ideas to graft

**From laminated-sheet**
1. **The tap guard.** A click doesn't open a card if the sheet moved more than 6 px since `pointerdown` (`scroller pointerdown → downT; click → if |scrollTop − downT| > 6 return`). It was the only mockup where a tap that catches a moving chart never opened a card (3 of 3).
2. **The scroller covers the whole stage.** A swipe that starts on the ninja, the frame, a petal or the sheet margin all scroll (5 of 5).
3. **Big fitted letters.** The child's own spellings are bold, with an x-height of about 15–17 px on the chart and 23 px on the card. The not-yet spellings shrink around them, so the petal still shows its whole list.
4. **Silhouettes on sounds not met yet.** The picture is kept as a coloured silhouette with a "?" sparkle. A child who can't read can still find "the one with the chair", and it stays a bit mysterious.
5. **The map as a scrub bar.** It is 53×203, and a tap or a drag jumps anywhere. It has a mark per petal that fills with colour, so it doubles as the progress bar.
6. **The whole cell is the button** (110×207), including the picture on the shoulder.

**From sticker-album**
1. **Paging that forgives lazy swipes.** Any swipe of 80 px or more, diagonal up to 35°, from anywhere on the stage, turns exactly one page. There is no overshoot and no hunting.
2. **Rosette tabs (74×49) and big arrows (59×59).** A one-tap jump to any page, and the rosettes colour in as the child progresses. The Back arrow is disabled at the first page.
3. **A scrim over everything while the card is open.** Every tap outside the card closes it (8 of 8), and nothing navigates away by accident.
4. **Keyhole, key wiggle and clunk** on a sound not met yet: an unmistakable "not yet" without words.
5. **Gem slots as tiles** on the card, all at least 44 px, each with its own charging bar.
6. **A whole page per view** (16 petals), and the page-turn "flip" sound with the ninja hopping when a page lands.

**From chart-on-scroll**
1. **The card grows out of the tapped petal** (`transform-origin` set to the petal), so the child sees where it came from and where it goes back to.
2. **Ghost example words.** If fewer than 4 words have been found, Sensei's examples fill the card in invisible ink, so the card is never empty.
3. **The biggest word cards** (95×69, the picture above the word) and the "Hear about these words" Sensei button.
4. **Half-sheet framing:** it opens on the four columns that hold the child's newest sound, which gives 8 petals per view.

---

## 6. Must-fix problems

**Shared by all three**
- **The letterbox bars are dead.** On an 844×390 phone, the 1280×720 stage leaves **107 px bars on both sides**, a quarter of the width. A swipe there does nothing (0 px in all three), and a tap there doesn't close a card. The World Flower screen should let its scroller and scrim reach the full viewport width, or at least catch taps there.

**laminated-sheet**
1. **The gem battle button is 41×41.** It is the most exciting button on the card, so it should be 90 stage px or more (at least 44 px on the phone).
2. **The faint spellings on the card are buttons 44×17**, five stacked edge to edge. Merge them into one "not yet" target, or make them inert.
3. **Only 4 petals fit fully on screen.** Vertical scrolling runs along the phone's short side, so a row of 207 px leaves the second row cut in half, and /sh/ or /zh/ take 7 swipes. Fit 2 full rows per screen, or move to half-sheet pages (§4).
4. **Home and Help stay live above the scrim.** A child tapping the top-left or bottom-right corner "outside the card" goes Home or starts Help. Raise the scrim above them, or make them inert while a card is open.
5. **The map's edge is tight.** Missing it by 10 px lands on the sheet. Pad its hit area to about 64 px wide.

**chart-on-scroll**
1. **Only the paper window scrolls** (372×321 px, 44 % of the width). Swipes that start on the ninja, the rollers, the frame or the ribbon move nothing (0 px, 4 of 4 starts). The whole stage needs to be the scroller.
2. **A tap that stops the moving paper opens a card** (2 of 2). Add laminated's guard.
3. **With a card open, 4 of 8 spots outside it are live buttons**: Home, Hear it again, **the World Flower (which leaves the screen)** and Help. The scrim must cover the frame.
4. **The ready gem on the card is 36×39 and only talks.** The gem lines are 58×34 and 47×27. The ready gem should be at least 44 px and lead to the gem battle.
5. **The ribbon is 18 px tall** (30 with its padding) and ignores drags. Make it 44 px or taller and let it scrub.
6. **Year 1's own spellings are small**: p25 x-height 9.7, the /s/ petal 8.8. Raise the floor to 12.

**sticker-album**
1. **The child's own spellings are too small.** The /k/ petal's c, k, ck, q and x have an x-height of **6.3 px** (about 1 mm), /s/ is 7.4–7.6 and p25 is 9.6. The not-yet print is 2.2–5.6 px, which is texture, not letters. Show fewer petals per page (§4), or drop the not-yet print on dense petals, so own spellings stay at 9 px or more (12 for comfort).
2. **The card's letters are the smallest of the three** (x-height 13.7) on a card with a lot of empty space. Roughly double the gem slots. The card is where the reading happens.
3. **The petals are 50×140 px and touch each other.** That is the narrowest target of the three (about 8 mm), so a mis-aimed tap opens the neighbour. It at least plays that sound, so the child hears the mistake. Wider petals (§4) fix this.
4. **A tap during a page snap opens a card** (3 of 6 while the page was still moving), and it doesn't stop the snap. Ignore taps within about 150 ms of the last scroll event.
5. **Locked petals have no picture, and the pictures are only 30 px.** A non-reader can't look for "the train" until it's unlocked. Use laminated's silhouettes.
6. **Close (45×45) and Hear the words (45×45) are borderline.** Make them 50 or more.

---

## 7. Method and caveats

- **Touch.** CDP `Input.dispatchTouchEvent`, with a start, a move every 16 ms and an end, in a 12 px touch radius. Swipes, slow drags, holds, wobbles and double taps were scripted with the timings in §3.2. A "move" when finding a sound is one swipe that settled before the next.
- **Letter sizes.** The computed font size times the stage scale, times Andika Bold's x-height ratio (0.498, measured with canvas `measureText`). The Year 1 figures cover every one of the child's own spellings (won, ready or charging) across the whole chart, not only the first screen.
- **Tap targets.** `getBoundingClientRect` of every live button, petal, tab, map, slot and word. Hidden elements (opacity 0 or pointer-events none, such as chart-on-scroll's card while it is closed) and elements clipped out of view are excluded.
- **Outside-the-card probes.** Eight stage points (the four corners, the middle of both edges and the bands beside the card) were checked with `elementFromPoint`, and the scrim tap was checked with a real touch.
- **Frame timing.** This is headless Chromium on a Mac with 4× CPU slowdown, not a phone, so it is only useful to compare the three.
- **The moving-tap result may not reproduce on an iPhone.** iOS Safari already ignores the tap that stops momentum scrolling, so the chart-on-scroll and sticker-album results are from Chromium emulation and may not reproduce there. Android Chrome is the likelier place to see it. The guard is two lines, so add it either way.
- **Screenshots.** They are all of the mockups, which use the game's own art. None of them contains the school chart.
- **Evidence in [`judge-small-hands/`](judge-small-hands/).** `*-targets.jpg` shows the chart on arrival with its tap targets outlined. `*-card-targets.jpg` shows the /ae/ card with its tap targets outlined.
- **Further shots** (the arrival screens for all three children, the double tap, the map jump) are in `playtest/runs/scroll-design/judge-small-hands/shots/`.
