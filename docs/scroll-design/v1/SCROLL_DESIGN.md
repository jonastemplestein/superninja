# The petal chart: final design

**Status:** the final design for the World Flower's petal chart (today's "petal scroll"), 27 September 2026. It replaces the scroll in `src/scenes/Tree.tsx`. Nothing in `src/` has changed yet: §7 is the build spec, §8 the acceptance.

- **Working mockup:** [`scroll-design/final/index.html`](scroll-design/final/index.html). Serve the repo root and open `/docs/scroll-design/final/?child=year1` (or `reception`, `new`). Its URL options are listed at the top of the file.
- **Today beside the new design:** [`scroll-design/final/compare.png`](scroll-design/final/compare.png).
- **Stills:** [`scroll-design/final/shots/`](scroll-design/final/shots/) (§8.1 lists them).
- **Earlier work:** the [audit](scroll-design/audit.md), the three mockups ([`laminated-sheet/`](scroll-design/laminated-sheet/), [`chart-on-scroll/`](scroll-design/chart-on-scroll/), [`sticker-album/`](scroll-design/sticker-album/)) and three judges ([chart-likeness](scroll-design/judge-chart-likeness.md), [small hands](scroll-design/judge-small-hands.md), [wonder and cost](scroll-design/judge-wonder-and-cost.md)).

