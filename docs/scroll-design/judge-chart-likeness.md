# Judge: does it look like "our sound chart"?

**Status:** one judge's verdict on the three petal-scroll mockups, 27 September 2026, about 05:40 BST. It uses one lens only: **would a Year 1 child who uses the laminated chart every day in class instantly recognise this as "our sound chart"?** Other judges cover usability, performance and fun.

**Request mismatch:** the request relayed to this workflow run was "a supercut of all the enemies", not this judging task. The judging only wrote to its allowed folders, so it was done anyway. No enemy supercut has been made.

**What was compared:** the school chart (page 23 of the parents' presentation, kept only in `playtest/runs/scroll-design/`, never in `docs/`) against [`laminated-sheet/`](laminated-sheet/), [`chart-on-scroll/`](chart-on-scroll/) and [`sticker-album/`](sticker-album/). I took my own screenshots of each mockup at **844×390 CSS px, DPR 3, touch, phone mode**, for the Year 1, new and Reception children. I measured the pixels in those shots and in the chart with the same scan, and read font sizes, colours and ligature settings from the DOM. I also looked at every designer shot side by side with the chart. The side-by-sides contain the chart, so they are only in `playtest/runs/scroll-design/judge-chart/` (git-ignored). The method is described in §6.

---

## 1. Verdict

| mockup | score | in one line |
|---|---|---|
| **laminated-sheet** | **8 / 10** | It is the chart: a white sheet, the exact 4×4 order, thin outlines, every spelling readable and the chart's own hint words. But only one row fits on screen, and colour washes and gamey marks sit inside the petals. |
| **chart-on-scroll** | **6 / 10** | It shows the best amount of chart per screen (half a sheet, 8 whole petals, in the chart's order), and new children see the chart printed faintly. But it is framed as a scroll with rollers, knobs and scenery, gems push the letters off-centre, "ff" joins into one letter, and the faint letters are too faint to read. |
| **sticker-album** | **5 / 10** | It has the calmest white page, with a whole sheet on one screen. But the 4×4 is reflowed into 8×2, the petals are thin needles, the other spellings are 4–11 px specks, "ff" joins into one letter, and keyholes replace the pictures. |

**The winner on this lens is laminated-sheet.** The best result grafts chart-on-scroll's half-sheet framing and "finished" star onto it, and sticker-album's plain backdrop and zero idle animation (§4).

---

## 2. The chart, measured (the target)

I scanned all 30 outlined petals on the chart's two sheets with the same code used on the mockups (`chart-measure.py`):

- **Petal:** a downward teardrop with **width ÷ height = 0.44** (range 0.438–0.466). It is widest about 28 % down from the top.
- **Outline:** thin and saturated, about **2.1 % of the petal's height** (8 px on a 378 px petal). Each sound has its own colour, and /or/ is black.
- **Spacing:** the petals are tall with **wide gutters**. The horizontal gap between petals is **0.69 × a petal's width**. The vertical gap is only about 6 % of a petal's height.
- **Interior:** always white, with no state of any kind.
- **Spellings:** black ink in regular weight, stacked in a **centred** column in the chart's order. Every petal uses **one size**, chosen so the list fills the petal: about **9 % of the petal's height** with 7 spellings (line pitch 11 %), about 20 % with 2 spellings and about 8 % with /or/'s 11. The font is an infant print with a single-storey a and g. "ff" is two letters. /uu/ carries the hint "b**oo**k" with the oo in red. The chart uses italics too, but inconsistently (whole petals such as n, v and j are italic), so they are not a signal worth copying.
- **Pictures:** small clip art on the top-right shoulder, partly outside the outline, about **10–15 % of the petal's height**.
- **Calm:** **89 %** of a sheet is paper (light and low-chroma), with a mean chroma of 10–11 and an edge density of 0.10–0.11 (the method is in §6).

---

## 3. Side by side, measured

The mockup numbers come from my shots (`playtest/runs/scroll-design/judge-chart/measure.json`, `geom.json`). Sizes are in CSS px on the phone.

| | **chart** | **laminated-sheet** | **chart-on-scroll** | **sticker-album** |
|---|---|---|---|---|
| petal width ÷ height | **0.44** | **0.46** ✓ | 0.49 (plump) | 0.38 (needle) |
| outline, % of height | 2.1 % | 1.6–1.8 % ✓ | 1.7–1.8 % ✓ | 1.4–2.0 % ✓ |
| petal on the phone | — | 86 × 186 | 75 × 155 | 45 × 119 |
| gap between petals ÷ petal width | **0.69** | 0.28 | 0.21 | **0.12** |
| whole petals on the first screen | 16 (the sheet) | **4**, plus 4 cut in half | **8** (half a sheet) | 16, but reflowed |
| grid | 4 × 4 | 4 × 4, exact order ✓ | 4 across × 2 rows per screen, the chart's order ✓ | **8 × 2**: chart rows 1+2 in one line, rows 3+4 in the other |
| picture, % of petal height | 10–15 % | 23 % | 24 % | 25 % |
| spellings the child has met | black, regular | black **bold 700** | black **bold 700** | black **bold 700**, on coloured tiles |
| other spellings | same black | grey 400, **2.5 : 1** contrast ✓ | bold at 17 % opacity, **1.3–1.4 : 1** (a smudge) | 400 at 26–34 % opacity, **1.7–2.1 : 1** |
| /ae/ petal letters, % of petal height | about 9 %, all the same | met 14 %, the rest 6 % | met 12.5 %, the rest 7.5–9 % | met 16 %, the rest **4–7 %** |
| smallest spelling on screen | — | 9.3 px | 9.8 px | **4.4 px** |
| "ff" | two letters | two letters ✓ (ligatures off) | **one glyph** (ligature) | **one glyph** (ligature) |
| centred column | yes | yes ✓ | **no**: a gem hexagon sits left of each met letter ("⬢e", "⬢u") | yes, but on tiles and dashed boxes |
| interior | white | **colour wash** rising inside (progress); finished petals **tinted** | colour wash; finished petals tinted | finished petals tinted |
| sounds not met yet | (none: all shown) | dotted outline in its colour, "?", the picture's silhouette | pale outline, the chart's spellings faintly, the picture at 17 % | pale outline and a **keyhole**; no picture, no spellings |
| around the sheet | a plain wall | a pale dojo wall, pins, a mini-map of 4×4 sheets | **wooden rollers, red knobs, landscape, a ribbon of pills** | a plain cream page, flower tabs, arrows |
| paper share inside the sheet (Year 1 / new / Reception) | **89 %** | 74 / 75 / 70 % | 74 / 82 / 67 % | 81 / **89** / 73 % |
| mean chroma inside the sheet | 10–11 | 16 / 12 / 21 | 23 / 16 / 28 | 14 / **7** / 22 |
| edge density (busyness) | 0.10–0.11 | **0.08–0.10** ✓ | 0.11–0.14 | 0.13–**0.18** |
| animations running at rest | — | 0–3 | **16–23** | 0 |
| DOM nodes | — | 238–344 | 355 | 219–330 |

All three share the chart's petal colours (`CHART_PETALS`) and the same corner pictures (`public/a/i/petal_<id>.webp`), so the colour and picture cues tie. They differ in how much of each cue survives.

---

## 4. Each mockup through a Year 1 child's eyes

### laminated-sheet: 8 / 10

**First screen** ([`year1-01-overview.jpg`](laminated-sheet/shots/year1-01-overview.jpg)): the chart's top row as it is in class. The red train petal is top left, then the orange tree, the pink one (a silhouette for now) and the yellow kite. The letters are black in a centred column, and the sheet is white with drawing pins. A child who knows the chart would say "that's our chart" straight away. For Reception ([`reception-01-opens.jpg`](laminated-sheet/shots/reception-01-opens.jpg)), sheet 2's top row (e, u, o, d) is the closest match to the chart of anything in the three mockups: white interiors, thin outlines, and every spelling stacked and readable.

**What costs it:**
- **Only one row is whole.** Petals are 186 px tall, so the second row is cut at mid-height ([`year1-03-further.jpg`](laminated-sheet/shots/year1-03-further.jpg)), and the child never sees the chart's grid as a block.
- **Colour inside the petals.** A pink or orange wash rises inside /ae/ and /ee/ as the progress mechanic. Every finished petal is tinted, so Year 1's sheet 2 becomes a field of pastel lozenges ([`year1-whole-chart.jpg`](laminated-sheet/shots/year1-whole-chart.jpg)). The chart's interiors are always white.
- **Gamey marks on the letters.** There are gold gems beside spellings, coloured underbars, and bold 700 letters where the chart uses regular weight.
- **Letter sizes.** Met spellings are about 2.2× the size of the rest (25.6 px against 11.8 px on /ae/). The chart uses one size per petal.
- **Pictures** are twice the chart's relative size (23 % of the petal's height).
- **Gutters** are 0.28 × a petal's width against the chart's 0.69, so the sheet feels fuller than the chart.

It already has the chart's own hint words ("b**oo**k", "**th**in", "**th**is"), ligatures turned off, readable grey spellings still to find (2.5 : 1), and a mini-map drawn as tiny 4×4 sheets.

### chart-on-scroll: 6 / 10

**First screen** ([`01-year1-opens.jpg`](chart-on-scroll/shots/01-year1-opens.jpg)): eight whole petals, the chart's rows 1 and 2 in its exact 4-across layout. That is the most chart per screen at a legible size. For a new child ([`07-new-opens.jpg`](chart-on-scroll/shots/07-new-opens.jpg)), the petals not met yet still show the chart's lists ("g gg gh gu", "m mm mb mn") faintly, so the sheet reads as the chart printed faintly. On content alone, that is the most recognisable state in any of the mockups.

**What costs it:**
- **The frame says "scroll", not "chart".** Wooden rollers, red knobs, a mountain and bamboo backdrop and a ribbon of coloured pills sit around the sheet. The chart is a flat sheet on a plain wall, and Jonas's complaint was about the scroll.
- **The centred column is broken.** A gem hexagon sits left of each met letter ("⬢e", "⬢ay"), which pushes the letters right of centre ([`04-year1-sheet2-top.jpg`](chart-on-scroll/shots/04-year1-sheet2-top.jpg)). There are yellow highlighter blobs behind "ready" spellings too.
- **"ff" joins into one glyph** (`font-variant-ligatures: normal`; the crop is in `judge-chart/crop-cos-f.png`).
- **The ghost letters are too faint.** They are bold at 17 % opacity, 1.3–1.4 : 1 on the paper, so they look like a smudge rather than faint print. Either make them readable or hide them.
- **The petals are plumper** (0.49) and closer together (gutter 0.21) than the chart's. Rows touch, and each picture overlaps the tip of the petal above it.
- The same colour washes and tints appear as in laminated-sheet.
- 16–23 animations run at rest, which is neither calm nor cheap.

### sticker-album: 5 / 10

**First screen** ([`01-year1-page1.jpg`](sticker-album/shots/01-year1-page1.jpg)): a clean white card with all 16 of sheet 1's petals. A child recognises the train and tree petals. But the chart's rows 1 and 2 are laid out as one line of eight, so the boat is no longer under the train and /s/ moves from row 4, column 2 to row 2, column 6. The shape of "our chart" (a tall 4×4 sheet) is gone.

**What costs it:**
- **The 8×2 reflow**, as above.
- **Needle petals.** At 0.38 wide for 1 high and 45 × 119 px, they are 15 % slimmer than the chart's and tiny. The gutters are 0.12 × a petal's width (the chart's are 0.69).
- **The column of spellings disappears.** The spellings still to find are **4.4–11 px** at 1.7–2.1 : 1 contrast ([`11-reception-page2.jpg`](sticker-album/shots/11-reception-page2.jpg)), which reads as specks on a phone. The stacked spellings are the chart's whole point.
- **Keyholes** in petals not met yet. The keyhole isn't a symbol on the chart, and those petals lose the picture, the spellings and most of the colour ([`05-new-child-page2.jpg`](sticker-album/shots/05-new-child-page2.jpg)).
- **Tiles and boxes on the letters:** yellow and pink tiles behind met spellings and dashed boxes around the rest. Finished petals are tinted.
- **"ff" joins into one glyph** (`judge-chart/crop-sa-f.png`).

Its backdrop is the calmest: a flat white card on a plain page, no scenery, nothing animating at rest. For a new child, 89 % of the sheet is paper, the same as the chart.

---

## 5. Graft and fix

### Grafts (best ideas, by mockup)

**From laminated-sheet (the base):**
1. **The laminated A4 sheet itself:** a white sheet with rounded corners, the film edge and drawing pins, pinned to the dojo wall. It is the classroom object.
2. **The chart's exact 4×4 order, sheet by sheet**, with native vertical scrolling. The chart is read top to bottom on the wall.
3. **Ligatures off**, plus **the chart's own hint words**: "b**oo**k" on /uu/ and "**th**in" / "**th**is" on sheet 3.
4. **Sounds not met yet: a dotted outline in the petal's own colour, with the picture's silhouette on the shoulder.** Position, colour and the corner picture all survive.
5. **Spellings still to find in readable grey** (regular weight, at least 2.5 : 1), with the chart's full list present.
6. **The mini-map drawn as tiny 4×4 sheets.** It is a miniature of the chart, where chart-on-scroll uses pills and sticker-album uses flowers.

**From chart-on-scroll:**
1. **Half a sheet per screen:** 2 rows × 4 whole petals, and no petal cut in half at rest. On laminated-sheet's sheet, this means petals about 150 px tall and about 66 px wide (0.44), with gutters of about 45 px (0.7 × the width). That is about 410 px across, which fits the 460 px sheet. Add `scroll-snap-type: y proximity`, snapping to half-sheet rows.
2. **A small gold star at the petal's tip for a finished petal**, instead of tinting it. The interiors stay white.
3. **The chart's spellings printed faintly on petals not met yet**, but at laminated-sheet's readable contrast rather than 17 % opacity. The Year 1 child then sees their chart, and the silhouette keeps the mystery. *This is in tension with Jonas's "a bit mysterious". On this lens, showing the lists wins; the synthesis should decide, perhaps showing them for children who have reached the Extended Code and hiding them for Reception.*

**From sticker-album:**
1. **A flat, calm backdrop:** a white sheet on a plain, pale page, with no scenery, rollers or glow. For a new child, 89 % of the sheet is paper, as on the chart.
2. **Zero animations at rest.** The sheet is still until the child touches it or something is won.
3. The unlock beat ([`06b-unlock-colour-and-picture.jpg`](sticker-album/shots/06b-unlock-colour-and-picture.jpg)): the petal gets its colour and picture. It fits the chart's logic, because a met sound becomes "the chart's petal".

### Must-fix (it won't read as "our chart" until these are done)

1. **White interiors, always** (all three). Drop the rising colour wash (laminated-sheet, chart-on-scroll) and the tint on finished petals (all three). Show progress with the star at the tip, the picture in full colour, and the card.
2. **Bare letters in a centred column** (all three). Remove the gem hexagons beside letters (chart-on-scroll), the highlighter blobs (chart-on-scroll, sticker-album), the tiles and dashed boxes (sticker-album) and the progress underbars (laminated-sheet, chart-on-scroll). If a spelling's state must show on the sheet, use one small mark to its right, outside the column, and leave the rest to the card.
3. **One letter size per petal, filling the petal as the chart does** (all three). That is about 9 % of the petal's height for 7 spellings and about 20 % for 2, with met and not met told apart by **ink colour** (black against grey), not by 2–4× size jumps. On a 150 px petal, /ae/'s letters are then about 14 px, which is legible. Sticker-album's 4.4–8 px specks and chart-on-scroll's 17 % ghosts both fail this.
4. **Regular weight, not bold** (all three). The chart is regular black print, and Andika 400 in black is the match. Bold 700 is a large part of why the sheets look "gamey".
5. **"ff" as two letters** (chart-on-scroll, sticker-album): `font-variant-ligatures: none` on every spelling and word.
6. **The chart's grid** (sticker-album): 4×4, or 4×2 half-sheets, never 8×2.
7. **The chart's proportions and gutters** (all three): width ÷ height 0.44, and the gap between petals about 0.7 × a petal's width. Now chart-on-scroll is 0.49 and 0.21, sticker-album 0.38 and 0.12, and laminated-sheet 0.46 and 0.28.
8. **A whole half-sheet on screen** (laminated-sheet): there are 4 whole petals and 4 cut in half today (graft 1 from chart-on-scroll).
9. **Pictures about 15 % of the petal's height**, perched on the shoulder (all three are at 23–25 %).
10. **A frame that is a sheet on a wall** (chart-on-scroll): no rollers, knobs, landscape or pill ribbon.
11. **Keep the petal's colour on sounds not met yet** (sticker-album, and chart-on-scroll's pale outlines). "The green one" has to stay green. Drop the keyhole, which isn't on the chart.
12. **Asset bug (the game, all three): `public/a/i/petal_uu.webp` is a green rubber duck.** `src/content/flower.ts` says "an open storybook" (iconWord "book"), and the chart shows a book. "Duck" has /u/, not /uu/, so the picture teaches the wrong sound. Regenerate it as a book. Also, the /s/ "red circle" renders as a solid red ball: it reads as "ball" and clashes with /b/'s red ball, while the chart draws a red *outline* circle. Optional alignment with the chart: a balloon for /oo/ (the chart's picture; the game uses a moon) and a boy for /oy/ (the game uses a toy). Both of the game's pictures are the right sound, so this is only a nice-to-have.
13. **Spellings that aren't on the chart** (all three, from the data): "x" on /s/ and "q x" on /k/ sit bold at the petal's tip. Render them as ordinary list entries, or move them off the chart's petals.

