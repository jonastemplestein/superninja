# The petal scroll: audit

**Status:** audit of the World Flower's petal scroll as it is today, 27 September 2026, about 04:40–05:00 BST. Written as the starting point for a redesign. It has no design proposals, only what is wrong, measured, and what a new design must keep.

**Jonas (27 Sep, verbatim):** "The scroll is ugly as fuck and barely usable. Review that and make it more similar to what the kids are used to from the image I shared with you before."

**The image** is page 23 of the school's Year 1/Year 2 parents' presentation, "The Extended Code alternative spellings". It shows two laminated A4 sheets that the children use every day in class. It is not in this repo (the repo is public). Section 2 describes it in words.

**What was audited:** production, `https://superninja.templestein.com/play/?scene=tree` (bundle `play-DRomI6T2.js`), then the pink "Petal chart" button. It was played in headless Chromium at **844×390 CSS px, DPR 3, touch, phone mode** (an iPhone 12–15 in landscape) with three saves:

| child | save | sounds met | gems won / glowing |
|---|---|---|---|
| **new** | spellings s a t | 3 of 44 | 0 / 0 |
| **Reception** | Initial Code units 1–5 + j | 20 of 44 | 7 / 3 |
| **Year 1** | units 1–12 (to ai ay ee ea igh ie oa ow) | 32 of 44 | 26 / 5 |

"About 35" isn't possible today: only 32 sounds have a spelling the game teaches. The other 12 (/oy/ /uu/ /er/ /ar/ /ou/ /oo/ /ue/ /or/ /air/ /eer/ /zh/ /schwa/) stay in mist for every child.

The look is the same in the current `src/` (checked with a frozen build, `audit-src/`). The performance is not the same: see §3.6.

Screenshots and videos of the current game are in [`current/`](current/). The probe and the raw data are in `playtest/runs/scroll-design/` (git-ignored, §7).

---

## 1. The short version

1. **The first screen shows sounds the child hasn't met.** The scroll starts with the chart's Year 1–2 vowel petals. A new child and a Reception child both open it to **five dark "?" blobs**, and the scroll runs 13 misty petals before its first met sound (/s/). A new child's three sounds are petals 14, 30 and 33 of 44, among 41 identical blobs ([`new-whole-scroll.jpg`](current/new-whole-scroll.jpg)). /a/, the first sound every child learns, is petal 33, six screens in.
2. **You can't read the spellings on a phone.** Letters on the scroll have an **x-height of 6.6–7.3 CSS px (1.1–1.2 mm)**. At a child's arm's length (40 cm) that is about 10 arcminutes. That is a quarter of the chart's usual letter size, smaller than the chart's tiniest (the 11-spelling /or/ petal), and below the size at which adults start reading more slowly. The chart exists to show spellings, and on the scroll they are the part you can't see.
3. **Most of each petal is hexagons, not letters.** Spellings not met yet are identical dark hexagons. /s/ for a new child is "s" plus seven hexagons. Spellings the game can't teach at all look the same, so a finished, glowing /g/ petal still shows three hexagons the child can never get.
4. **It looks nothing like the chart.** The chart is white paper, thin coloured outlines and black letters in a column. The scroll is dark purple mist, parchment, rollers, a blurred landscape, coloured tiles, tints, glows and sparkles. Around it sit a 44-dot vine, a legend and a mini flower. The petals get **24 % of the screen**.
5. **Swiping works but feels loose.** In Chrome the scroll is composited and holds 60 fps under real touch. Around that:
   - only the band scrolls, and it is a quarter of the screen;
   - one flick carries 1.2 screens into look-alike mist;
   - after the finger lifts, the snap moves the scroll by itself, **up to 44 CSS px, and 4 times in 10 backwards**;
   - the chart nudges itself on opening;
   - it is 8 screens end to end.
6. **The production scroll never rests.** At phone speed (CPU ×4), with the child doing nothing, it keeps the main thread **40–52 % busy** at 60 frames a second. The cause is the SVG mist's SMIL animations and the gem glows. The current `src/` (PERF.md fix 9, not yet deployed) cuts that to **1 %**, and swiping to 15–19 %. The redesign must not bring it back.
7. **The detail card is the good part.** Its jewels (x-height 1.9–2.4 mm), picture, speaker, example words and Practise gate work. What doesn't: its "words found" row is back to 1.2 mm letters, and it is reached from a scroll that hides the petal you want.

---

## 2. The chart and the scroll: what a child would notice