All sizes are **stage px** (the game's 1280×720 layout) unless marked CSS px. On a phone in landscape (844×390) the stage is scaled by 0.4917, so 100 stage px is 49 CSS px. "x-height" is the height of a lowercase *a*: it is the size that matters for beginner readers.

---

## 1. Why

**Jonas (27 Sep):** "The scroll is ugly as fuck and barely usable. Review that and make it more similar to what the kids are used to from the image I shared with you before."

**The image** is page 23 of his children's school's Year 1/Year 2 parents' presentation, "The Extended Code alternative spellings". It shows two laminated A4 sheets the children use every day in class. Each is a 4×4 grid of slim, downward-pointing teardrop petals: a thin outline in the sound's own colour, the spellings stacked in a column in an infant print (single-storey *a* and *g*), and a small picture on the top-right shoulder. It is white, calm and very legible. The image stays out of this repo (the repo is public).

**What was wrong** ([audit](scroll-design/audit.md), measured on production at 844×390, DPR 3, real touch):

1. **The first screen showed someone else's sounds.** New and Reception children opened the scroll onto five dark "?" blobs, then 13 misty petals before their first sound.
2. **The spellings couldn't be read.** Letters had an x-height of 6.6–7.3 CSS px (1.1–1.2 mm), a quarter of the chart's usual size.
3. **Most of each petal was hexagons**, not letters. "Not found yet" and "can't be taught yet" looked the same.
4. **It looked nothing like the chart:** dark purple mist, parchment, rollers, a blurred landscape, tiles, tints, glows, a 44-dot vine, a legend. The petals got 24 % of the screen.
5. **Swiping felt loose:** only a quarter of the screen scrolled, a flick carried 1.2 screens into look-alike mist, and the snap moved the chart after the finger let go, sometimes backwards.
6. **It never rested:** at phone speed the main thread was 40–52 % busy with the child doing nothing (1,626–1,828 DOM nodes, SMIL mist, glowing tiles). That is part of why Jonas's phone overheated ([PERF.md](PERF.md)).
7. **The card was the good part**, but reached from a scroll that hid the petal you wanted.

**What Jonas asked for earlier, and keeps:** touch scrolling ("kids understand touch scrolling"), sounds not met yet "a bit mysterious", "a progress bar mechanic", tapping a sound to show the words met, Practise going to the dojo, big celebrations when a gem is won, every sound shown as its petal with its picture ([SOUND_DISPLAY.md](SOUND_DISPLAY.md)), and Sensei's teacher voice ([TEACHER_SCRIPT.md](TEACHER_SCRIPT.md)).

**The judges' verdicts on the three mockups:**

| judge (lens) | laminated-sheet | chart-on-scroll | sticker-album |
|---|---|---|---|
| chart-likeness ("is this *our* sound chart?") | **8** | 6 | 5 |
| small hands (can a 3–8-year-old use it?) | **8** | 5 | 7.5 |
| wonder and cost (lovely, calm, cheap?) | 7 | 6 | **8** |

**The direction chosen:** the laminated sheet as the base (the chart's own 4×4 sheets in their exact order, on a wall), shown **half a sheet per screen** (chart-on-scroll's framing, the small-hands judge's recommendation), with **one swipe, one half-sheet** paging (sticker-album's engine), and the best of each: laminated's silhouettes, tap guard, letter fitting and map of little sheets; chart-on-scroll's jewel beside a won spelling, the star on a complete petal and the card that grows out of its petal; sticker-album's calm (no bars, nothing running at rest), unlock and in-place win. Every must-fix the judges listed is dealt with (§9 has the decisions).

---

## 2. The design at a glance

![Today beside the new design](scroll-design/final/compare.png)

- **It is the class chart.** Three laminated sheets pinned to a plain classroom wall: the school's two sheets in their exact 4×4 order, and a third sheet in the same style for the 12 sounds the school's sheets leave out (a p b w y sh ch th dh ng zh schwa).
- **Half a sheet fills the screen:** 2 rows × 4 whole petals. A swipe up or down turns to the next half-sheet (6 in all), exactly like sliding the sheet up the wall.
- **Petals are the chart's:** white inside, a thin outline in the sound's colour, the picture on the top-right shoulder, every spelling in a centred column in Andika regular, with ligatures off (*ff* is two letters).
- **The chart fills in as the child learns.** A spelling the child has met is inked in black; one still to find is pencil grey. A won gem is a small jewel beside its spelling; a gem ready for a battle is a gold gem that hops; a complete petal gets a gold star at its point. Sounds not met yet are dotted outlines in their colour, with the picture as a silhouette.
- **A map of three little sheets** on the right is the progress bar and the way to jump.
- **Tap a petal:** it says its sound and its card grows out of it: the same petal up close, big letters, Sensei, the words, the Practise gate.
- **Calm and cheap:** 259–403 DOM nodes, nothing moving at rest, 0 % main thread at rest at phone speed (§6).

---

## 3. The design

### 3.1 The screen

```
 stage 1280 × 720 (CSS 629 × 354 on the phone; the letterbox beside it is painted the wall colour)
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ [⌂]     ┌──── the sheet: x 172–1108 (936 wide), 4 columns of 234 ────┐           [🔊]      │
│ Home    │ ● pin                                                pin ● │           Hear it    │
│         │   ╭─╮🚂      ╭─╮🌳      ╭┄╮👤      ╭─╮🪁                     │           again      │
│ [✿]     │   │ai│       │ee│       ┆  ┆       │ie│                     │  ┌─────┐            │
│ World   │   │ay│  …    │ea│  …    ┆  ┆       │igh│    row 1          │  │▦ ▦ │ the map:   │
│ Flower  │   ╰╮╯        ╰╮╯        ╰┄╯        ╰╮╯                     │  │▦ ▦ │ 3 little   │
│         │   ╭─╮⛵      ╭┄╮🦆      ╭┄╮🐦      ╭┄╮🚗                     │  └─────┘ sheets,   │
│ (wall)  │   │oa│       ┆  ┆       ┆  ┆       ┆  ┆     row 2          │  ┌─────┐ a frame   │
│         │   ╰╮╯        ╰┄╯        ╰┄╯        ╰┄╯                     │  └─────┘ on the    │
│         │ ─ ─ ─ the sheet runs on below (a soft edge) ─ ─ ─          │  ┌─────┐ half-sheet│
│         └─────────────────────────────────────────────────────────────┘  └─────┘ on screen │
│                                                                                    (Help)  │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

| thing | stage px | CSS px on the phone | notes |
|---|---|---|---|
| the scroller | the whole stage, 1280 × 720 | 629 × 354 | a swipe from anywhere moves the sheet |
| a page (half a sheet) | 720 tall, a snap point | 354 | 6 pages: sheet 1 top, sheet 1 bottom, sheet 2 top, … |
| the sheet (paper) | x 172–1108, 936 wide; 16 px of wall above and below a sheet | 460 wide | white `#fffefb`, radius 14, the laminate's film edge (a 7 px white and a 1.5 px grey-blue ring), a soft drop shadow, two drawing pins (red, blue, yellow for sheets 1–3) |
| a row | 334 tall; the top half's rows start at y 40, the bottom half's at y 12 | 164 | |
| a petal's cell (its button) | 234 × 334 | 115 × 164 | the whole cell, picture included, is the tap target |
| a petal | 136 × 296 (width ÷ height 0.46; the chart's is 0.44), at x 49, y 30 in its cell | 67 × 146 | the gap between petals is 98, 0.72 × a petal's width (the chart's is 0.69) |
| the outline | 6 (2 % of the height, as on the chart) | 3 | the sound's chart colour (`CHART_PETALS`), including the chart's ink for /or/ |
| the picture | 72 × 72 on the top-right shoulder (x 154, y −2 in the cell) | 35 × 35 | SOUND_DISPLAY's minimum for recognising a sound is 70; the chart's are smaller (about 15 % of the petal's height), but the chart hangs on a wall a child already knows |
| Home | left 18, top 16, 100 | 49 | NavLayer, unchanged |
| the World Flower button | left 18, top 150, 100, pink | 49 | moves here from right 16 / top 424, in both views |
| Hear it again | right 18, top 16, 100 | 49 | NavLayer `top-right`, unchanged |
| the map | x 1146–1270, y 136–556 | 61 × 206 | three little sheets 104 × 128 (51 × 63 CSS), 142 apart |
| Help | bottom-right, 124 | 61 | unchanged |
| the Next arrow (after a trip) | the nav row's Next slot, x 964–1096, y 562–694 | 65 | unchanged; it covers the point of the bottom-right petal, but not its centre |

Nothing sits in the Home zone but Home, and nothing in the Help zone. The free chart shows no ninja, so the ninja zone rule doesn't apply there (the sweep checks it only when `.ninja-spot` is on screen); the gem victory, which does show the ninja, is an overlay above the chart.

**The wall** is a flat warm cream, `#efe4d1`. In the chart view the stage's viewport (the letterbox beside the stage: 107 CSS px on each side of an iPhone in landscape) is painted the same colour, so the screen has no dark bars. Where the sheet runs off the top or bottom of the stage, an 18 px fade into the wall shows that it carries on.

### 3.2 A petal, and how its letters are fitted

The spellings go in one centred column in the chart's order (`CHART_PETALS.spellings`, deduplicated), in Andika regular (400), with `font-variant-ligatures: none`. There is nothing else inside a petal: no tints, no tiles, no bars.

**The fit** (`fitColumn`, §7.2) is the chart's rule, "the more spellings, the smaller the letters", adapted for a phone:

- **Two sizes at most per petal:** *M* for the spellings the child has met, *F* for the rest. *F* is between 0.62 and 0.85 of *M* while that fits, so the child's own spellings are at most 1.6 × the others (the mockups had 2–4 × jumps). Only if nothing fits does *F* drop further, never below 22.
- **Sheet limits:** *M* from 58 down to 26, *F* from 46 down to 22. The first lines keep clear of the picture (text and mark within 72 of the centre above y 34).
- **Every line must sit inside the teardrop** at 15 % and 90 % of its height, with 8 px to spare, the mark included (§3.3). The shape's half-width comes from a table, one entry per stage px, so a fit costs well under a millisecond.
- **The column may start up to 24 px lower** (tried in steps of 6) where the round top is wider, so a mark beside the first spelling doesn't shrink the whole petal.
- **Air between the lines,** up to 22 px, as long as every line still fits: the column runs down into the point, as on the chart.
- **Hint words,** as on the chart: "b**oo**k" over /uu/'s *oo*, and "**th**in" / "**th**is" over the two *th* petals. The hint is at most 0.6 × *M*; its coloured letters are the petal's colour darkened to 4.5 : 1.

**Measured** (all of each child's spellings on the chart, CSS px x-height): the child's own spellings have a median of 12.2 (Year 1), 14.2 (Reception) and 14.2 (new), with a minimum of 7.6 on Year 1's seven-spelling petals (/ae/, /oe/). The others have a median of 5.9–8.6. That is about twice today's 6.6–7.3, in the chart's own proportions; a phone can't do more with a seven-spelling petal and still show half a sheet (the audit's core constraint). **The card is where the reading happens:** there the child's own spellings are 12–17 CSS px and the word cards 12 (§3.6).

### 3.3 States

**Per spelling** (`engine/gems.ts` `gemState`, unchanged):

| state | on the sheet | on the card | a tap on the card |
|---|---|---|---|
| **hidden** (the game will teach it; not met yet) | pencil grey `#8b8177` (3.8 : 1), size *F* | the same, size *BF* | "This gem is still a secret. You'll find it later!" (`gem_hidden`) |
| **future** (this version can't teach it) | lighter grey `#aaa095` (2.5 : 1) | the same | "This gem is far, far away. We'll find it one day!" (`gem_future`) |
| **charging** | black ink, size *M*, **no mark** | black, and an energy ring beside it filling with gold | selects it; Sensei explains it; then "Shall we practise this in the dojo?" (`t_practise_invite`) |
| **ready** (glowing: its Gem Trial is ready) | black, and a **gold gem with a glint** beside it (0.66 *M*, at least 30). It hops three times when its half-sheet comes on screen, and again on Help; it never loops | black, the gold gem, and a green ▶ (104) beside the line | starts its Gem Trial, as today (so does ▶) |
| **won** | black, and a **small jewel in the petal's colour** beside it (0.52 *M*; /or/'s is bronze) | the same, bigger | selects it; Sensei explains it |

Won and ready differ by shape as well as colour (the ready gem is bigger, gold, with a glint and a halo), which matters on the yellow petals. The marks sit to the right of the column, outside the letters, so the column stays centred.

**Per petal:**

| state | looks like |
|---|---|
| **not met yet** (no spelling met) | the outline **dotted** in the petal's own colour (80 % opacity), the picture as a **silhouette** in a pale tint of that colour, and nothing inside. It is in its place, in its colour, with a guessable shape: "a bit mysterious", never a dark blob, never a "?" (/h/'s picture is a "?") |
| **met** | a solid outline, the picture in full colour, the column of spellings |
| **filling** (some gems won) | jewels beside the won spellings; the inside stays white |
| **complete** (`petalComplete`) | a gold star (40) at the point |

**Per chart (the progress bar):** the map's little petals are pale grey until met, the petal's colour at half strength once met, full colour when complete; a gold dot marks a petal with a gem ready for a battle.

### 3.4 A new child, a Reception child and a Year 1 child

The chart never moves by itself. It opens, before its first paint, on **the half-sheet with the thing to do next**, in this order: a trip's gem (`focus`, a landing or a reveal), else the first petal with a glowing gem in the chart's order, else the petal of the child's newest spelling (the met gem with the highest `unit`; within a unit, the one its `spellings` list teaches last), else the top of sheet 1.

| child ([audit](scroll-design/audit.md) saves) | sounds met | lands on | what is on the first screen | stills |
|---|---|---|---|---|
| **new** (s a t) | 3 of 44 | sheet 2, bottom half (the newest sound, /t/) | /t/ with *t* in ink and *tt bt te* in pencil; seven dotted petals with silhouettes (ghost, thumb, speech bubble, anchor, rhino, zebra, ear) | [`03-new-child`](scroll-design/final/shots/03-new-child.jpg), [`whole-new`](scroll-design/final/shots/whole-new.jpg) |
| **Reception** (units 1–5 + j) | 20 | sheet 2, top half (/d/'s glowing gem) | eight met petals: *e ea ai*, *u ou o*, *o a*, *d dd ed*, *i ui e y*, *n nn ne gn kn*, *v ve vv*, *j g ge dge*; stars on /i/ and /n/; a gold gem on /d/ | [`01-overview-reception`](scroll-design/final/shots/01-overview-reception.jpg), [`whole-reception`](scroll-design/final/shots/whole-reception.jpg) |
| **Year 1** (units 1–12) | 32 | sheet 1, top half (/ae/'s glowing *ai*) | /ae/ /ee/ /ie/ /oe/ met with gold gems on *ai*, *ea* and *igh*; /oy/ /uu/ /er/ /ar/ dotted (a robot, a duck, a bird, a car) | [`04-year1-child`](scroll-design/final/shots/04-year1-child.jpg), [`whole-year1`](scroll-design/final/shots/whole-year1.jpg) |

A Year 1 child who uses the laminated chart sees their chart in its own places and colours, part drawn and part still dotted: a chart to fill in. A new child sees mostly dotted outlines and silhouettes, with their three sounds inked in where the class chart has them.

### 3.5 The map

Three little sheets, stacked on the right like a scroll bar: 4 columns of little petals (13 × 25) in the chart's order, the chart-wide progress (§3.3), and a frame (118 × 70, a 5 px ink border on a faint gold wash) round the half-sheet on screen. The frame moves with a 320 ms transition when a new half-sheet settles. There is no per-frame work while scrolling: an IntersectionObserver (threshold 0.6) reports the half-sheet on screen.

- **Tap a little sheet:** the chart glides there, to the half tapped (upper or lower). Each little sheet is one button, 51 × 63 CSS px.
- **Drag down the map:** the chart follows, half-sheet by half-sheet.

### 3.6 The card

![The card for /ae/, Year 1](scroll-design/final/shots/05-detail-ae-year1.jpg)

A laminated flash card, 980 × 680 at (150, 20), over a scrim (`rgba(43, 29, 20, .4)`) that covers everything but Home and Help; the letterbox dims with it. It **grows out of the tapped petal** (300 ms, from a scale of 0.22 at the petal, `transform-origin` set to the petal) and shrinks back into it when closed.

| part | where (card px) | what |
|---|---|---|
| **the petal up close** | 250 × 560 at (50, 104) | the same petal: white, the outline in its colour (8), the star if complete. Its column is fitted as on the sheet with *BM* 108–48 and *BF* 72–34 (measured: the child's own x-height 12–17 CSS px). The selected spelling sits in a pill (`--c` at 14 % over white, a 4 px ring in `--c`). **The whole column is one target**: a tap picks the spelling nearest the finger (as the World Flower picks the nearest petal), so the lines never have to be 44 px tall |
| **the picture** | 112 at (246, 18), on the petal's shoulder, with a small gold speaker (50) | "Hear the sound": `data-nav="sound"`, `data-p`, says the pure sound |
| **▶ gem battle** | 104, right of a ready spelling, at least 38 below the petal's top | starts that gem's Gem Trial |
| **Sensei's face** | 116 at (414, 30) | "Sensei explains" (`data-nav="again"`, Hear it again for the card); it bobs only while she speaks |
| **the spelling she is on** | a speech bubble at (562, 40), 96 tall, Andika 66 | the selected spelling, outlined in the petal's colour |
| **the word shelf** | 3 × 2 cards at (414, 166), 552 wide | Sensei's example words for the selected spelling first, spotlit as she says each, then the other words the child has found with this sound, with no repeats, up to 6. Each card is 176 × 150: the picture (76) above the word (Andika 700, 50: x-height 12 CSS px), the spelling in the petal's colour on a wash of it; a tap says the word |
| **the Practise gate** | 128 at (808, 530), with a chip naming the spelling it practises | the green torii: `onPractice(practiceGemFor(…))`; shown while there is something to practise, as today |
| **close ✓** | 92 at (866, 20) | closes; so does a tap on the scrim or the letterbox |

Every target on the card is at least 44 CSS px (measured, §8.4).

---

## 4. Interactions

### 4.1 Moving around

- **Native scrolling, the whole stage:** `overflow-y: auto`, `scroll-snap-type: y mandatory`, each half-sheet `scroll-snap-align: start` and `scroll-snap-stop: always`, `overscroll-behavior: contain`, `touch-action: pan-y` (the `.scrollable` default). A swipe that starts on a petal, the wall, the paper or a gap moves the sheet. A slow drag follows the finger 1 : 1; on lifting, the sheet settles on the nearest half-sheet.
- **One swipe, one half-sheet:** measured in Chromium (§6), 27 of 30 flicks over two runs turned exactly one half-sheet, and a slow drag always did. The three that went two half-sheets were long flicks (280 CSS px, 80 % of a page before the finger lifted) with CDP touch events queued in a burst; with evenly paced touch, 24 of 24 turned exactly one. WebKit honours `scroll-snap-stop: always`. **Don't clamp the glide in script:** tried, it broke mandatory snapping (the sheet came to rest between half-sheets).
- **The map** jumps (§3.5).
- **Mouse** (desktop, the tweet rig): the wheel scrolls natively; a mouse drag moves the sheet (`scroll-snap-type` off while dragging), and on release it glides to the nearest half-sheet.
- **Nothing moves by itself:** no nudge on opening, no swipe-hint hand, no auto-scroll. The half-sheet to show is set before the first paint (§3.4).

### 4.2 Taps

- **The tap guard:** a tap on the sheet counts only if the sheet moved no more than 6 px since the finger went down, and no scroll event came in the last 90 ms. A tap that stops a gliding sheet never opens a card (measured: the tap stopped the glide, no card opened).
- **A met petal** (anywhere in its 234 × 334 cell): `sfx.petal()`, its sound (`say({ sound })`), and its card grows out of it.
- **A petal not met yet:** a small shake (0.45 s), its silhouette peeks up, `sfx.petal()`, and Sensei: "This sound is still a secret. You'll find it on your adventure!" (`petal_secret`). No card.
- **The card:** as §3.6. A tap on a ready spelling (or ▶) starts its Gem Trial (`sfx.great()`, `onTrial(key)`), as today; a tap on a met spelling selects it and Sensei explains it; a tap on a grey one says `gem_hidden` or `gem_future`.

### 4.3 Home, Back, Hear it again, Help, the World Flower, Next

| control | on the chart | with the card open |
|---|---|---|
| **Home** (top-left) | where the trip was going, else the map (`homeFor`, unchanged; an interrupted trip stays due) | the same (Home is above the scrim) |
| **Back** | none: the chart is a hub, not a show. The World Flower button goes back to the flower | ✓ closes the card |
| **Hear it again** (top-right) | "Tap a petal to see its gems." (`flower_tap`), as today | hidden (the card is modal); Sensei's face on the card replays her explanation, or the line she opened with (`gem_ready`, `t_practise_invite`) |
| **Help** (bottom-right) | "Tap a petal to see its gems. A bouncing gem is ready for a gem battle!" (`help_flower`), **and the ready gems on the half-sheet hop**, so the line is true of what the child sees | "Tap a gem to hear how it spells the sound. Tap the gate to practise it in the dojo!" (`wf_help_petal`) |
| **The World Flower** (under Home) | back to the flower (`sfx.page()`) | under the scrim |
| **Next** (after a trip) | carries on (`onBack`), as today | — |

### 4.4 What Sensei says

The chart adds **no new lines**. Every line below is already recorded and in [TEACHER_SCRIPT.md](TEACHER_SCRIPT.md) or `content/lines.ts`:

| when | line |
|---|---|
| arriving on the free World Flower, and Hear it again | `flower_tap` "Tap a petal to see its gems." |
| Help on the chart | `help_flower` "Tap a petal to see its gems. A bouncing gem is ready for a gem battle!" |
| a tap on a petal not met yet | `petal_secret` "This sound is still a secret. You'll find it on your adventure!" |
| a tap on a met petal | its pure sound |
| the card opens (750 ms later) | the explanation, unchanged (`content/teach.ts`): `introPetal` ("This petal is the sound… /ae/. You can hear it in rain, tail and nail…"), `introGem` for a chosen spelling ("This is the way we spell /ae/ in rain…"), or `sameSound` ("Different spellings of /ae/, the same sound…"), rotating phrasings; then, for a charging gem, `t_practise_invite` "Shall we practise this in the dojo?" |
| a grey spelling | `gem_hidden` / `gem_future` |
| the card opened by a gem that has just filled up | `gem_ready` "A gem is glowing! It's ready for a gem battle." (as today) |
| Help on the card | `wf_help_petal` |
| the trips | unchanged: the first visit (§3.14: `flower_i1`, `tv_flower_petal`, `tv_flower_tap`, `wf_i3` "Inside each petal are shiny gems. Each gem is a way to spell the sound.", `tv_flower_bye`), new spellings (`st_found_new_sounds`, `tv_here_sound` + `tg_<g>_<p>_way`, `tv_another_sound`), a land done (§3.25: `t_visit`, `wf_petals_you_know` "Every shining petal is a sound that you know!", `tv_flower_recap`, `tp_<p>_hear`, `tv_petal_say`, `wf_world_new` "New sounds are hiding in this land. Let's go and find them!"), the gem victory (`trial_win` "You won the gem! It's going into its petal!", `t_new_gem_here`, the ways count, `petal_complete`) and back from practice (`practisedScript`, "Your gem filled up…") |

`t_words_you_found` ("Here are the words you found with this sound. Tap one to hear it!") loses its button: the card has one word shelf, which Sensei's explanation already walks through. The clip stays.

---

## 5. Celebrations and trips on the chart

All of these animate `transform` and `opacity` only, run once, and remove their own elements. `?slow=3` in the mockup plays them three times slower.

### 5.1 A gem won lands on the chart

![The won gem lands beside igh](scroll-design/final/shots/06b-gem-landing-impact-year1.jpg)

After the gem victory (`GemVictory`, unchanged: the music, the gem diving into its big petal, Sensei's explanation), Next ends it:

- **The petal is now complete:** unchanged. The petal flies home onto the World Flower during the victory (`petal-home`), and the flower view opens with that petal blooming.
- **Otherwise (new): the gem lands on the chart.** The chart view opens on the gem's half-sheet with the spelling's mark slot empty. Then:

| t (ms) | what |
|---|---|
| 0 | the chart is there; the spelling is inked, its jewel slot empty |
| 700 | the jewel appears in the middle of the stage, where the victory left it (640, 380): scale 0.4 → 1.5 with a soft gold glow disc behind it |
| 700–2000 | it rises and arcs (to 45 % of the way, 120 px above the higher of the two points), turning a full circle, and dives into its slot beside the spelling, shrinking to the mark's size; four little puffs of sparkles trail it |
| 2000 | **it lands:** the mark pops in (scale 2.2 → 1), the letters pop (0.6 → 1.25 → 1), two rings expand from it (the petal's colour darkened 15 %, and gold), 16 sparks in white-gold, gold and the petal's colour, `sfx.great()` and `sfx.sparkle()`, and the petal's mark on the map pulses twice and updates |
| 2900 | the trip ends (`endTrip()`): Next appears |

Stills: [`06a`](scroll-design/final/shots/06a-gem-landing-flight-year1.jpg) (in flight), [`06b`](scroll-design/final/shots/06b-gem-landing-impact-year1.jpg) (the impact), [`07`](scroll-design/final/shots/07-gem-landed-year1.jpg) (after, with Next).

### 5.2 A sound met for the first time unlocks its petal

After the new-spellings trip (`GemFound`), the chart shows the trip's gems in chart order, 400 ms apart. For a spelling whose sound was not met before:

| t (ms) | what |
|---|---|
| 0 | the petal is still the dotted outline with the silhouette |
| 900 | `sfx.tink()`; the solid outline fades in over the dotted one (500 ms); the silhouette fades out and the picture **sticks on** (scale 0.2 → 1.18 → 1, a small turn, 700 ms, springy) |
| 1500 | a ring in the petal's colour and 14 sparks from the round top; `sfx.magic()` |
| 1800 + 90 ms per line | the column **writes itself in**, line by line (opacity and a small rise) |
| 3400 | done; the map's little petal is coloured and pulses |

For a new spelling of a sound already met, only that line is **inked in**: it pops from pencil to ink (0.6 → 1.25 → 1) with a small burst. Stills: [`08`](scroll-design/final/shots/08-unlock-reception-ae.jpg), [`09`](scroll-design/final/shots/09-unlocked-reception-ae.jpg).

### 5.3 Back from practice

The practised trip (`PractisedTrip`, unchanged beats) plays on the chart at the gem's half-sheet: a transient energy ring beside the spelling fills with gold from `from` to the new energy while Sensei says "Your gem filled up…". If the gem is now full, the ring becomes the gold gem (with its hop), and the card opens with `gem_ready`, as today.

### 5.4 A trip's focus

`?gem=` / `focusGem()`: the chart opens on the gem's half-sheet and a gold ring round the spelling pulses three times, then stays ([`13`](scroll-design/final/shots/13-focus-ai-year1.jpg)).

---

## 6. Performance

**Budgets** (these are the acceptance numbers, §8):

- DOM at most 600 nodes on the chart, card open included.
- Compositor-only animations (`transform`, `opacity`), all finite: nothing endless, nothing running at rest.
- At rest, at CPU ×4: main thread at most 2 %, 0 compositor frames per second.
- Swiping, at CPU ×4: at least 50 fps (frame p95 at most 20 ms), no long tasks, main thread at most 20 % per gesture.
- Opening a card, at CPU ×4: no task over 120 ms.
- No SVG per petal, no filters, no box-shadow animations, no SMIL. The outline is a CSS mask of one SVG teardrop (data URI) on a pseudo-element; the silhouette is a CSS mask of the picture.
- Half-sheets off screen are skipped: `content-visibility: auto; contain-intrinsic-size: auto 936px 720px` on each half.

**Measured on the mockup** (`playtest/runs/scroll-design/final/cost.ts`, the wonder-and-cost judge's probe; Playwright Chromium, 844×390, DPR 3, touch, CPU ×4, GPU raster):

| | new | Reception | Year 1 | production today (audit) |
|---|---|---|---|---|
| DOM nodes (card open) | 259 (305) | 339 (395) | 403 (463) | 1,626–1,828 |
| SVG elements, SMIL | 17 (the frame's icons), 0 | 17, 0 | 17, 0 | 1,433–1,461, 60–205 |
| build (unthrottled) | 8 ms | 12 ms | 18 ms | |
| main thread at rest, compositor frames | 0.1 %, 0 | 0.1 %, 0 | 0 %, 0 | 40–52 %, 60 /s |
| animations running at rest | 0 | 0 (after 1 three-hop gem) | 0 (after 3) | 2–50 CSS + 60–205 SMIL |
| main thread per swipe | 7.6–10.3 % | 8.6–16.3 % | 9.4–17.9 % | 41–57 % |
| frames while swiping: p95 / max | 16.8 / 16.8 ms | 16.8 / 16.8 ms | 16.8 / 16.8 ms | 16.7 / 16.8 ms |
| long tasks while swiping | 0 | 0 | 0 | 0 |
| non-composited animations | 0 | 0 | 0 | |
| opening a card | no long task | one 63 ms task | one 82 ms task (the card's letter fit; cache it per petal state to cut it) | not measured (opening the chart itself: one 56 ms task, Year 1) |

Not profiled: Safari on an iPhone. Check the chart there with Safari's timeline before shipping (§9).

---

## 7. Implementation spec

### 7.1 Files

| file | change |
|---|---|
| `src/scenes/Tree.tsx` | the chart (`PetalChart`, `ChartPetal`, `ChartMap`, `ChartKey`), the card (`PetalDetail` restyled, `WordShelf`, `useExplain`), the landing, the toggle's place, the chart view's background (§7.3–7.5) |
| `src/ui/chartPetal.ts` (new) | pure helpers, no React: the chart's teardrop and its half-width table, the masks, the mark images, `linesOf`, `fitColumn`, `landingHalf`, the geometry constants (§7.2) |
| `src/ui/chartPetal.test.ts` (new) | the fit's invariants (§8.3) |
| `src/styles/tree-chart.css` (new, imported by Tree.tsx) | every class in §7.6 |
| `src/styles/tree-visit.css` | delete the scroll's rules (§7.7); keep `.ex-word(s)`, `.big-petal`, `.bp-*`, `.gv-*`, `.dark-crystal`, `.dc-glint` (the trips and the victory use them) |
| `src/styles/tree-teach.css` | delete the old card layout (§7.7); keep `.explain-btn`, but it bobs only with `.talk` |
| `src/ui/petal.ts`, `src/ui/SoundBadge.tsx`, `src/content/flower.ts`, `src/engine/gems.ts` | unchanged |

The mockup's code is the reference for every number: `docs/scroll-design/final/index.html` (the geometry, `dropPath`, `tabled`, `fit`, `layoutVars`, the SVG marks, the CSS). Port it; don't re-derive it.

### 7.2 `src/ui/chartPetal.ts`

```ts
export const CHART = {
  page: 720, row: 334, col: 234, sheetX: 172, sheetW: 936, padTop: [40, 12], // per half: upper, lower
  petal: { x: 49, y: 30, w: 136, h: 296, stroke: 6 }, pic: { x: 154, y: -2, size: 72 },
  big: { w: 250, h: 560, stroke: 8 },
} as const;
export interface Drop { d: string; half(y: number): number }              // the path, and the inside half-width at y
export function chartDrop(w: number, h: number, sw: number): Drop;        // the mockup's dropPath(), with its half-widths
                                                                          // tabled per stage px (Float32Array)
export function chartMasks(): Record<"--m-fill" | "--m-line" | "--m-dots" | "--m-bigline", string>; // url("data:…")
export const jewelMark: (colour: string) => string;                        // url(): a won gem (JEWEL in the mockup)
export const GOLD_GEM: string; export const STAR: string;                  // url()s
export const HINT: Partial<Record<PhonemeId, [string, string, string]>>;  // uu: b|oo|k, th: |th|in, dh: |th|is
export interface Line { g: string; gem?: Gem; st?: GemState; hint?: boolean }
export function linesOf(pt: Petal, states: GemState[]): Line[];            // hint first, then each spelling once
export interface FitOpts { top: number; bottom: number; pad: number; M0: number; Mmin: number; F0: number; Fmin: number;
  rLo: number; rHi: number; gapMax: number; picY?: number; picHalf?: number; card?: boolean }
export const SHEET_FIT: FitOpts; // { top 16, bottom 266, pad 8, M0 58, Mmin 26, F0 46, Fmin 22, rLo .62, rHi .85, gapMax 22, picY 34, picHalf 72 }
                                 // (for each M, F: try the column's top at top + 0, 6, 12, 18, 24; then widen the gap)
export const CARD_FIT: FitOpts;  // { top 44, bottom 476, pad 12, M0 108, Mmin 48, F0 72, Fmin 34, rLo .6, rHi .8, gapMax 18, card true }
export function fitColumn(lines: Line[], drop: Drop, o: FitOpts, measure: (text: string, px: number) => number):
  { M: number; F: number; gap: number; top: number };                     // measure: Andika 400 at px (a cached canvas);
                                                                          // memoise by petal + states: it is pure
export function landingHalf(pts: ChartPetal[], ctx: { focus?: string | null; landing?: string | null; reveal?: string[];
  states: (p: PhonemeId) => GemState[]; newest?: PhonemeId | null }): number; // §3.4's order; 0–5
export const halfOf: (p: PhonemeId) => number;                             // (page − 1) × 2 + (index ≥ 8 ? 1 : 0)
```

The marks' widths the fit reserves: won 0.62 *M*; ready max(30, 0.66 *M*) + 0.03 *M* − 4; on the card, charging 0.54 *M* and 24 px for the pill. Wait for `document.fonts.load("400 50px Andika")` before the first fit (Tree already loads Andika; `measure` must not run before it has).

### 7.3 `PetalChart` (replaces `PetalScroll`)

```tsx
function PetalChart(props: {
  save: Save; known: Set<string>;
  onOpen: (pt: Petal, from: HTMLElement) => void;
  focus?: string | null;                       // a trip's gem: land there, ring it
  energyShow?: Record<string, number>;         // the practised beat: a transient energy ring
  reveal?: string[];                           // spellings just met: unlock or ink in
  landing?: string | null;                     // a gem just won: land it (§5.1), then onLanded()
  onLanded?: () => void;
}): JSX.Element
```

- **DOM:** `div.pc-view` (a positioned wrapper, the stage) holding:
  - `div.scrollable.petal-scroll.pc-scroller` (keep both old class names: scripts use them) → `div.pc-board` → three `section.pc-sheet[data-sheet]` (`--pin`, `--pin-d`) → two `div.pc-half[data-half]` each (`.lo` for the lower) → the half's `ChartPetal`s, plus `ChartKey` after sheet 3's last row;
  - `i.pc-edge.t`, `i.pc-edge.b`;
  - `ChartMap`.
- **Masks:** set `chartMasks()` and `--gold-gem`, `--star` once as custom properties on `.pc-view` (style prop).
- **Landing on arrival:** `useLayoutEffect(() => { scroller.scrollTop = landingHalf(…) * 720 }, [])`, before the first paint. Never smooth-scroll on arrival.
- **The half-sheet on screen:** one `IntersectionObserver` (root: the scroller, threshold 0.6) sets `current` in a ref, moves the map's frame (`style.transform`), and toggles `.arrive` on that half (direct class changes; no React state, so nothing re-renders while scrolling). `sfx.page()` when the child turned the page (not on arrival).
- **The tap guard:** `onPointerDown` on the scroller stores `scrollTop`; a `scroll` listener (passive) stores the time. The board's `onClick` finds `closest("[data-p]")` and ignores the tap if the sheet moved over 6 px or scrolled in the last 90 ms. Keyboard activation (Enter on a focused petal, `e.detail === 0`) is always allowed.
- **A met petal:** `sfx.petal(); say({ sound: p }); onOpen(pt, el)`. **A petal not met yet:** restart `.shake` on it, `sfx.petal()`, `say({ line: "petal_secret" })`.
- **Mouse:** a `pointerType === "mouse"` drag sets `scrollTop` with `.dragging` (snap off) and glides to `round(scrollTop / 720)` on release; the wheel scrolls natively.
- **Help:** `useHelp` in `Tree` for the free view also restarts `.arrive` on the current half (expose `rehop()` through a ref, or re-toggle the class on `document.querySelector(".pc-half[data-current]")`).
- **The landing:** when `landing` is set, add `.pending` to its line, wait 700 ms, fly a `div.pc-flyer` (`--jewel`) with the WAAPI keyframes of §5.1 (from stage (640, 380) to the mark: `stageRect(line)` right edge + 0.36 *M*, centre − 0.06 *M*), then swap `.pending` for `.landed`, `fx.ring` ×2 and `fx.burst` (the game's particle layer, not the mockup's DOM sparks), `sfx.great()` and `sfx.sparkle()`, pulse the map mark, and call `onLanded()` 900 ms later.
- **The reveal:** for each key in `reveal` (chart order, 400 ms apart): a petal whose sound was not met before gets `.unlock` for 2.5 s with a temporary `i.pc-dots` and `i.pc-sil` inside it; otherwise its line gets `.inked`. Then `fx.ring` / `fx.burst`, `sfx.tink()` and, for an unlock, `sfx.magic()`.
- **Energy:** a line whose key is in `energyShow` gets `.energy` with `--e` = the shown value; the CSS transition fills the ring.

### 7.4 `ChartPetal`, `ChartMap`, `ChartKey`

```tsx
const ChartPetal = memo(function ChartPetal({ p, sig, states, energy, focus, reveal }: {
  p: PhonemeId; sig: string;                   // states.join() + focus + reveal + energy: the memo key
  states: GemState[]; energy?: Record<string, number>; focus?: string | null; reveal?: "unlock" | "ink" | null;
}) { … }, (a, b) => a.sig === b.sig);
```

- **The element:** `div.pc-petal[role=button][tabIndex=0][aria-label="petal <p>"][data-p]`, plus `.mys` (not met), `.done` (complete), `.shake`, `.unlock`. Its style sets `--c` (the chart colour), `--ink-c` (`--c` darkened to 4.5 : 1), `--jewel` (`jewelMark(petalColour(p))`), and either `--M`, `--F`, `--gap`, `--top` (met) or `--sil` (`mix(--c, "#e9e3dc", .5)`) and `--pic` (`url(petalImg(p))`) (not met).
- **Met:** `img.pc-pic` (`src={petalImg(p)}`, `alt=""`, `decoding="async"`, `draggable={false}`) and `span.pc-col` of lines: `span.pc-ln` with `.m.w` (won), `.m.r` (ready), `.m.c` (charging), `.f` (hidden), `.f.x` (future), `.hint`; `data-gem-chip={key}` on every met line (PractisedTrip and the landing look lines up by it), `.focus` on the trip's gem.
- **Not met:** `i.pc-sil` only (2 nodes a petal).
- **Nodes:** 2 per mystery petal, 3 + lines per met petal; the whole chart is 120–265 nodes.
- **`ChartMap`:** `div.pc-map[aria-label="Petal chart map"]` with three `button.pc-msheet[aria-label="sheet <n>"]` of `i.pc-mk` (`.met` / `.done`, `--mc` = `petalColour`), a `b.pc-mdot` only where a gem is ready, and `div.pc-mframe`. `onPointerDown` (capture) jumps to the half under the finger (`scrollTo({ top: half * 720, behavior: "smooth" })`); `onPointerMove` while captured scrubs.
- **`ChartKey`:** the grown-ups' key in sheet 3's empty last row (`div.pc-key`: "For grown-ups: **black** = met · grey = still to find / ◆ gem won · ◆ ready for a gem battle · ★ petal complete", Baloo 2 600 at 25, readable). It replaces `GemKey`.

### 7.5 `PetalDetail` (same export, same props) and the Tree scene

**`PetalDetail`** keeps its props (`pt`, `gem`, `onClose`, `onTrial`, `onPractice`, `quiet`, `invite`, `lead`), its nav (`useNav({ modal: true, again: …, againAt: "own", sound: null })`), `useHelp("wf_help_petal")`, `practiceGemFor`, the invite and lead logic, and `explained()`. New markup:

```tsx
<div data-modal className="pd-backdrop" {...tapProps(onClose)}>
  <div className="pd-card" style={{ …colours, …fitVars, transformOrigin }} onPointerDown={stop}>
    <div className={`pd-big ${done ? "done" : ""}`} data-petal={pt.p} role="button" aria-label="the spellings"
         onPointerDown={pickNearestLine}>                                   {/* e.target.closest(".pd-ln") ?? nearest by y */}
      <div className="pd-big-line" />
      <div className="pd-col">{lines: <span className="pd-ln m r|w|c | f [x] | hint [sel]" data-key data-st data-gem-chip
                                       aria-label={`gem ${g} ${st}`} style={{ "--e": energy }}>{g}</span>}</div>
      {ready lines: <RoundButton className="go pd-trial" label={`Gem battle ${g}`} style={{ left: 260, top }}>▶</RoundButton>}
    </div>
    <button className="pd-hear" data-nav="sound" data-p={pt.p} aria-label="Hear the sound" {...tapProps(() => say({ sound: pt.p }))}>
      <img src={petalImg(pt.p)} alt="" /><span className="pd-spk"><Icon.speaker /></span></button>
    <div className="pd-close"><RoundButton sm label="close" onClick={onClose}><Icon.check /></RoundButton></div>
    <button className={`explain-btn pd-sensei ${talking ? "talk" : ""}`} data-nav="again" aria-label="Sensei explains" …><TalkingFace who="sensei" /></button>
    <div className="pd-say-chip">{selGem?.g}</div>
    <ExampleWords show={shelf} colour={colour} className="pd-shelf" />      {/* Sensei's words first, then the found ones */}
    {practiseKey && <><RoundButton label="Practise in the dojo" className={`go pd-practise ${pulse ? "pulse" : ""}`} …><GateIcon /></RoundButton>
                     <span className="pd-gate-chip">{gemByKey(practiseKey)?.g}</span></>}
  </div>
</div>
```

- **`pickNearestLine`:** a bot's `dispatchEvent` on `[aria-label="gem m ready"]` lands on that span and uses it; a finger picks the line whose centre is nearest `clientY`. Then `tapGem(g, st)`, unchanged: ready starts the trial, a met gem is selected and explained, grey ones say their line.
- **`Explain` becomes `useExplain(pt, selGem, metGems, save, run, onDone)`**, returning `{ shown, talking }`: the same speech (`introGem` / `sameSound` / `introPetal`, 750 ms after opening, then 150 ms), with `talking` true from the first clip to the end.
- **The shelf:** `[...shown, ...found]` without repeats, up to 6. `found` is `MetWords`' list (the save's words with this sound, newest first) as `{ word, highlight: { g, p } }`. `ExampleWords` already spotlights the word being said and says a word when it's tapped. `.pd-shelf` makes it a 3-column grid of 176 × 150 cards, the picture above the word.
- **Opening:** set `transform-origin` from the tapped element's `stageRect` relative to the card, and animate `pd-card` with WAAPI (scale 0.22 → 1.02 → 1, opacity, 300 ms). Closing: the reverse, 200 ms, then `onClose`.
- **The letterbox:** while open, add `vp-dim` to `.viewport` and close on a `pointerdown` whose target is `.viewport` itself; remove both on unmount.
- **Deleted from the card:** `SoundBadge` (the picture on the shoulder is the sound button, with the same `data-nav="sound"`), `Jewel` and `DarkCrystal` for spellings, `MetWords`' speaker row.

**`Tree`:**

- **The toggle:** `div.tree-toggle` at left 18, top 150, in both views; same labels ("Petal chart" / "The World Flower"), same pulse after 6 s.
- **View 1:** the scene gets `.tree-chart` (`background: var(--wall)`), and no `bg-img` and no `.vignette` (today's blurred background image goes). A `useEffect` toggles `vp-chart` on `document.querySelector(".viewport")` while `view === 1`.
- **`openPetal` for the chart:** `onOpen={(pt, el) => { setOpenQuiet(false); setOpenLead(null); setOpenFrom(el); setOpen(pt); }}`, with `openFrom` passed to `PetalDetail` for the grow-out.
- **The victory's end:** `onDone={(home) => { playMusic("world_blossom"); if (home) { setView(0); /* bloom, as today */ endTrip(); } else { setView(1); setLanding(visit.gem); } }}`, and `PetalChart`'s `onLanded={endTrip}`.
- **`window.__snState`:** unchanged fields (`scene`, `view`, `open`, `visit`, `step`, `beat`, `intro`, `busy`, `done`), plus `half` (the half-sheet on screen, 0–5) and `landing` (true while a gem is landing).

### 7.6 CSS classes (`src/styles/tree-chart.css`)

Port them from the mockup's `<style>`, renaming as listed (mockup → game):

| mockup | game | what |
|---|---|---|
| `.viewport` (wall) | `.viewport.vp-chart { background: #efe4d1 }`, `.viewport.vp-dim { background: #a19485 }` | no bars; the bars dim with the scrim |
| `.scroller` | `.pc-scroller` | `position: absolute; inset: 0; overflow: hidden auto; scroll-snap-type: y mandatory; overscroll-behavior: contain; touch-action: pan-y; scrollbar-width: none` (`.dragging`: snap off) |
| `.sheet`, `::before`, `::after` | `.pc-sheet` | the paper, the film edge, the pins |
| `.half`, `.half.lo` | `.pc-half`, `.pc-half.lo` | the 4 × 2 grid, the snap point, `content-visibility: auto` |
| `.edge.t`, `.edge.b` | `.pc-edge` | the 18 px fades into the wall |
| `.petal`, `::after`, `.done::before`, `.mys::after` | `.pc-petal` | the cell, the outline mask, the star, the dotted outline |
| `.pic`, `.sil`, `.col` | `.pc-pic`, `.pc-sil`, `.pc-col` | |
| `.ln`, `.m`, `.f`, `.x`, `.hint`, `.w/.r::after` | `.pc-ln`, `.m`, `.f`, `.x`, `.hint`, `.w/.r::after` | letters and marks |
| `.half.arrive .ln.r::after` + `@keyframes hop` | `.pc-half.arrive .pc-ln.r::after` | three hops, never endless |
| `.shake`, `.sil` peek | `.pc-petal.shake` | the mystery tap |
| `.ln.focus::before` + `ring3` | `.pc-ln.focus::before` | three pulses, then still |
| `.unlock`, `.dots`, `stick`, `writein`, `.inked` | `.pc-petal.unlock`, `.pc-dots`, `.pc-ln.inked` | §5.2 |
| `.pending`, `.landed`, `land`, `.flyer` | `.pc-ln.pending`, `.pc-ln.landed`, `.pc-flyer` | §5.1 |
| (new) | `.pc-ln.energy::after` | the practised beat's ring: `conic-gradient(var(--gold) calc(var(--e) * 1turn), #ded4c7 0)` masked to a ring, `transition: --e 1.4s` (register `--e` with `@property` as a `<number>`) |
| `.map`, `.msheet`, `.mk`, `.mdot`, `.mframe` | `.pc-map`, `.pc-msheet`, `.pc-mk`, `.pc-mdot`, `.pc-mframe` | §3.5 |
| `.key` | `.pc-key` | the grown-ups' key |
| `.scrim`, `.card` | `.pd-backdrop`, `.pd-card` | the card (§3.6) |
| `.big`, `.big-line`, `.big-col`, `.big .ln…`, `.sel` | `.pd-big`, `.pd-big-line`, `.pd-col`, `.pd-ln`, `.sel` | |
| `.hear`, `.spk`, `.sensei`, `.say-chip`, `.shelf`, `.wc`, `.trial`, `.gate`, `.gate-chip` | `.pd-hear`, `.pd-spk`, `.pd-sensei`, `.pd-say-chip`, `.pd-shelf .ex-word`, `.pd-trial`, `.pd-practise`, `.pd-gate-chip` | |
| `prefers-reduced-motion` block | the same | no hop, shake or ring |
| (new) | `.tree-base[inert] :is(.pc-half.arrive .pc-ln.r)::after { animation: none }` | nothing hops under a trip |

### 7.7 What to delete

- **`Tree.tsx`:** `scrollTap`, `PETAL_H`, `GemChip`, `MIST`, `ScrollPetal`, `ProgressVine`, `Roller`, `SwipeHand`, `GemKey`, `HINT_KEY` and `hintSeen` (and the `superninja.scrollHint` key: nothing reads it now), `PetalScroll`, the scroll's `IntersectionObserver`s (`data-on`, `data-live`), `MetWords` and `Explain` (folded into §7.5), the chart view's `bg-img` filter. **Keep:** `WorldFlower`, `FLOWER_RINGS`, `flowerColour`, `petalLight`, `DarkCrystal` (BigPetal uses it), `Jewel`, `BigPetal`, `slotsOf`, `ExampleWords`, `useSpokenWord`, `GemVictory`, `PractisedTrip`, `ChartIcon`, `FlowerIcon`, `GateIcon`, and every export (§7.8).
- **`tree-visit.css`:** `.sp-cv`, `.sp-mist`, `.sp-blob`, `.sp-rune`, `.sp-focus`, `.wf-focus` and their keyframes; `.sp-*` and `.wf-focus` in the `.tree-base[inert]` rule.
- **`tree-teach.css`:** `.pd-sheet`, `.pd-left`, `.pd-petal`, `.pd-petal-hear`, `.pd-actions`, `.pd-main`, `.pd-gems`, `.pd-gem`, `.pd-play`, `.pd-explain`, `.pd-found`, `.pd-found-words`, `.met-word`, `.chip-reveal`; `.pd-backdrop` and `.pd-close` move to tree-chart.css; `.explain-btn`'s endless `helptalk` moves under `.talk`.

### 7.8 What must stay compatible

- **The `Tree` props** (`onBack`, `onTrial`, `onPractice`, `celebrate`, `visit`) and App's routes: unchanged.
- **Exports** used elsewhere: `Tree`, `visitFlower`, `focusGem`, `celebrateGem`, `tripDue`, `setTripDue` (App); `WorldFlower`, `FLOWER_RINGS`, `BigPetal`, `ExampleWords`, `Jewel`, `petalLight`, `slotsOf` (Intros, Stickers); `PetalDetail`, `DarkCrystal`, `GateIcon`, `FlowerIcon`, `teardrop`, `teardropAt`, `mix`, `neededGems`.
- **The engine:** `gemState`, `energyOf`, `petalComplete`, `knownNow`, `readyGems`, `canPractise`, `markVisited`, `lastPractice`: read only, no changes.
- **The celebrations and trips:** `GemVictory`, `FlowerIntro`, `GemFound`, `WorldVisit`, `PractisedTrip` play as today; only what shows after them changes (§5).
- **`SoundBadge` and `petal.ts`:** untouched (`petalImg`, `petalColour`, `mix` are used by the chart).
- **Hooks for bots, the treadmill and the tweet kit:** `.petal-scroll` and `.scrollable` on the scroller; `[aria-label="petal <id>"]`, `[data-p]` and `role="button"` on each petal, with an `img` inside once met (`scripts/treadmill/sound-display.ts` finds "a petal on the chart" that way); `[data-gem-chip]` on met lines; `[aria-label="Petal chart"]` and `[aria-label="The World Flower"]` on the toggle; `[aria-label^="gem "]` on the card's spellings (now spans that take `pointerdown`); `[data-petal]` on the card's big petal; "close", "Practise in the dojo", "Sensei explains", "Hear the sound", `[data-nav="again"]`, `[data-nav="sound"]`; `window.__snState` (§7.5).
- **Scripts that swipe sideways must swipe vertically,** in the same change: `scripts/record-clips.ts` `swipeScroll` (dx → dy), `assets-src/tweet/2026-09-26/clip-recipes.ts` `swipe`, and `assets-src/tweet/2026-09-26/petal-scroll/drive.ts` (`scrollLeft` → `scrollTop`, `xDistance` → `yDistance`). Update `scripts/treadmill/sweep.ts`'s `INTENT` texts for `tree`, `tree-petal` and `tree-practised` ("scroll" → "chart", the card's parts).
- **Docs:** NAVIGATION.md §4 (the petal panel's header is the picture on the petal's shoulder, not a `SoundBadge`) and §2.3's World Flower rows; SOUND_DISPLAY.md rows 52–53; PERF.md fix 9 (its chart half is superseded).

### 7.9 Order of work

1. `chartPetal.ts` with its tests.
2. `PetalChart`, `ChartPetal`, `ChartMap`, `ChartKey` and tree-chart.css; delete the scroll. Compare the stills (§8.1).
3. The card (`PetalDetail`, `useExplain`, the shelf).
4. The landing, the reveal, the energy ring, the focus ring.
5. The scripts in §7.8, then the sweep and the soak.

---

## 8. Acceptance

### 8.1 Stills to compare with the mockup

Take each at 844×390, DPR 3, touch, with the audit's saves (`playtest/runs/scroll-design/audit.ts`: new, Reception, Year 1). Open the World Flower and tap "Petal chart" (or use `?scene=tree&gem=…` where given). Each must match its mockup still in layout, letters, marks and colours.

| still | the game | the mockup ([`shots/`](scroll-design/final/shots/)) |
|---|---|---|
| a Reception child's first screen | Reception save, `?scene=tree` → "Petal chart" | `01-overview-reception` |
| mid-swipe | Year 1, finger down 150 CSS px up | `02-mid-scroll-year1` |
| a new child's first screen | new save | `03-new-child` |
| a Year 1 child's first screen | Year 1 save | `04-year1-child` |
| the /ae/ card | Year 1, `?scene=tree&gem=ai>ae&open=1` | `05-detail-ae-year1` |
| a gem landing (in flight, impact, after) | Year 1 with *igh* just won: `?scene=tree&gem=igh>ie&celebrate=1`, Next to the end | `06a`, `06b`, `07` |
| an unlock | Reception, `?scene=tree&visit=spelling:ai>ae`, Next to the end | `08`, `09` |
| a mystery tap | Year 1, tap /oy/ | `10-mystery-tap-year1` |
| the /d/ and /s/ cards | Reception /d/, new /s/ | `11`, `12` |
| a trip's focus | Year 1, `?scene=tree&gem=ai>ae` | `13-focus-ai-year1` |
| sheet 2 top, sheet 3 bottom (the key) | Year 1 | `14`, `15` |
| the whole chart, each child | a full-page capture of the scroller | `whole-new`, `whole-reception`, `whole-year1` |

### 8.2 Sweep cases

- **The existing tree cases pass unchanged in intent:** `tree`, `tree-petal`, `tree-victory`, `tree-found`, `tree-world`, `tree-practised`, `practise`, `trial`, `tree-practise-tap`, `tree-home`, `home-trip`, `home-trial`.
- **New `tree-chart`:** `?scene=tree` with `FLOWER_SAVE`, tap "Petal chart", three swipes up and one down, tap /ae/, close with the scrim, tap a petal not met yet, Home → the map.
- **New `tree-land`:** a victory whose petal isn't completed by it: `?scene=tree&gem=oa>oe&celebrate=1` with a save that has met *oa* and *ow* and won neither (for example the audit's Year 1 save). It ends on the chart with the jewel beside *oa*, then `done`.
- **Every tree case:** no `tiny-target` (petal cells 115 × 164, map sheets 51 × 63, every card target at least 44), no `zone-conflict`, no `covered-target`, `home-missing` passes, and no `auto-advance`: the chart never moves by itself.

### 8.3 Unit tests (`chartPetal.test.ts`)

For every petal, in every state combination of the three saves and with every spelling met:
- every line fits inside the teardrop, marks included;
- *F* ≥ 22 on the sheet and ≥ 34 on the card;
- *M* ≤ 1.6 *F* whenever *F* ≥ 0.62 *M* fits;
- no line is below the petal's `bottom`.

Also: `landingHalf` follows §3.4's order, and `halfOf` maps the 44 petals to the 6 half-sheets.

### 8.4 Numbers (Chromium, 844×390, DPR 3, touch, CPU ×4; the mockup's probe `playtest/runs/scroll-design/final/cost.ts` can be pointed at the game)

- DOM ≤ 600 with a card open.
- At rest: main thread ≤ 2 %, 0 compositor frames, 0 running animations 2 s after arrival.
- Swiping: frame p95 ≤ 20 ms (≥ 50 fps), 0 long tasks, main thread ≤ 20 % per gesture, each flick one half-sheet (at least 13 of 15 with queued 60 Hz touch; all with paced touch).
- A tap during a glide opens nothing; a tap on the scrim or the letterbox closes the card.
- Opening a card: no task over 120 ms.

### 8.5 The soak's World Flower rows

`scripts/treadmill/soak.ts --mobile --cpu 4` ([PERF.md](PERF.md) §5) must keep passing its World Flower rows: main thread ≤ 30 %, longest task ≤ 120 ms, the screen's median fps ≥ 50, endless animations the compositor can't run ≤ 2, endless animations on hidden elements ≤ 2, DOM ≤ baseline + 600 after the level. Add two rows for the chart: **the still chart** (main thread ≤ 2 %, rAF requests ≤ 5 /s, 0 endless animations) and **swiping the chart** (median fps ≥ 58, main thread ≤ 20 %), replacing PERF's "swiping the World Flower's petal chart" row (today 18.1 %).

---

## 9. Decisions and open questions

**Decisions** (made without asking, as the house rules say; logged here because this run could only write to `docs/scroll-design/` and this file, so `docs/DECISIONS.md` isn't touched):

1. **Vertical half-sheet pages, not horizontal ones.** The chart is a portrait sheet read top to bottom; sliding it up shows the rest of the same sheet, and each screen keeps the chart's own 4 columns and rows. Horizontal paging would put a sheet's two halves side by side.
2. **Petals not met yet have no letters.** Jonas asked for "a bit mysterious"; the silhouette keeps it guessable, the letters writing themselves in are the unlock's payoff, and empty dotted petals keep the page calm. (The chart-likeness judge preferred faint print; the small-hands and wonder judges preferred silhouettes.)
3. **White insides, always.** Progress shows as marks beside spellings, a star at the point and the map; the colour washes and tints go.
4. **Regular weight, one or two sizes per petal, ligatures off.** The child's own spellings are at most 1.6 × the others and black; the rest are pencil grey.
5. **Charging has no mark on the sheet.** Energy shows on the card and in the practised beat.
6. **A glowing spelling on the card starts its battle when tapped, as today;** ▶ is a bigger second way in.
7. **A won gem lands on the chart** unless its petal is now complete (then the flower homecoming, unchanged).
8. **No swipe hint, no nudge, no self-scrolling.** The chart opens on the thing to do next; the paper running off the edge and the map show there's more. Watch for this in playtests.
9. **No ninja on the chart.** It keeps the chart calm and the whole width for the sheet; the victory still has the ninja.
10. **The World Flower button moves under Home** in both views, so it is in one place.
11. **The 12 extra sounds are a third sheet** in the same style, with the grown-ups' key in its empty last row.
12. **Pictures are 72 stage px** (SOUND_DISPLAY's recognition minimum), bigger than the chart's.
13. **The card's column is one target** that picks the nearest spelling; `t_words_you_found` loses its button.
14. **The letterbox is the wall** (dimmed under the card), and a tap there closes the card.

**Open questions and follow-ups:**

- **Asset bugs** (the chart-likeness judge): `public/a/i/petal_uu.webp` is a green rubber duck, but /uu/'s picture should be the open book ("duck" has /u/, not /uu/): regenerate it. `petal_s.webp` is a solid red ball (it reads as "ball" and clashes with /b/'s ball); the chart has a red outline circle.
- **"x" (as /ks/) on /s/, and "q" and "x" on /k/,** aren't on the school's sheet. They stay, last in the list, in the same style as the rest.
- **Swipes in the letterbox** still do nothing (a quarter of the phone's width). Letting them move the chart needs `Stage` to pass touches through; left for a separate change.
- **Chromium's late fling:** with queued touch events, a long flick sometimes turned two half-sheets (§4.1). Check on Jonas's phone and an Android phone before trying anything in script.
- **Safari on the iPhone** hasn't been profiled; check the chart's paint cost and `content-visibility` there.

---

## 10. Evidence

- **The mockup:** `docs/scroll-design/final/index.html`, built from `playtest/runs/scroll-design/final/template.html` by `build.py` (which adds the petal and word data dumped into the laminated mockup from `src/content/flower.ts`).
- **Stills:** `docs/scroll-design/final/shots/*.jpg` (1688×780), from `playtest/runs/scroll-design/final/shots.ts`, which serves the repo root on its own port (never the shared dev server). `publish.py` makes the JPGs and `compare.png`.
- **Cost:** `playtest/runs/scroll-design/final/cost.ts` (the wonder-and-cost judge's probe, pointed at the final mockup); raw JSON in `playtest/runs/scroll-design/final/out/`.
- **Touch:** `interact.ts` (taps, the tap guard, the scrim, the letterbox, the map, target sizes) and `snaptest.ts` (flicks per half-sheet, queued and paced touch), same folder.
- **Side by side with the school's chart:** `playtest/runs/scroll-design/final/review-chart-vs-final-sheet*.png`. **Local only:** they contain the school's sheet, so they must never be copied into `docs/`.