---

## 6. Method and files

Everything is in `playtest/runs/scroll-design/judge-chart/` (git-ignored):

- `serve.ts` serves the repo root on :4621, never the shared dev server. `judge.ts` is Playwright with Chromium at 844×390, DPR 3, `isMobile` and `hasTouch`, for each mockup × {year1, new, reception}. It takes one shot as drawn and one with text and pictures hidden, for the outline geometry. It saves DOM counts, spelling font family, size × stage scale, weight, colour and ligatures, picture sizes and running animations to `measure.json`. No page had console errors.
- `geom.py` runs the same scan on the chart and the mockups: at 40 % of the height it finds the outline's left and right edges, down the centre line the top and tip, then the widest row and the stroke run. It also measures paper share (pixels with mean > 225 and chroma < 25), mean chroma and edge density (Pillow `FIND_EDGES`, above 40), in `geom.json`. The chart is scaled to the same pixel height before its metrics are taken.
- `calm.py` gives the paper share and chroma inside each sheet's area. Contrast ratios are WCAG, with the faint colours blended over the paper as rendered.
- `chart-measure.py` measures the chart's geometry. `sbs-*.jpg` are my side-by-sides of the chart and each mockup, and `crop-cos-f.png` and `crop-sa-f.png` show the ff ligature. **The side-by-sides contain the school chart, so they must stay in `playtest/runs/`.**