**The chart:** two A4 sheets (210×297 mm), each a 4×4 grid of 16 petals, 32 petals in all.
- **Petals.** Each is a slim downward teardrop, about 32×68 mm (width:height ≈ 1:2.1), with a thin outline about 1 mm wide in the sound's colour and nothing inside but letters.
- **Spellings.** Every spelling of the sound is there, one per line, in a column down the petal. They are black, in an infant print with a single-storey a and g.
- **Letter size.** The more spellings a petal holds, the smaller its letters. The x-height is 4.3–4.8 mm for 2–4 spellings (/oy/, /e/, /s/), 2.4–2.8 mm for 7 (/ae/), and 1.3–1.7 mm for 11 (/or/).
- **Picture.** A small picture (about 9 mm) sits on the top-right shoulder, over the outline.
- **Page.** White space, no background and no states. A sheet never moves, so a child knows /ae/ is top left.

**The scroll** is one row of 44 petals on a parchment band between two wooden rollers. Whole-scroll strips: [`new-whole-scroll.jpg`](current/new-whole-scroll.jpg), [`reception-whole-scroll.jpg`](current/reception-whole-scroll.jpg), [`year1-whole-scroll.jpg`](current/year1-whole-scroll.jpg).

| # | What a child would notice | The chart | The scroll today |
|---|---|---|---|
| 1 | **How much you see** | a whole sheet: 16 petals at once, both sheets 32 | 5 petals at a time (3–6), one row 8 screens long; about an eighth of the chart |
| 2 | **Where a petal is** | fixed: /ae/ top left of sheet 1, /e/ top left of sheet 2; position is a memory cue | position is a scroll offset that changes all the time; the two sheets are one row with a yellow dot between them |
| 3 | **What's there first** | the sheet as it is | for the new and Reception child, five dark "?" blobs ([`new-02`](current/new-02-first-screen-all-mist.jpg), [`reception-01`](current/reception-01-first-screen-all-mist.jpg)). For Year 1, four met petals and one blob, then eight blobs in a row ([`year1-02`](current/year1-02-mist-mid-sheet.jpg)) |
| 4 | **Sounds not on the chart** | none (the sheet is the Extended Code) | 12 more (/a/ /p/ /b/ /w/ /y/ /sh/ /ch/ /th/ /dh/ /ng/ /zh/ /schwa/) at the far end, after /eer/ |
| 5 | **Petal shape** | slim: w:h ≈ 0.47 | fat: w:h 0.69–1.02 (180–268 × 262 stage px), close to round-topped pins |
| 6 | **Outline** | thin, solid, the sound's colour | thick (7–9 stage px); **dashed** for an unmet sound; glowing when complete |
| 7 | **Inside the petal** | white | cream, or tinted with the colour rising from the point as gems are won ([`year1-01`](current/year1-01-first-screen.jpg)), or a radial wash plus a glow and a sparkle cross when complete, or **dark purple mist with a "?"** when unmet |
| 8 | **The spellings** | all of them, stacked in a column, one per line, filling the petal into its point | only the met ones, as small tiles **in a row** across the top of the petal, wrapping; the bottom half of the petal is empty |
| 9 | **Spellings not met** | written like the others | **dark hexagons**, identical whether "not found yet" or "not in the game" |
| 10 | **Letter colour** | black on white | dark on beige (charging), dark on gold (glowing), **white on the petal colour** (won). On /n/, /uu/, /z/, /ie/, /y/ and /ar/ that is white on yellow or pale green |
| 11 | **Letter size** | 4.3–4.8 mm x-height usually; 1.3 mm at the very smallest | 1.1–1.2 mm on every petal, whatever it holds (§3.3) |
| 12 | **Boxes round letters** | none | every spelling in a bordered tile with a gradient, a shadow or glow, and a 2.5 CSS px energy bar |
| 13 | **Pictures** | tiny, top-right, on every petal | top-right, larger, but they poke out of the parchment and are cut by the rollers ([`new-03`](current/new-03-first-met-petal-s.jpg): /s/'s circle half hidden). They only appear once a sound is met, and /h/'s picture is a speech bubble with a **"?"**, the mystery sign ([`year1-04`](current/year1-04-j-g-m-h-k.jpg)) |
| 14 | **The two oo petals** | /uu/ has the word "book" written over its oo | picture only (book / moon). Same for /th/ and /dh/: both show only "th" ([`year1-05`](current/year1-05-last-sounds.jpg)) |
| 15 | **Background** | white paper | parchment stripes, wooden rollers with red caps, a blurred landscape, purple bars at both sides of the stage |
| 16 | **Other things on the page** | a title | a vine of 44 tiny petal markers, a four-part legend in words, a mini World Flower with "17 of 44", Home, Hear it again, the flower button, Sensei |
| 17 | **Movement** | none | the chart slides 84 CSS px by itself on opening and back. A hand swipes across it (3×, until the child has swiped). Mist drifts, "?"s pulse, glowing tiles bounce, and complete petals sparkle |

---

## 3. Measurements

All sizes are CSS px on an 844×390 screen unless marked "stage px" (the game's 1280×720 layout). The stage is scaled by **0.4917**: on a touch screen `ui.tsx` `Stage` keeps 10 px free at the top and 26 px at the bottom, so it is 629×354 with **107 px purple bars** at each side. Note: `docs/SOUND_DISPLAY.md` assumes 0.54, so every size there is about 9 % too large for touch phones. For millimetres, 1 CSS px = **0.166 mm** (iPhone 12–15, 460 ppi, DPR 3).

### 3.1 How it was measured

- **Probe:** `playtest/runs/scroll-design/audit.ts`. It uses Playwright with Chromium (headless shell, ANGLE Metal GPU) in phone mode (`isMobile`, `hasTouch`) at DPR 3. The save goes in through `localStorage`, and every gesture is **CDP `Input.dispatchTouchEvent`** (touchStart, touchMove, touchEnd), never mouse drags. It has these modes:

  | mode | what it records |
  |---|---|
  | `shots` | screenshots and measurements at each stop of a screen-by-screen walk |
  | `detail` | one petal's card |
  | `swipe` / `trace` | frame timings (a rAF probe of `scrollLeft` per frame, long tasks, long animation frames) plus a Chrome trace for main-thread load |
  | `snap` | where the scroll settles after slow drags |
  | `open` | the cost of opening the chart |
  | `video` | a screencast |
  | `strip` | the whole scroll as one picture |

- **Touch timing:** touch moves are sent every 16.7 ms without waiting for each to be handled (`swipe60`). If you wait, moves arrive every ~30 ms, and the scroll looks as if it stutters when it doesn't (the first `swipe` runs, kept for reference).
- **Phone speed:** CPU ×4, the same proxy as `docs/PERF.md`.
- **Letter heights:** the x-height of each text node's real font, measured with canvas `measureText` (Andika bold x = 0.498 em, Baloo 2 ExtraBold x = 0.493 em), times the rendered font size.
- **The chart:** measured on the page image. The left sheet is 1125×1601 px for 210×297 mm, so 0.186 mm per px, and letter heights come from dark-pixel row profiles of single lines.

### 3.2 Tap targets

| target | size (CSS px) | notes |
|---|---|---|
| a petal on the scroll | **88.5–131.8 × 128.8** (15–22 × 21 mm) | generous. The tiles inside aren't separate targets, so a tap anywhere opens the petal |
| Home, Hear it again | 49 × 49 | |
| the World Flower / Petal chart toggle | 45 × 45 | |
| Help (Sensei) | 61 × 61 | |
| card: the petal (hear the sound) | 98 × 135 | |
| card: a met gem | 53 × 53 | |
| card: a hidden gem (hexagon) | 45 × 45 | says "This gem is still a secret…" / "…far, far away" |
| card: Practise gate | 60 × 60 | |
| card: close | 45 × 45 | |
| card: word cards | 39–87 × 42–44 | smallest: "day" in the words-found row, **38.9** wide |

Tap targets are not the problem: everything is at least 39 CSS px, and the petals are large.

### 3.3 Text and letter sizes, and whether a spelling can be read at arm's length

| text | font (CSS px) | x-height (CSS px) | x-height (mm) | at 40 cm | at 30 cm |
|---|---|---|---|---|---|
| **a spelling on the scroll** (tiles; 25–30 stage px) | 13.2–14.7 | **6.6–7.3** | **1.1–1.2** | **9.4–10.4′** | 12.6–13.9′ |
| the scroll's "?" on an unmet petal | 37–48 | 26–33 | 4.3–5.5 | | |
| card: a jewel's letters | 23.4–28.7 | 11.6–14.3 | 1.9–2.4 | 16–20′ | 22–27′ |
| card: example word cards | 19–20 | ~10 | 1.66 | 14′ | 19′ |
| card: "words found" row | 14.3–15.4 | 7.1–7.7 | 1.2 | 10′ | 14′ |
| legend ("Charging: keep practising"…) | 8.4 | 4.1 | 0.68 | 5.8′ | 7.8′ |
| mini flower "17" / "of 44" | 9.9 / **3.5** | 6.9 / 1.7 | 1.1 / 0.28 | | |
| **chart**: 2–4 spellings (/oy/ /e/ /s/) | | | 4.3–4.8 | 37–41′ | |
| **chart**: 7 spellings (/ae/) | | | 2.4–2.8 | 21–24′ | |
| **chart**: 11 spellings (/or/, its smallest) | | | 1.3–1.7 | 11–15′ | |

(′ = arcminutes of x-height at the eye; the chart is read on the table at about 40 cm.)

**Can a spelling be read at arm's length on a phone? No.** At 40 cm, a spelling on the scroll is about 10′ of x-height:
- about **a quarter** of the chart's usual letters (37–41′);
- about half of its seven-spelling petals;
- smaller than its smallest (/or/, 11–15′).

That is below the size at which fluent adult readers begin to slow down (roughly 12′, 0.2°, of x-height). Children aged 5–7 read faster with *larger* print than adults need (Hughes & Wilkins 2000). A child would have to hold the phone at about 20 cm. The card's jewels (16–20′) are the only letters in the chart that approach the chart's own sizes. The legend meant for grown-ups (6′) is unreadable for grown-ups too.

**Numbers for the designer.** These are the x-height, font and line sizes (Andika bold) that give a visual angle at a viewing distance of 35 cm:

| x-height angle | x-height (CSS px) | font (CSS px) | font (stage px) | lines of spellings in the 136 px band / in the 354 px stage |
|---|---|---|---|---|
| 11′ (today) | 7 | 14 | 28 | 7 / 20 |
| 15′ (≈ the chart's smallest) | 9 | 18.5 | 38 | 5 / 15 |
| 20′ | 12 | 25 | 50 | 4 / 11 |
| 25′ (≈ the chart's 7-spelling petals) | 15 | 31 | 63 | 3 / 9 |
| 40′ (≈ the chart's usual) | 25 | 49 | 100 | 2 / 5 |

At chart-like sizes, a phone in landscape holds 5–11 lines of spellings top to bottom. /or/ has 11 spellings, /oo/ 9, and /s/ /ae/ /ee/ /oe/ /er/ /k/ 7 or more. A petal with all its spellings in one column at a readable size is taller than the screen. That is the core constraint any chart-like layout has to solve.

**Pictures:** 64 stage px = **31.5 CSS px (5.2 mm)**, under `SOUND_DISPLAY.md`'s minimum of 70 stage px for recognising a sound. They are larger than the chart's (about 9 mm on paper viewed from further away), but the chart's children also have the colour and the fixed position to go on.

**State cues:** the charging tile's energy bar is 5 stage px = **2.5 CSS px (0.4 mm)** tall. The hidden-spelling hexagons are 12.6–14 CSS px wide. The vine's 44 markers are **7×11 CSS px**, 11 px apart.

**Contrast of a won tile** (white letters on the petal colour, with a 1.5 px dark shadow): 22 of the 44 colours are under 3:1 and 36 are under 4.5:1. The lowest are /uu/ 1.31, /z/ 1.34, /n/ 1.36, /ar/ 1.53, /y/ 1.58 and /ie/ 1.61. Winning makes a spelling *harder* to read. On yellow petals a won tile also looks like the gold "glowing, ready for a gem battle" tile.

### 3.4 What fits, and how far it is

- **The band** (the only part that scrolls) is 578×136 CSS px, **24 % of the screen**. A swipe that starts on the vine, the legend, the flower, the rollers or the purple bars does nothing.
- **Petals on screen:** 5 whole at the start (/ae/ /ee/ /oy/ /ie/ /oe/), then 3–6 whole plus 1–2 cut off at each stop. The chart shows 16 at once.
- **Length:** 9,482 stage px = **4,662 CSS px, 8.1 band widths**. One quick flick (300 CSS px in 120 ms) carries **662–699 CSS px (1.2 widths)** and takes 0.75–0.83 s to stop. From /ae/ to /schwa/ is about 7 flicks; to a new child's first sound (/s/) is 2.
- **Where each child's own petals are:**

  | child | met petals |
  |---|---|
  | new | 14 (/s/), 30 (/t/), 33 (/a/) |
  | Reception | 14–30 and 33–35 met; 1–13, 31–32 and 36–44 misty |
  | Year 1 | 1, 2, 4, 5, 14–31 and 33–42 met; 3, 6–13, 32, 43 and 44 misty |

### 3.5 Swipe smoothness (real touch, Chrome)

These are frames on the page's own clock (rAF) and the scroll position per frame, during and after each gesture, on production at ×1 and ×4, for all three children.

| gesture | frames while the finger moves | frames while it glides | after lift |
|---|---|---|---|
| flick 300 px / 120 ms | 60 fps, p95 16.7 ms, max 16.8 | 60 fps, max 16.8, every frame moves, smooth deceleration | glides 380–600 stage px (190–295 CSS px) after lift, 1,346–1,422 stage px in all; settles in 750–830 ms |
| slow drag 450 px / 900 ms, finger rests, lifts | 60 fps, p95 16.8 | — | the snap pulls it back 15 stage px |
| swipe 400 px / 300 ms | 60 fps | 60 fps | settles in 665–677 ms |
| flick back 450 px / 150 ms | 60 fps (×4: one 33 ms frame) | 60 fps | settles in 800–830 ms |

No long tasks over 50 ms happened during a swipe. The longest was 7–14 ms at ×4. **In Chrome the scroll itself doesn't drop frames:** it is a composited native scroller, so the busy main thread (§3.6) doesn't stop it. What a child *does* feel as jerky:

1. **The snap moves the chart after you let go.** Ten slow drags of 40–310 px, finger resting 250 ms, then lifted: the scroll moved on its own by **−39 to +44 CSS px**, 4 times of 10 *backwards* against the drag (`scroll-snap-type: x`, `scroll-snap-align: center` on every petal).
2. **Flicks overshoot into sameness.** One flick passes 5–6 petals. For most children that is a screen of identical dark blobs ([`new-swipes.mp4`](current/new-swipes.mp4), from 5 s), so there is nothing to stop on and no sense of how far you went.
3. **Three quarters of the screen doesn't scroll**, and the rollers look like part of the band but are dead.
4. **The chart moves by itself on opening** (84 CSS px out and back, at 0.7–1.5 s), and a hand icon sweeps over it.
5. **With a mouse** (desktop, the tweet clips) the drag fallback sets `scrollLeft` from the busy main thread. `assets-src/tweet/2026-09-26/petal-scroll/drive.ts` recorded "3–5 jerks per swipe".
6. **Not measured: Safari on an iPhone.** WebKit paints tiles on the main thread, and production keeps that thread 40–57 % busy at phone speed (§3.6). Newly revealed petals may paint late there. Check this on Jonas's phone with Safari's timeline before designing around it.

Video: [`year1-swipes.mp4`](current/year1-swipes.mp4) and [`new-swipes.mp4`](current/new-swipes.mp4) (844×390, 28–31 s). Both show real 60 Hz touch swipes with a white dot for the finger. The beats are:
- tap the chart (0.8 s);
- two flicks (5.1 s, 7.5 s);
- a slow drag (9.8 s);
- a swipe (12.4 s);
- the new child taps a misty petal (14.7 s: voice only, nothing on the petal reacts);
- flicks home;
- open a petal's card.

### 3.6 Cost

| | new | Reception | Year 1 | Year 1 + card | Year 1, current `src/` |
|---|---|---|---|---|---|
| DOM nodes, whole page | 1,626 | 1,766 | 1,828 | 1,959 | 1,727 |
| of which SVG | 1,433 | 1,461 | 1,433 | 1,485 | 1,017 |
| inside the scroll | 1,094 | 1,209 | 1,248 | | 1,146 |
| running CSS animations | 2 | 19 | 50 | 58 | 36 |
| SMIL animations (misty petals × 5, not counted above) | 205 | 120 | 60 | 60 | 0 |

**Main thread** (Chrome trace; the union of top-level tasks, so nested tasks aren't counted twice):

| build, child, CPU | at rest, 3 s | while swiping | main-thread frames/s at rest |
|---|---|---|---|
| production, new, ×4 | **40 %** | 41–45 % | 60 |
| production, Reception, ×4 | **43 %** | 45–50 % | 60 |
| production, Year 1, ×4 | **52 %** | 52–57 % | 60 |
| production, Year 1, ×1 | 14 % | 14–15 % | 60 |
| current `src/`, new, ×4 | **1 %** | 15–17 % | 2.3 |
| current `src/`, Year 1, ×4 | **1 %** | 17–19 % | 2.3 |

- **Opening the chart** (×4): the first frame with the scroll comes 49–118 ms after the tap. Production (Year 1) has one 56 ms long task; `src/` has none.
- **Production's still chart** costs 4–5× PERF.md's still map (10.2 %), with nothing moving that the child needs. The drifting SVG mist (four `animateTransform` and one `animate` per misty petal, all running off screen too) and the gem glows keep the phone producing 60 frames a second. That is how a phone heats up. `src/`'s fix 9 (compositor-only animations, `content-visibility` for petals out of view) removes almost all of it. **Ship it**, and hold any redesign to at least that.
- About 80 % of the DOM is SVG, and each petal is its own SVG with defs, clip paths and gradients. The scroll alone is 1,100–1,250 nodes for 44 petals.

### 3.7 The petal's card

Screenshots: [`year1-06`](current/year1-06-detail-ae.jpg), [`year1-07`](current/year1-07-detail-ae-gem-tapped.jpg), [`reception-04`](current/reception-04-detail-k.jpg) and [`new-05`](current/new-05-detail-s.jpg).

It opens on a tap as a modal sheet that fills the stage.
- **Left column:** the petal (picture and speaker, 98×135) and, under it, the green Practise gate (a torii).
- **Top right:** the spellings as big jewels (met) or hexagons (not met). A glowing one has a green ▶ for its Gem Trial.
- **Middle:** Sensei's face with example words (picture plus word, the spelling in colour, the word being said spotlit).
- **Bottom:** the "words found" row with a speaker.
- **Top-right corner:** a ✓ to close.

It does most of what Jonas asked for, and its letters are the only readable ones in the chart. Problems:
- the words-found row drops back to 1.2 mm letters;
- the hexagons take a third of the top row;
- a lot of the sheet is empty;
- the new child's /s/ card has **no Practise gate** (nothing to practise with three sounds);
- its example words use spellings the child hasn't met: "dress" colours < ss >, shown one row up as a hexagon.

---

## 4. Usability problems, ranked

For a child aged 3–8 who can't read yet, and so works by picture, colour, position and sound.

1. **The child's own sounds are hidden, and the start is someone else's.** On opening, a new or Reception child sees 0 of 5 petals they know, then 13 misty petals in a row. The Initial Code sounds they are learning sit at positions 14–44. Nothing (no pointer, no scroll to "your newest petal") gets a child from the first screen to their sounds, except when a trip focuses a gem.
2. **Spellings are unreadable on the phone.** 1.1–1.2 mm letters, 10′ at 40 cm (§3.3). The whole point of the chart is to see how a sound can be spelt.
3. **The chart's content is mostly hexagons.** Unmet spellings are identical dark shapes, and "not found yet" and "not in the game" look the same. A petal can be complete and still hold hexagons the child can never fill. Children who see "s ss st c ce se sc" on the wall every day see "s ⬢⬢⬢⬢⬢⬢⬢" here.
4. **No map, no landmarks.** Five of 44 petals are visible at a time, in one line, with no position cue. The vine of 44 dots at the top is too small to read (7×11 px), not tied to the scroll position, and not tappable. The child can't know where /ae/ or their newest petal is, or how far there is to go. The chart's fixed 4×4 position, its strongest cue, is gone.
5. **Swiping feels loose** (§3.5): only a quarter of the screen scrolls, a flick overshoots 1.2 screens into look-alike mist, the snap moves the chart after the finger lets go (sometimes backwards), and the chart moves by itself on opening.
6. **State colours collide with sound colours.** A won tile is the petal's colour. On yellow petals (/n/ /uu/ /z/ /ie/ /y/) it looks like the gold "ready for a gem battle" tile, and it has the worst contrast (1.3–1.6:1). The charging bar is 0.4 mm.
7. **Mystery gives no feedback.** Tapping a misty petal plays "This sound is still a secret. You'll find it on your adventure!" and nothing on the petal moves. With 41 misty petals, most of a new child's taps are this.
8. **Pictures are cut and confusable.** Rollers and the band's top edge crop the pictures at both ends of the view. /h/'s picture is a "?" bubble, the same sign as "not met". /th/ and /dh/ show the same "th" with near-identical purples.
9. **Grown-up text is unreadable for grown-ups.** The legend is 0.7 mm and "of 44" is 0.3 mm.
10. **The card:** the words-found row is small, the example words can use spellings not met, and there's no gate for a new child (§3.7).

## 5. "Ugly" problems, ranked

1. **The dark mist dominates.** 41 of 44 petals for a new child and 24 for Reception are heavy dark-purple blobs with muddy radial highlights, dashed outlines and dim coloured "?"s ([`new-whole-scroll.jpg`](current/new-whole-scroll.jpg)). The chart is white.
2. **Clutter.** On one screen:
   - parchment stripes, rollers with red caps, a blurred landscape and purple side bars;
   - a rainbow vine of 44 markers;
   - a four-part legend;
   - a mini flower with a counter;
   - four round buttons and Sensei.

   The petals get a quarter of the screen. The chart is petals on white.
3. **Tiles and hexagons instead of letters.** Each spelling is a bordered, gradient-filled tile with a shadow or glow. Tiles wrap into ragged rows across the top, hexagons mixed in, and the bottom half of every petal is empty. The chart's calm column of black letters is gone.
4. **Inconsistent petals.** Some are cream, some half-tinted from the point, some fully washed with a glow and a sparkle cross, some dark, and the outlines alternate between solid and dashed. The shape is fat and pin-like, not the chart's slim teardrop.
5. **White letters on pale colours.** 22 of 44 petal colours give under 3:1.
6. **Pictures overlap the frame.** They poke above the parchment and are cut by the rollers, at a different scale from the chart's.
7. **The small letterboxed stage** makes all of it smaller, with 107 px purple bars on each side.
8. **Constant motion.** Drifting mist, pulsing "?"s, bouncing gold tiles, sparkles, the hand, the self-nudge. The chart is still.

---

## 6. What the scroll must still do

Whatever the new design is, it keeps all of this (sources: Jonas's earlier asks, `docs/SOUND_DISPLAY.md`, `docs/TEACHER_SCRIPT.md`, `src/scenes/Tree.tsx`).

**Content**
- All 44 sounds as petals: the 32 chart petals in the chart's order (`CHART_PETALS`, pages 1 and 2) plus the 12 extra sounds.
- Each petal in its chart colour with its chart picture (`public/a/i/petal_<id>.webp`) on the top-right shoulder, at 70 stage px or more where the child must recognise it (SOUND_DISPLAY §4.2). The picture is the sound's identity; the colour is only a family cue, since colours repeat: /ae/ = /d/, /oe/ = /i/, /ue/ = /k/.
- Every spelling of the sound, in the chart's order, in Andika (single-storey a and g).

**States**, per spelling (`engine/gems.ts` `gemState`), told apart without reading and without relying on colour alone:
- **hidden:** the game teaches it, but this child hasn't met it yet;
- **future:** the game can't teach it yet;
- **charging:** met, with an energy amount 0–1;
- **ready / glowing:** full, with enough words for a Gem Trial;
- **won.**

Per petal: not met (**mystery**: "a bit mysterious", Jonas), met, filling as gems are won, and **complete** (every teachable gem won; `petalComplete`).

**Progress** ("a progress bar mechanic", Jonas), at three levels: the whole chart (petals restored, today the vine and the "17 of 44" counter), each petal (today it fills from the point), and each gem (energy).

**Moving around:** touch scrolling ("kids understand touch scrolling"), native and composited. It must land the child on their own sounds.

**Taps and what Sensei says**
- Tap a met petal: its sound (`say({ sound })`) and its card.
- Tap a mystery petal: "This sound is still a secret. You'll find it on your adventure!" (`petal_secret`).
- On arrival: "Tap a petal to see its gems." (`flower_tap`). Help: "Tap a petal to see its gems. A bouncing gem is ready for a gem battle!" (`help_flower`).

**The card** (`PetalDetail`)
- The sound (the petal is the "hear the sound" button).
- Every spelling as a gem. Tap a met gem and Sensei explains it with example words, then invites a charging gem to the dojo (`t_practise_invite`). Tap a glowing gem to start its Gem Trial. Tap a hidden or future gem to hear "This gem is still a secret…" / "This gem is far, far away…".
- The words the child has found, with pictures, the spelling coloured in, and a tap to hear each.
- The green **Practise gate to the dojo** (`onPractice`).
- Close.

**Celebrations:** the gem victory (`GemVictory`, with the sting) when a Gem Trial is won, "big celebrations". The trips land on the chart:
- a focus ring and a scroll to a gem (`focusGem`, `?gem=`);
- new spellings popping in (`reveal`, `chip-reveal`);
- the practised gem's energy filling ("Your gem filled up…", `energyShow`).

**Teacher voice:** the trips' lines stay word for word (TEACHER_SCRIPT §3.14, §3.25):
- "Every petal is one sound."
- "Inside each petal are shiny gems. Each gem is a way to spell the sound."
- "Every shining petal is a sound that you know!"
- "New sounds are hiding in this land."

**The frame**
- Home top-left, Hear it again top-right, Help (Sensei) bottom-right.
- The toggle back to the World Flower.
- Nothing interactive in the bottom-left 330×340 stage px (the ninja) or the bottom-right 150×150 (Help).

**Hooks** that bots, the treadmill and the tweet kit use. Keep them, or update these files together:
- `.petal-scroll`, `[aria-label="petal <id>"]`, `data-p`, `[data-gem-chip]`, `[aria-label="Petal chart"]`, `[aria-label^="gem "]`, and `window.__snState.view/open`;
- `scripts/record-clips.ts`, `scripts/screenshots.ts`, `scripts/treadmill/sound-display.ts`;
- `assets-src/tweet/2026-09-26/*` (`drive.ts`, `clip-recipes.ts`, `build-kit.ts`, the petal-scroll tests).

**Budget**
- Native scrolling.
- A few hundred nodes, not 1,100–1,250.
- Static art for the mystery (no SMIL, no endless main-thread animation, no animated filters or box-shadows).
- Only opacity and transform animations, and only in view.
- At rest, the main thread near `src/`'s 1 % at ×4.

---

## 7. Evidence

**Screenshots of the current game** ([`current/`](current/), 1688×780, from DPR 3 captures):

| child | screens |
|---|---|
| new | [`new-01`](current/new-01-scroll-opens.jpg) (opening, with the hand) · [`new-02`](current/new-02-first-screen-all-mist.jpg) · [`new-03`](current/new-03-first-met-petal-s.jpg) · [`new-04`](current/new-04-t-and-a.jpg) · [`new-05`](current/new-05-detail-s.jpg) (card) · [`new-whole-scroll`](current/new-whole-scroll.jpg) |
| Reception | [`reception-01`](current/reception-01-first-screen-all-mist.jpg) · [`reception-02`](current/reception-02-o-d-i-n-v.jpg) · [`reception-03`](current/reception-03-m-h-k-r-t.jpg) · [`reception-04`](current/reception-04-detail-k.jpg) (card) · [`reception-whole-scroll`](current/reception-whole-scroll.jpg) |
| Year 1 | [`year1-00`](current/year1-00-world-flower.jpg) (the flower view) · [`year1-01`](current/year1-01-first-screen.jpg) · [`year1-02`](current/year1-02-mist-mid-sheet.jpg) · [`year1-03`](current/year1-03-s-l-f-e-u.jpg) · [`year1-04`](current/year1-04-j-g-m-h-k.jpg) · [`year1-05`](current/year1-05-last-sounds.jpg) · [`year1-06`](current/year1-06-detail-ae.jpg), [`year1-07`](current/year1-07-detail-ae-gem-tapped.jpg) (card) · [`year1-whole-scroll`](current/year1-whole-scroll.jpg) |

Videos: [`year1-swipes.mp4`](current/year1-swipes.mp4) and [`new-swipes.mp4`](current/new-swipes.mp4).

**Raw data** (git-ignored, `playtest/runs/scroll-design/`):
- `audit.ts`: the probe. Its modes are `shots`, `detail`, `swipe`, `trace`, `snap`, `open`, `video` and `strip`. Set `AUDIT_BASE` and `AUDIT_TAG` to run it against a frozen build.
- `audit/`: production. It holds `<child>-shots.json`, `<child>-detail-<p>.json`, `<child>-trace-x{1,4}.json` with `.trace.json` (Chrome traces, about 200 MB each), `busy-summary.json`, `year1-snap.json` and `<child>-open-x4.json`, plus every PNG at 2532×1170.
- `audit-src/`: the same probe on a frozen build of `src/` as of this morning (`.build/`).
- `side-by-side.png` and `side-by-side-physical.png`: the school sheet next to the scroll, the second at true physical size (4 px/mm). **Local only.** They contain the school's sheet, so never copy them into the repo.

**Decisions made during the audit**
- **Year 1 child:** 32 sounds, the most the game can show.
- **Arm's length:** 40 cm (a young child's), with 30 cm as a closer case.
- **Phone:** an iPhone 12–15 (0.166 mm per CSS px).
- **Phone speed:** CPU ×4, as in PERF.md.
- **Legibility:** judged by the visual angle of the x-height.
- **Touch:** 60 Hz touch moves for the timing runs; the awaited ~30 ms moves exaggerate stutter.
- **Scope:** production is the audited build, and `src/` is reported for performance only, because its look is the same.
