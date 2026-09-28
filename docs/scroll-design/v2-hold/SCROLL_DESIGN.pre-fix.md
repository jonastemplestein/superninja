# The World Flower v2: petals that fill, gems that shine

**Status:** the final design for the World Flower, both views, 27 September 2026. It replaces [v1](scroll-design/v1/SCROLL_DESIGN.md), which was never built. The two views are the radial flower (`WorldFlower` in `src/scenes/Tree.tsx`) and the petal chart (today's "petal scroll", `PetalScroll` in the same file). Nothing in `src/` has changed yet. §7 is the build spec for Tree.tsx and its CSS, and §8 is the acceptance.

- **Working mockup:** [`scroll-design/final/index.html`](scroll-design/final/index.html). Serve the repo root and open `/docs/scroll-design/final/?view=chart&child=programme` (or `view=flower`, and `child=new|first|reception|year1|away`). Its URL options are listed at the top of the file. Every petal and gem state in it comes from the real `src/content/progress.ts`, run on the model's own simulated children. The mockup invents no state.
- **v1 and today beside v2:** [`scroll-design/final/compare.png`](scroll-design/final/compare.png).
- **Stills:** [`scroll-design/final/shots/`](scroll-design/final/shots/) (§8.1 lists them). Phone stills are 844×390 at DPR 3; the `s…` stills are a small phone, 667×375 at DPR 2.
- **The model:** [`scroll-design/progress-model.md`](scroll-design/progress-model.md) and `src/content/progress.ts` (tested: `bun test ./src/content/progress.test.ts`).
- **Spellings with more than one sound:** [MULTI_SOUND.md](MULTI_SOUND.md) (Sound Detective). This spec draws its marks and opens its game; MULTI_SOUND.md owns the game.
- **Earlier work:** v1 and its evidence are in [`scroll-design/v1/`](scroll-design/v1/). v1's layout, paging, tap guard, letter fitting, card motion and gem landing carry over. The numbers that matter are restated here; where this spec says "as v1 §x", the details are in [`scroll-design/v1/SCROLL_DESIGN.md`](scroll-design/v1/SCROLL_DESIGN.md) and still apply.

All sizes are **stage px** (the game's 1280×720 layout) unless marked CSS px. On a phone in landscape (844×390) the stage is scaled by 0.4917, so 100 stage px is 49 CSS px.

---

## 1. Why

**Jonas (27 Sep), on the scroll before v1:** "The scroll is ugly as fuck and barely usable. Review that and make it more similar to what the kids are used to from the image I shared with you before." v1 ([`scroll-design/v1/`](scroll-design/v1/)) answered with the school's laminated chart, half a sheet per screen.

**Jonas (27 Sep), on v1:** "Scroll design looks good but a bit busy. Not clear what the green play button does for example. And of course needs a bit of a glow up. But right direction. I think in general it should be like this. Each petal on the flower starts missing, then comes back as a faint outline when you have encountered the sound and then you need to 'fill it up' to complete it. So there are three high level states for the petal kinda or maybe it's more like a gradient or sth and it should be possible to look visually at the flower easily to see progress. And in each spelling gem in a sound we also need to have a measure of progress towards mastery. In fact some spellings can even make multiple sounds. Like ea. That should also be something that is explicitly discussed and has a game."

**What that asks for, and where it is answered:**

| Jonas | v2 |
|---|---|
| "a bit busy" | No map, no pins, no Sensei face on the card, no `?` placeholders, no dust bands, no progress ring on the toggle. Gems still to win are drawn in pencil, so only won jewels are in ink. One action per card (§3.6). |
| "not clear what the green play button does" | There is no ▶ anywhere. Every control shows what it does and Sensei names it the first time: the dojo gate (with a chip naming the spelling it practises), the gem guardian (the monster you battle for the gem), and the magnifying glass (Sound Detective) (§4.3). |
| "a bit of a glow up" | The colour in the petals, a gold line when a petal has all its gems for now, gloss, a star, a gold aura and one shine for a complete petal, jewels that clear and sparkle as they are mastered (§3.1, §3.2). |
| "starts missing, then comes back as a faint outline … then you need to fill it up" | The petal life cycle: missing → outline → filling → complete, the same on both views (§3.1). |
| "maybe it's more like a gradient … look visually at the flower easily to see progress" | The fill is a gradient: the petal's colour covers the share of its whole chart column the child has won, true to area. The flower shows every sound's progress at once (§3.5). |
| "in each spelling gem … a measure of progress towards mastery" | The gem meter beside every spelling met: clear glass → filling with its colour → gold (ready for its gem battle) → a frosted jewel → a polished jewel that sparkles (§3.2). |
| "some spellings can even make multiple sounds. Like ea … explicitly discussed and has a game" | A faint sound line under such spellings, the fork chip on the card, the fork panel, and Sound Detective's magnifying glass (§3.3; the game is [MULTI_SOUND.md](MULTI_SOUND.md)). |

---

## 2. The design at a glance

![v1 and today beside v2](scroll-design/final/compare.png)

- **One life cycle, two views.** A petal is **missing** until its sound is met, comes back as a **faint outline**, **fills with colour** as its gems charge and are won, gets a **gold line** when it has every gem the child can win for now, and is **complete**, with a star, gloss and a gold aura, when its whole chart column is won.
- **The colour is progress through the whole chart column** (the model's `whole`), true to area. It only ever rises. On the **chart** it colours in from the round top, where the child's own spellings are (the chart lists the commonest spellings first). On the **flower** it grows out from the heart.
- **Every spelling met has a gem meter**: a small cut gem beside it that fills with the petal's colour and then becomes a jewel.
- **A spelling that represents more than one sound** carries a faint sound line under its letters, one segment per sound, in those petals' colours. On the card it opens the fork panel and Sound Detective.
- **Time never takes colour away.** A gem not used for a while gets dusty (grey specks), and a complete petal loses its gloss until it is practised again.
- **The chart is v1's:** the school's laminated sheets, half a sheet per screen, one swipe per half-sheet. **The card is calmer:** one speaker, the chosen spelling and its gem, three words, one action.
- **Calm and cheap:** 190–544 DOM nodes on the flower and 152–484 on the chart, 0 % main thread and 0 compositor frames at rest, 16.8 ms frames while swiping (§6).

---

## 3. The design

### 3.1 The petal life cycle

![The chart for a mid-Year 1 child](scroll-design/final/shots/11-chart-programme.jpg)

A petal's look comes from `petalProgress` / `flowerOverview` in `src/content/progress.ts`, through one pure mapping, `petalLook` (§7.2):

| look | from the model | on the chart | on the radial flower |
|---|---|---|---|
| **missing** | `state === "missing"` | a faint dotted slot in a pale tint of its colour (`--ghost`, `mix(colour, paper, .7)`), no picture, no letters. The chart is the school's sheet, so every petal keeps its place | **nothing.** The ring has a gap. A sound hiding in the child's land (`soon`) shows as a faint white dotted outline (static). A tap in a gap says the sound is still a secret |
| **outline** | met, nothing coloured yet (`whole` = 0) | the outline in its colour at **50 % opacity**, the picture, the spellings (met in ink, the rest in pencil), a clear gem beside each met spelling | a thin outline in its colour at 60 %, the pale glass inside at 42 %, the picture at 80 % |
| **filling** | `0 < whole`, not `complete.full` | the colour fills from the top down to the level (§3.4.3); a crisp surface line in the petal's colour darkened 8 %, and a soft light just above it | the colour grows out from the heart to the level: deepest at the heart, lighter towards the surface, which is a thin white line (80 %); the rest is pale glass at 60 % |
| **all won for now** (a modifier of filling) | `state === "complete"` and not `complete.full`: every spelling taught so far is won | the surface line is **gold** (5 px `#ffc53d`), with a gold glow under it | the surface line is gold |
| **complete** | `complete.full`: the whole chart column is won | the whole petal in colour, a deeper outline (8), gloss at the top left, a gold star (42) at the point and two sparkles, a gold aura; a shine sweeps across it once when its half-sheet arrives | the whole petal in colour with the ink outline (5), gloss, a thin gold inner line, in the ring's glow group; a sparkle at its tip twinkles twice on arrival |
| **dusty** (a modifier of complete) | `complete.full` and `fading` | **matte**: no gloss, no sparkles, no shine. The star and the colour stay | no gloss, not in the glow group, no sparkle |

**The level is `whole`**, not `fill`: the share of every spelling on the chart column (weighted 3 basic, 2 Year 1, 1 Year 2; progress-model §2.2) that the child has won, counting a charging gem by its charge. It only ever rises, and it reads at a glance as "about 40 % there" for a mid-Year 1 child (0.42). `fill` ("complete for your stage") is 0.97 for the same child, so it would make every petal look full; it also drops when a new spelling is taught. `fill` is shown as the gold line instead.

**Dust never touches the colour.** The model's `fresh` is not drawn on the petal: its dust shows on the gems (§3.2), and a complete petal goes matte. This keeps MULTI_SOUND's rule that progress never fades on screen (its D8) while still telling a grown-up which sounds want review.

**A complete petal can open again** when a lesson teaches a new spelling of its sound: its level stays (it is `whole`, which counts the new spelling as still to win), the gold line goes, and the new spelling appears in ink with a clear gem (§5.2).

### 3.2 The gem meter

Beside every spelling the child has met, on the chart, the card and the fork panel, a small cut gem (`GEM_D`, 40 × 36) shows how far that spelling>sound pair has come towards mastery (`gemProgress`, §7.2's `gemLook`):

| mark | the model's `stage` | looks like |
|---|---|---|
| **none** | `unseen` | no mark; the spelling in pencil (`#9a8f84`), at the smaller size *F*, whether or not this version of the game can teach it (one pencil keeps the sheet calm; a tap on the card still says `gem_hidden` or `gem_future`) |
| **glass** | `met` | a clear gem (`#f2ede5`), its outline and facets in **pencil** (`#a1968a`, facets at 30 %) |
| **fill** | `practising` | the same pencil gem, filling with the petal's colour from its point up to `parts.energy` (0..1), the charge the game already shows in the dojo ("Your gem filled up") |
| **ready** | `ready` | the gold gem with rays and a halo (`GOLD_GEM`), bigger (max(30, 0.66 *M*)); it hops three times when its half-sheet arrives and on Help, never endlessly |
| **won** | `won` | a jewel in **ink**: the petal's colour (bronze for /or/) with facets and a highlight, under a white frost of 50 % × (1 − `parts.consolidation`), so it clears as the child uses it in more words, on more days, with more answers right |
| **mastered** | `mastered` | the polished jewel, no frost, with a white sparkle on it |
| **dusty** | `fading` (a won gem not used for a while) | grey specks (`#8d8276`) and a grey film (45 %) over the jewel; practice polishes it |

The meter is the same size rule as v1's marks: 0.5 *M* (at least 24) on the chart, 0.52 *M* (at least 40) on the card, 0.1 *M* to the right of the spelling, 14 % below its top. The pencil outline is the calming change: a sheet of 25 gems reads as a few jewels, not 25 dark diamonds.

![The gem meters on the /ae/ card](scroll-design/final/shots/31-card-programme-ae-ea-also-first.jpg)

### 3.3 Spellings that represent more than one sound

Sounds~Write's fourth concept. MULTI_SOUND.md owns the teaching and the game; this is how the World Flower shows it (its §7 contract, with the look chosen here).

- **The sound line** (MULTI_SOUND §7.2). Under a spelling the child has met representing two or more sounds (`multiSoundSpellings(save)`, less < u > as the /w/ of < qu >, and never < x >), a thin line splits into one segment per sound, in those petals' colours, **this petal's sound first**. A segment is **dashed and faint** (two dashes at 55 %) until the child is sure of that sound (Sound Detective's `forkProgress(g).sure`), then **solid**. Until `src/content/forks.ts` exists every segment is faint. Height max(4, 0.085 *M*) on the chart, 7 on the card's chip, 9 under the fork panel's title; 84 % of the spelling's width, at its foot.
- **The fork chip** on the card (§3.6): when the chosen spelling has other sounds the child has met, a white chip holds a small magnifying glass and those sounds' mini petals with their pictures (up to three). A tap opens the fork panel. The first time in a save Sensei says `card_also_first` and the chip bobs three times.
- **The fork panel** (§3.7): the spelling big, with its sound line; its petals side by side, each with the spelling, its gem meter, its picture and an example word; the petals it will represent later as dotted petals with pencil letters; and, for a spelling Sound Detective plays, the **magnifying glass** (the spelling in its lens) that starts a four-word Sound Detective (MULTI_SOUND §7.4). Explanation-only spellings (< th >, < n >, < gh >, < gg >, < ai >) have no glass.
- **On the radial flower** there is nothing at rest (MULTI_SOUND §7.2). Its fork trip (threads between petals) is MULTI_SOUND's.

![The fork panel for < ea >](scroll-design/final/shots/20-fork-programme-ea.jpg)

In today's game a child meets two such spellings: < th > (/th/ /dh/) and < u > (whose /w/ doesn't count), so only < th > shows a line (still [`23-fork-year1-th-explain-only`](scroll-design/final/shots/23-fork-year1-th-explain-only.jpg)). The `programme` child in the mockup (mid-Year 1 by Sounds~Write, EC1–EC13) shows the rest: *ai*, *ea*, *e*, *y*, *ow*, *o*, *oo*, *u*.

### 3.4 The chart

#### 3.4.1 The screen

```
 stage 1280 × 720 (CSS 629 × 354 on the phone; the letterbox beside it is painted the wall colour)
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ [⌂]     ┌──── the sheet: x 172–1108 (936 wide), 4 columns of 234 ────┐           [🔊]      │
│ Home    │   ╭─╮🚂      ╭─╮🌳      ┄┄┄        ╭─╮🥧                     │           Hear it    │
│         │   │ai◆ ▓▓▓   │ee◆ ▓▓▓   ┆  ┆       │ie◇ ▓▓                  │           again      │
│ [✿]     │   │ay◆ ▓▓▓   │ea◆ ▓▓▓   ┆  ┆       │igh◆ (gold, hops)       │   ●                  │
│ World   │   │a-e◈ ▓    ├──────    ┆  ┆       ├──────  (the surface)    │   ▌ page dots:       │
│ Flower  │   │ea◇       │e ◈       ┆  ┆       │i ◇                     │   ●  6 half-sheets   │
│         │   │ei ey eigh│y ◇ …     ┆  ┆       │i-e y …    row 1        │      in 3 pairs      │
│ (wall)  │   ╰╮╯        ╰╮╯        ┄┄┄        ╰╮╯                     │   ●                  │
│         │   (row 2: oa ow …, "book" oo u oul, er ir ur or, a dotted slot)  ●                  │
│         └─────────────────────────────────────────────────────────────┘                (Help)│
└────────────────────────────────────────────────────────────────────────────────────────────┘
  ▓ colour · ◆ won jewel · ◈ gem filling · ◇ clear gem · ┄ a missing petal's dotted slot
```

| thing | stage px | CSS px on the phone | notes |
|---|---|---|---|
| the scroller | the whole stage, 1280 × 720 | 629 × 354 | a swipe from anywhere moves the sheet |
| a page (half a sheet) | 720 tall, a snap point | 354 | 6 pages: sheet 1 top, sheet 1 bottom, sheet 2 top, … |
| the sheet (paper) | x 172–1108, 936 wide; 16 of wall above and below | 460 wide | warm white (`#fffcf5` with a soft light from the top left), radius 18, the laminate's film edge (a 6 px white ring at 60 % and a 1.5 px `rgba(150,132,108,.22)` ring), a soft drop shadow. No pins |
| a row | 334 tall; the top half's rows start at y 40, the bottom half's at y 12 | 164 | |
| a petal's cell (its button) | 234 × 334 | 115 × 164 | the whole cell, picture included, is the tap target |
| a petal | 136 × 296 at x 49, y 30 in its cell | 67 × 146 | the chart's slim teardrop (`dropPath`) |
| the outline | 6 (8 when complete) | 3 | the sound's chart colour (`CHART_PETALS`), including the chart's ink for /or/ |
| the glow behind a petal | the outline blurred, 168 × 328 at (33, 14) | | 14 % of its colour; 26 % once coloured; 50 % complete; gold `#ffc93a` at 100 % when complete |
| the picture | 72 × 72 at (154, −2) in the cell | 35 | on the petal's shoulder; none while missing |
| the star (complete) | 42 at (97, 303) in the cell, plus sparkles 22 at (58, 52) and 16 at (166, 122) | | the sparkles go when matte |
| Home | left 18, top 16, 100 | 49 | NavLayer, unchanged |
| the view toggle | left 18, top 150, 100, pink | 49 | in both views; its icon is the other view (a mini chart / a mini flower). **No progress ring** |
| Hear it again | left 1162, top 16, 100 | 49 | NavLayer `top-right`, unchanged |
| **the page dots** | a 96 × 368 target at (1150, 176) | 47 × 181 | six dots (16) in three pairs, one per half-sheet, at y 20, 48, 140, 168, 260, 288 in the target; the current one is an ink pill 16 × 40, the dots below it move down 24. Tap or drag on them to jump. They replace v1's map of little sheets |
| Help | bottom-right, 124 | 61 | unchanged |

The wall is v1's warm cream (`#f3e6cf`, with a soft light from the top left and a warmer corner at the bottom right); the letterbox is painted the same colour, and an 18–20 px fade shows where the sheet runs off the stage. The sheets are the school's two in their exact 4 × 4 order, then a third in the same style for the 12 sounds the school's sheets leave out, with the grown-ups' key in its empty last row (§3.4.5).

#### 3.4.2 A petal's letters

v1's fit, unchanged except for the marks it makes room for (the mockup's `fit`, `SHEET_FIT`, `CARD_FIT`): one centred column in the chart's order (`CHART_PETALS.spellings`, each once), Andika regular with ligatures off; at most two sizes, *M* for the spellings met and *F* for the rest, *F* between 0.62 and 0.85 of *M* while that fits (never below 22); every line and its mark inside the teardrop at 15 % and 90 % of the line's height with 8 px to spare; the first lines clear of the picture; the column may start up to 24 lower; air between the lines up to 22. Hint words as on the chart (*"book"* over /uu/, *"thin"* and *"this"* over the two *th* petals). What each line reserves beside it:

| line | reserves |
|---|---|
| a met spelling (any gem mark but ready) | gemW + 0.1 *M* (gemW = max(24, 0.5 *M*) on the chart, max(40, 0.52 *M*) on the card) |
| ready | max(30, 0.66 *M*) + 0.03 *M* − 4 |
| pencil, hint | nothing |

Measured (CSS px x-height, the child's own spellings): median 14.2 (after the first lessons), 13.5 (mid-Reception), 11.0 (mid-Year 1), 8.6 (mid-Year 1 by the programme, with many seven-spelling petals); minimum 6.4 on the seven-spelling petals. The card is where the reading happens (§3.6).

#### 3.4.3 Colouring in, and the surface

- **Direction:** from the round top down towards the point. The chart's order is Sounds~Write's (the commonest spelling first, which is also roughly the teaching order), so the colour sits behind the spellings the child has, and the pencil ones below stay on white paper. Colour rising from the point, as in water in a glass, put colour behind the spellings still to find (rejected: stills [`x3`](scroll-design/final/shots/x3-rejected-ink-from-point-programme.jpg), [`x4`](scroll-design/final/shots/x4-rejected-ink-from-point-reception.jpg)).
- **True to area:** the level is the height above which `whole` of the petal's area is coloured (`levelFromTop`, a table over the teardrop's half-widths). The round top holds most of the area: a quarter-full petal is coloured about a third of the way down.
- **The surface never cuts a spelling, and the colour holds what the child has won** (`snapLevel`): a level that falls inside a line of letters moves to one of its edges. A won spelling is coloured in (its bottom edge); a pencil spelling never is (its top edge); any other goes to the nearer edge. Then won spellings straight below the level are taken in, and pencil ones straight above it are left out. The level stays true to area within a line or two. Without this the gold line struck through *dd* on /d/, and *ea* (mastered) sat outside the colour on /ee/.
- **The colour** is a wash of the petal's colour, `--w0` at the top (the lightest wash that keeps ink letters at 5.2 : 1) to `--w1` (40 % lighter) at the surface; ink letters on it get a thin paper halo.

#### 3.4.4 What each child sees

The chart never moves by itself. It opens, before its first paint, on the half-sheet with the thing to do next: a trip's gem; else the first petal (in the chart's order) with a gem ready for its battle; else the petal of the child's newest spelling; else the top of sheet 1.

| child (the model's simulator, `progress.test.ts`) | sounds met | what the first screen shows | stills |
|---|---|---|---|
| **new** (before the first lesson) | 0 | eight faint dotted slots | [`07`](scroll-design/final/shots/07-chart-new.jpg) |
| **first** (after m s a t) | 4 | /s/ as a faint outline with a clear gem; the rest dotted | [`08`](scroll-design/final/shots/08-chart-first.jpg), [`whole-first`](scroll-design/final/shots/whole-first.jpg) |
| **reception** (units 1–7, nine weeks) | 23 | sheet 2 top: /e/ /u/ /o/ /d/ /i/ /n/ /j/ coloured behind their first spelling with gold lines; /v/ filling (*ve* has only two words, so it can't be won) | [`09`](scroll-design/final/shots/09-chart-reception.jpg), [`whole-reception`](scroll-design/final/shots/whole-reception.jpg) |
| **year1** (the Sky Temple: ai ay ee ea) | 30 | /ae/ with *ai ay* coloured and a gold line; /ee/ with *ee ea* coloured | [`10`](scroll-design/final/shots/10-chart-year1.jpg), [`12b`](scroll-design/final/shots/12b-chart-year1-sheet2.jpg), [`14`](scroll-design/final/shots/14-chart-year1-sheet3.jpg), [`whole-year1`](scroll-design/final/shots/whole-year1.jpg) |
| **away** (the same child 30 days later) | 30 | the same colour; dusty gems; /a/ /y/ /ch/ /th/ /dh/ matte | [`13`](scroll-design/final/shots/13-chart-away.jpg) |
| **programme** (mid-Year 1 by Sounds~Write, to EC13: an illustration; the game teaches only to its unit 12) | 36 | every gem stage, sound lines on eight spellings | [`11`](scroll-design/final/shots/11-chart-programme.jpg), [`12`](scroll-design/final/shots/12-chart-programme-sheet2.jpg), [`whole-programme`](scroll-design/final/shots/whole-programme.jpg) |

#### 3.4.5 The grown-ups' key

In sheet 3's empty last row (`div.pc-key`, Baloo 2 600 at 21, a dashed border): "**For grown-ups.** A petal: [dotted] not met yet · [faint] met · [a third coloured] filling · [gold line] all won for now · [full, star] complete. The colour is the whole chart column: every way to spell the sound. **ai** met, ea still to find. A gem: met · filling with practice · ready for its gem battle · won · mastered · dusty. [faint dashes, solid] a spelling that represents more than one sound: faint until the child is sure which, then solid."

### 3.5 The radial World Flower

![The flower, mid-Year 1](scroll-design/final/shots/04-flower-year1.jpg)

Same place, stem, rings, rainbow order and tap-nearest-petal as today (`WorldFlower`, `FLOWER_RINGS`, `RING`, `HEART`). What changes is how each petal is drawn (§3.1) and what grows with progress:

- **Missing petals are not drawn.** A new child sees the golden heart ("0 of 44") and the dotted hints of the sounds hiding in their first land ([`01`](scroll-design/final/shots/01-flower-new.jpg)); after the first lessons, four petals ([`02`](scroll-design/final/shots/02-flower-first.jpg)).
- **The colour grows out from the heart**, true to area (a per-ring level table of `teardrop(w, len)`), in one gradient per petal: `mix(colour, ink, .18)` at the heart, the colour at 55 % of the level, `mix(colour, white, .3)` at the level, then a surface line 2.6 % of the petal long (white at 80 %, or gold when all won for now), then nothing.
- **The heart** counts the petals on the flower (met), "30 of 44". Its 28 stamens light gold in proportion to the flower's `whole`; the warm halo behind the flower grows with it (radius 300 + 170 × `whole`, opacity 0.35 + 0.65 × `whole`).
- **A gem ready for its battle** is a gold gem (30) just past the petal's tip that hops three times on arrival and on Help. It replaces today's endless gold pulse.
- **Complete petals** glow together (one static filter per ring, painted once) and each has a sparkle that twinkles twice on arrival.

### 3.6 The card

![The card for /ee/ with ea chosen](scroll-design/final/shots/15-card-programme-ee-ea.jpg)

A laminated flash card, 980 × 680 at (150, 20), over a scrim (`rgba(43, 29, 20, .38)`) that covers everything but Home and Help; the letterbox dims with it. It grows out of the tapped petal (300 ms) and shrinks back into it.

| part | where (card px) | what |
|---|---|---|
| **the petal up close** | 250 × 560 at (44, 96) | the same petal and the same look (§3.1), outline 8, the column fitted with *BM* 104–48 and *BF* 70–34; the chosen spelling in a pill (`--c` at 16 % over white, a 4 px ring). The whole column is one target: a tap picks the nearest spelling |
| **the picture** | 112 at (226, 18) | on the petal's shoulder |
| **the speaker** | 116 at (370, 30) | "Hear the sound and its words": the pure sound, then the chosen spelling's words, each card lit as it is said. The first time in a save it rings three times while Sensei says `tv_train_hear_again` |
| **the chosen spelling** | a chip at (512, 34), 108 tall, Andika 76, a 5 px ring in the petal's colour, a pointer to the speaker | the spelling, its **big gem meter** (64 × 58), and its sound line (7) |
| **the caption** (for grown-ups) | Baloo 2 700 at 21, `#9a8b7c`, at (516, 150), at most 440 wide | where the gem is: "just met: practice fills the gem", "filling up with practice", "full: ready for its gem battle", "won: use it to make it sparkle", "mastered"; a dusty gem: "won · a little dusty: practise to polish it" |
| **the words** | three cards 176 tall in a 580-wide row at (370, 178) | Sensei's example words for the chosen spelling, then the words the child has found with it, pictures first, up to three, no placeholders. The spelling is in the petal's colour on a wash of it; a tap says the word |
| **the fork chip** | at (370, 420), 150 tall | only for a spelling with other sounds met (§3.3) |
| **the action** | 150 at (788, 470), with a chip naming the spelling above it (centred at x 863, y 424) | exactly one: **the gem guardian** (`mon_gem_guardian`, gold) when the gem is ready: its Gem Trial; else **the dojo gate** (green, the torii): practise it (it fills a gem, and polishes a won or dusty one); **nothing** for a mastered gem that isn't dusty |
| **close ✓** | 92 at (866, 18) | closes; so does a tap on the scrim or the letterbox |

No Sensei face on the card: Help (bottom right) is Sensei. Every target on the card is at least 44 CSS px.

### 3.7 The fork panel

The card's content changes in place (the scrim stays): the speaker at (60, 30) says each met sound and its example word in turn, lifting that petal; the spelling at the top centre (Andika 104 in a white chip with a `#eadfd2` ring, its sound line 9 tall); up to four petals 150 × 300 side by side in a 730-wide row at (36, 166) (173 wide each for four), each with the spelling (64), its gem meter (50), its picture (80) on the shoulder and its example word card (194 × 146) below; later sounds as dotted petals with pencil letters and no card; the magnifying glass (140, gold, the spelling in its lens) at (800, 470). ✓ goes back to the petal card it came from.

---

## 4. Interactions

### 4.1 Moving around

v1's, unchanged: native vertical scrolling of the whole stage with `scroll-snap-type: y mandatory`, each half-sheet `scroll-snap-align: start; scroll-snap-stop: always`, `overscroll-behavior: contain`, `touch-action: pan-y`; one swipe, one half-sheet (the page dots jump); a mouse drag moves the sheet with snap off and glides to the nearest half on release; **nothing moves by itself** (no nudge, no hint hand, no auto-scroll).

### 4.2 Taps

- **The tap guard** (v1): a tap on the sheet counts only if it moved no more than 6 px since the finger went down and no scroll event came in the last 90 ms.
- **A petal on the chart or the flower** (outline, filling or complete): `sfx.petal()`, its sound, and its card grows out of it.
- **A missing petal:** a small shake (0.45 s) on the chart, `sfx.petal()`, and `petal_secret`. On the flower a tap in a gap does the same (the nearest-petal pick includes missing petals).
- **On the card:** a met spelling is selected and Sensei explains it (`introGem` / `sameSound` / `introPetal`, as today), then says its gem's line (§4.4); a tap on the spelling already chosen explains it again (the mockup, which has no composed explanations, plays the sound and the words instead); a ready spelling starts its Gem Trial; a pencil one says `gem_hidden` or `gem_future`. The speaker, the words, the fork chip and the action as §3.6.
- **In the fork panel:** a met petal says its sound; a later one says `gem_hidden`; the magnifying glass starts Sound Detective (§7.6).

### 4.3 Every control, and how a child knows what it does

| control | looks like | does | the first time |
|---|---|---|---|
| Home | the house (gold) | as today (`homeFor`) | — |
| the view toggle | pink; a mini chart on the flower, a mini flower on the chart | swaps the views (`sfx.page()`) | pulses after 6 s on the free flower, as today |
| Hear it again | the speaker (gold), top right | says the view's line again (`flower_tap`) | — |
| Help | Sensei's face with a green ? | the flower: `help_flower_fill`, then (second press) `help_flower`; the chart: `help_flower`, and the ready gems on the half-sheet hop; the card: `wf_help_petal` | — |
| the page dots | a pill and dots | jump to that half-sheet | — |
| a petal | its outline, picture and letters | opens its card | — |
| the card's speaker | the speaker (gold) | the sound, then the chosen spelling's words | rings 3 times; `tv_train_hear_again` |
| a spelling on the card | the letters and their gem | selects and explains; ready: its battle | — |
| **the gem guardian** | the monster the child battles, on gold, the spelling on a chip above | the Gem Trial for that spelling | bobs 3 times while Sensei says `gem_ready` |
| **the dojo gate** | the torii (green), the spelling on a chip above | practise that spelling in the dojo | bobs 3 times while Sensei says `t_practise_invite` (or `gem_dusty`, `gem_won_shine`) |
| **the fork chip** | a magnifying glass and little petals | opens the fork panel | bobs 3 times; `card_also_first` |
| **the magnifying glass** | a gold lens with the spelling in it | Sound Detective with that spelling | `tv_sd_gate_first` (MULTI_SOUND §7.4) |
| close ✓ | a tick (gold) | closes the card | — |

### 4.4 What Sensei says

**Existing lines (recorded):**

| when | line |
|---|---|
| arriving on the free World Flower, and Hear it again | `flower_tap` "Tap a petal to see its gems." |
| Help on the chart (and the second Help on the flower) | `help_flower` "Tap a petal to see its gems. A bouncing gem is ready for a gem battle!" |
| a tap on a missing petal | `petal_secret` "This sound is still a secret. You'll find it on your adventure!" |
| a tap on a petal | its pure sound |
| the card opens, 750 ms later | the explanation as today (`content/teach.ts`: `introPetal`, `introGem`, `sameSound`), then the chosen gem's line: |
| — a gem ready for its battle | `gem_ready` "A gem is glowing! It's ready for a gem battle." |
| — a gem met or charging | `t_practise_invite` "Shall we practise this in the dojo?" |
| the card's speaker, the first time in a save | `tv_train_hear_again` "Tap the speaker, and I'll say it again." |
| a pencil spelling | `gem_hidden` / `gem_future` |
| Help on the card | `wf_help_petal` "Tap a gem to hear how it spells the sound. Tap the gate to practise it in the dojo!" |
| the trips | unchanged: `wf_i3`, `trial_win`, `petal_complete`, `wf_petals_you_know`, `wf_practised` "Look! Your gem filled up with ninja power.", and the rest of v1 §4.4 |

**New lines for F2 to record** (in Sensei's teacher voice, British English; add to `src/content/lines.ts`). Until a clip exists `say` plays nothing and the flow does not wait:

| id | text | when |
|---|---|---|
| `help_flower_fill` | "Every sound you find grows a petal. Win its gems, and the petal fills up with colour!" | Help on the flower (first press) |
| `petal_outline` | "You found a new sound! Win its gems to fill up its petal." | a petal comes back as an outline (§5.1), and opening an outline petal's card |
| `petal_caught_up` | "You've won every gem you can for now. More are waiting on your adventure!" | opening a petal that is all won for now, on a won gem |
| `gem_won_shine` | "You won this gem! Read and spell it in lots of words to make it sparkle." | a won gem, not yet mastered |
| `gem_sparkle` | "This gem sparkles! You really know it." | a mastered gem |
| `gem_dusty` | "This gem is a little dusty. Practise it to make it shine again!" | a dusty gem |
| `card_also_first` | "This spelling is in other petals too. Tap here to see them!" | the fork chip, once per save |

Sensei never says a spelling's name (MULTI_SOUND D2). The fork panel's lines (`tv_sd_can_be`, `tv_sd_as_in_<w>`, `tv_sd_strategy`, `tv_sd_gate_first`, `tv_sd_mark_first`) are MULTI_SOUND §3.6's.

---

## 5. Celebrations and trips

All animate `transform` and `opacity` only (one exception: the flower's colour rise, §5.3), run once, and remove their own elements.

### 5.1 A sound met: its petal comes back as a faint outline

After the new-spellings trip (`GemFound`), for a spelling whose sound was missing:

| t (ms) | on the chart ([`35`](scroll-design/final/shots/35-unlock-chart-first-s-mid.jpg), [`36`](scroll-design/final/shots/36-unlock-chart-first-s-after.jpg)) | on the flower ([`37`](scroll-design/final/shots/37-unlock-flower-first-s-mid.jpg)) |
|---|---|---|
| 0 | the dotted slot | the gap |
| 500 | the dots fade (500 ms) | the petal grows out of the heart as a faint outline: scale 0.08 → 1 from its point, 1.1 s, springy; `sfx` chime |
| 700 | the outline draws in (opacity 0 → 50 %, scale 0.94 → 1, 700 ms); `sfx.petal()` | |
| 1100 | the picture sticks on (scale 0.2 → 1.18 → 1, a small turn, 700 ms) | |
| 1700 + 90 per line | the spellings write themselves in (opacity, 8 px rise, 400 ms); `sfx` chime at 1800 | |
| 2400 | Sensei: `petal_outline` | Sensei: `petal_outline` |
| 2600 | any first colour and the glow fade in (900 ms) | |

The chart's version plays on `PetalChart` (`reveal`, §7.5); the flower's is `WorldFlower`'s `grow` prop, which B3 plays in `GemFound` (§5.6).

### 5.2 A new spelling of a sound already met

Only its line changes: the spelling pops from pencil to ink (0.6 → 1.25 → 1) with its clear gem, and a small burst; the gold line (if any) goes, the level stays. Sensei's lines are the trip's own.

### 5.3 Back from practice

The practised trip (`PractisedTrip`, unchanged beats) plays on the chart at the gem's half-sheet: the gem meter fills from `from` to its new energy (`--e`, a 1.4 s transition) while Sensei says `wf_practised`; then the petal's colour grows from the level before to the level now (1.6 s, `cubic-bezier(.25,.9,.3,1)`: [`25`](scroll-design/final/shots/25-rise-programme-oe-mid.jpg), [`26`](scroll-design/final/shots/26-rise-programme-oe-after.jpg)). The level before is `petalProgress` on the save with that gem's energy set back to `from`. If the gem is now full, its meter becomes the gold gem (with its hops) and the card opens with `gem_ready`, as today. A dusty gem loses its dust as it fills.

### 5.4 A gem won

`GemVictory` is unchanged up to its end. Then:
- **The petal is now `complete.game`** (today's `petalComplete`): it flies home onto the flower, as today (`petal-home`, `landing`, `bloom`). Where it lands its colour grows from the level before to the level now (on the flower: one petal's gradient stop offsets, animated for 1.6 s with rAF, the exception above), and the surface turns gold, or, if the whole column is now won, the petal turns complete: gloss, star, the ring's glow and one twinkle.
- **Otherwise the gem lands on the chart** (v1 §5.1's timings: the jewel appears at (640, 380) at 700 ms, arcs to its slot and lands at 2000 ms with two rings, sparks, `sfx.great()` and `sfx.sparkle()`); the gold gem becomes the jewel; then the colour grows from the level before (the save without this gem) to the level now (1.6 s, from 2200 ms), turning the surface gold if the petal is now all won for now; `endTrip()` at 3900 ms.

### 5.5 A trip's focus

`?gem=` / `focusGem()`: the chart opens on the gem's half-sheet and a gold ring round the spelling pulses three times, then stays (v1 §5.4).

### 5.6 A request for B3: `src/scenes/Intros.tsx`

`WorldFlower` keeps its `light` prop, so Intros keeps working unchanged. To match v2:
1. **Pass `look` instead of `light`** everywhere it draws the flower (`FlowerIntro`, `GemFound`, `WorldVisit`): `look={(p) => looks.get(p)!}` with `looks = petalLooks(flowerOverview(save))` (§7.2), memoised on the save. `FlowerIntro`'s lost flower keeps `misty`.
2. **`GemFound`, a new sound:** when a trip's spelling brings a missing petal back, show the flower with `grow={p}` (§5.1's flower column), then Sensei's existing lines for the spelling, then `petal_outline`. A spelling of a sound already met: as today.
3. **`WorldVisit`:** the petals "hiding in this land" are the flower's `soon` petals (the dotted hints); keep the `hint` shimmer for its step.
4. **The flights home** that end on the flower (`FlowerIntro`'s /a/ petal, and any `landing`): the landing petal is drawn with its v2 look; nothing else changes.
5. `petalLight` stays exported (Stickers and BigPetal use it); `BigPetal` is unchanged.

---

## 6. Performance

**Budgets** (the acceptance numbers, §8.2):
- **DOM:** the chart view ≤ 600 nodes with a card open (frame included); the flower view ≤ 700 with a card open. Per petal on the chart: 1 node missing, 6 + its lines met. Per petal on the flower: at most 8 SVG nodes, plus one gradient (at most 7 stops).
- **At rest, at CPU ×4:** main thread ≤ 2 %, 0 compositor frames per second, 0 running animations 4 s after arrival (the ready hops and twinkles are finite).
- **Swiping, at CPU ×4:** frame p95 ≤ 20 ms (≥ 50 fps), no long tasks, main thread ≤ 20 % per gesture.
- **Opening a card:** no task over 120 ms. **Building the progress:** `flowerOverview` + 44 `petalProgress` once per save change (memoised), under 10 ms unthrottled.
- Compositor-only animations, all finite; no SMIL; no SVG per chart petal (the outline, dots, fill and glow are CSS masks of one teardrop data URI); `content-visibility: auto` on each half-sheet. The one exception is §5.4's flower rise (one petal, 1.6 s, during a trip).

**Measured on the mockup** (`playtest/runs/flower-v2/mockup/cost.ts`, v1's probe pointed at v2, and `domcount.ts`; Playwright Chromium, 844×390, DPR 3, touch, CPU ×4, GPU raster):

| | first | reception | year1 | programme |
|---|---|---|---|---|
| DOM: chart view (+ frame 22) | 187 | 355 | 419 | 484 |
| DOM: flower view (+ frame 22) | 222 | 422 | 483 | 544 |
| DOM added by the card / the fork panel | | | 49 / 32 | 61 / 52 |
| build, unthrottled (both views) | 8 ms | 26 ms | 22 ms | 28 ms |
| main thread at rest, compositor frames | 0 %, 0 | 0 %, 0 | 0 %, 0 | 0 %, 0 |
| main thread per swipe | 7.6–9.3 % | 8.0–10.8 % | 9.6–12.2 % | 11.0–14.8 % |
| frames while swiping: p95 / max | 16.8 / 16.8 ms | 16.8 / 16.8 | 16.8 / 16.8 | 16.8 / 16.8 |
| long tasks while swiping | 0 | 0 | 0 | 0 |
| opening a card | no long task | no long task | one 54 ms task (the card's fit) | no long task |

A new child's views are 152 (chart) and 190 (flower). As in v1, one long queued flick in five turned two half-sheets (Chromium's late fling with CDP touch). Not profiled: Safari on an iPhone (§9).

---

## 7. Implementation spec

The mockup is the reference for every number: `docs/scroll-design/final/index.html` (its `coloursOf`, `dropPath`, `tabled`, `levelTableTop`, `lineBoxes`, `snapLevel`, `fit`, `layoutVars`, `stripeOf`, `renderPetal`, `flowerSVG`, `keyHTML`, `openCard`, `paintSel`, `openMulti`, the SVG marks and the CSS). **Port it; don't re-derive it.** Its data comes from `progress.ts` exactly as the game's will.

### 7.1 Files

| file | change | lane |
|---|---|---|
| `src/ui/petalLook.ts` (new) | the one mapping from `progress.ts` to what is drawn (§7.2) | B2 |
| `src/ui/petalLook.test.ts` (new) | §8.3 | B2 |
| `src/ui/chartPetal.ts` (new) | the chart's pure helpers: geometry, masks, marks, lines, fit, levels, the snap, the landing half (§7.3) | B2 |
| `src/ui/chartPetal.test.ts` (new) | §8.3 | B2 |
| `src/scenes/Tree.tsx` | `WorldFlower` (§7.4); `PetalChart`, `ChartPetal`, `PageDots`, `ChartKey` replace `PetalScroll` (§7.5); `PetalDetail` restyled and `ForkPanel` (§7.6); the scene (§7.7) | B2 |
| `src/styles/tree-chart.css` (new, imported by Tree.tsx) | every class in §7.8 | B2 |
| `src/styles/tree-visit.css`, `tree-teach.css` | delete the scroll's and the old card's rules (§7.9) | B2 |
| `src/scenes/Intros.tsx` | §5.6 | B3 |
| `src/content/lines.ts` + recordings | §4.4's new lines | F2 |
| `src/content/progress.ts`, `engine/gems.ts`, `engine/store.ts`, `content/flower.ts`, `ui/petal.ts`, `ui/SoundBadge.tsx` | unchanged (read only) | |

### 7.2 `src/ui/petalLook.ts`

```ts
import type { PetalSummary, GemProgress, MultiSound } from "../content/progress";
import type { PhonemeId } from "../content/phonics";

export type LookStage = "missing" | "outline" | "filling" | "complete";
export interface PetalLook {
  p: PhonemeId;
  stage: LookStage;   // missing: state "missing" · complete: complete.full · outline: whole ≤ 0.004 · else filling
  level: number;      // 0..1 of the petal's area to colour: whole (1 when complete, 0 when missing or outline)
  caught: boolean;    // all won for now: state "complete" && !complete.full → the gold surface line
  matte: boolean;     // complete && fading → no gloss, sparkles or shine (the star stays)
  soon: boolean;      // missing && soon → the flower's dotted hint
  ready: boolean;     // ready > 0 → the hopping gold gem (flower), the gold gem on its line (chart)
}
export function petalLook(s: PetalSummary): PetalLook;
export function petalLooks(o: FlowerOverview): Map<PhonemeId, PetalLook>;
/** Legacy callers of WorldFlower's `light` (Intros until B3 moves): 0 missing (soon if in `hint`) · 0.06 outline ·
 *  0.15..0.9 filling at level (light − 0.15) / 0.75 · 1 complete. */
export function lookFromLight(p: PhonemeId, light: number, soon?: boolean): PetalLook;

export type GemMark = "none" | "glass" | "fill" | "ready" | "won" | "mastered";
export interface GemLook {
  key: string; g: string;
  mark: GemMark;      // unseen none · met glass · practising fill · ready ready · won won · mastered mastered
  e: number;          // 0..1: parts.energy (1 once ready or won)
  polish: number;     // 0..1: parts.consolidation when won, 1 when mastered (the frost is .5 × (1 − polish))
  dusty: boolean;     // fading
  pencil: boolean;    // mark === "none": the letters in pencil at size F
}
export function gemLook(g: GemProgress): GemLook;

export interface SoundLine { g: string; segments: { p: PhonemeId; colour: string; sure: boolean }[] }
/** The sound line under spelling g in petal `here` (MULTI_SOUND §7.2): the sounds of `multi` (multiSoundSpellings at the
 *  child's stage) for g, less u>w, never x; null under two. `here` first, then teaching order; colour = flowerColour of
 *  the chart colour; sure from Sound Detective (forks.ts forkProgress(g).sure) when it exists, else false. */
export function soundLineOf(g: string, here: PhonemeId, multi: MultiSound[], sure?: (g: string, p: PhonemeId) => boolean): SoundLine | null;
```

### 7.3 `src/ui/chartPetal.ts`

v1's module (v1 §7.2), with the v2 additions marked ★:

```ts
export const CHART = {
  page: 720, row: 334, col: 234, sheetX: 172, sheetW: 936, padTop: [40, 12],
  petal: { x: 49, y: 30, w: 136, h: 296, stroke: 6, strokeDone: 8 }, pic: { x: 154, y: -2, size: 72 },
  big: { w: 250, h: 560, stroke: 8, strokeDone: 11 },
  star: { x: 97, y: 303, size: 42 }, glow: { x: 33, y: 14, w: 168, h: 328 },
  dots: { x: 1150, y: 176, w: 96, h: 368, at: [0, 28, 120, 148, 240, 268] },        // ★ the page dots
} as const;
export interface Drop { d: string; half(y: number): number; t: Float32Array; H: number }
export function chartDrop(w: number, h: number, sw: number): Drop;           // the mockup's dropPath + tabled
export function levelFromTop(drop: Drop): (area: number) => number;           // ★ levelTableTop: 0..1 from the top
export function chartMasks(): Record<"--m-fill" | "--m-line" | "--m-line-b" | "--m-dots" | "--m-glow" | "--m-bigline" | "--m-bigline-b" | "--m-bigfill" | "--m-gem", string>;
export const GEM_D = "M10 2h20l8 10-18 22L2 12z";
export const GEM_LINE: string;      // ★ url(): the pencil outline and facets of a gem still to win
export const GEM_WON: string;       // url(): the ink outline, facets and highlight of a won jewel
export const GEM_MASTERED: string;  // url(): the same with the white sparkle
export const GEM_DUST: string;      // ★ url(): the grey specks
export const GOLD_GEM: string; export const STAR: string; export const SPARKLE: string;
export interface ChartColours { c: string; cj: string; ink: string; ghost: string; deep: string; w0: string; w1: string; surf: string; lite: string; jdeep: string; wash: string }
export function chartColours(chartColour: string): ChartColours;              // the mockup's coloursOf (§7.8's variables)
export const HINT: Partial<Record<PhonemeId, [string, string, string]>>;     // uu b|oo|k, th |th|in, dh |th|is
export interface Line { g: string; key?: string; look?: GemLook; hint?: boolean; line?: SoundLine | null }
export function linesOf(pt: PetalProgress, multi: MultiSound[]): Line[];     // hint first, then each spelling once
export interface FitOpts { top: number; bottom: number; pad: number; M0: number; Mmin: number; F0: number; Fmin: number;
  rLo: number; rHi: number; gapMax: number; picY?: number; picHalf?: number; card?: boolean }
export const SHEET_FIT: FitOpts;   // { top 16, bottom 266, pad 8, M0 58, Mmin 26, F0 46, Fmin 22, rLo .62, rHi .85, picY 34, picHalf 72, gapMax 22 }
export const CARD_FIT: FitOpts;    // { top 44, bottom 476, pad 12, M0 104, Mmin 48, F0 70, Fmin 34, rLo .6, rHi .8, gapMax 18, card true }
export function fitColumn(lines: Line[], drop: Drop, o: FitOpts, measure: (text: string, px: number) => number):
  { M: number; F: number; gap: number; top: number };                       // marks per §3.4.2; memoise per petal + looks
export function lineBoxes(lines: Line[], fit: { M: number; F: number; gap: number; top: number }, card?: boolean): [number, number][]; // ★
export function snapLevel(level: number, boxes: [number, number][], H: number, lines: Line[]): number;                             // ★ §3.4.3
export function soundLineImage(s: SoundLine): string;                        // ★ url(): the segments (the mockup's stripeOf)
export function landingHalf(ctx: { focus?: string | null; landing?: string | null; reveal?: string[];
  ready: (p: PhonemeId) => boolean; newest?: PhonemeId | null }): number;     // §3.4.4's order; 0–5
export const halfOf: (p: PhonemeId) => number;                                // (page − 1) × 2 + (index ≥ 8 ? 1 : 0)
```

Wait for `document.fonts.load("400 50px Andika")` before the first fit, as v1. The fit is pure: memoise it per petal and its lines' looks (the card's took 54 ms uncached for a Year 1 petal).

### 7.4 `WorldFlower` (Tree.tsx)

Same export, same props, plus:

```ts
look?: (p: PhonemeId) => PetalLook;   // v2. When absent: lookFromLight(p, light(p), hint?.has(p))
grow?: PhonemeId | null;              // §5.1: this petal grows out of the heart (class wf-grow on its inner <g>)
rise?: { p: PhonemeId; from: number } | null;  // §5.4: animate this petal's level from `from` to its look's level
```

- **Each petal** is `<g transform="rotate(a) translate(0 −(r0 + len/2))" data-p><g class="pg">…</g></g>` (the inner group takes `wf-grow`), drawn per its look (§3.1, §3.5): *missing*: one invisible hit path (`fill: transparent; pointer-events: all`), or for `soon` the dotted hint (`fill #fffaf0` at 16 %, `stroke #fffaf0` at 90 %, width 5, `stroke-dasharray 0.1 13`, round caps); *outline / filling / complete*: the base path (`mix(colour, #fffaf0, .86)` at 42 % / 60 % / 100 %), the colour path (`url(#uid-f-p)`, when level > 0), the gloss ellipse (complete, not matte), the outline path (outline: colour, 4, 60 %; filling: `mix(colour, ink, .25)`, 4.5; complete: ink, 5), the gold inner line (complete: `#ffd24a`, 3, at scale 0.9), and the picture (`petalImg`, 0.56 w, upright; 80 % when outline).
- **The level** comes from a per-ring table of the teardrop's area from the point (the mockup's `rasterLevel`, computed once at module load for the two rings). The gradient per petal: `x1=0 y1=1 x2=0 y2=0`, stops at 0 (`mix(col, ink, .18)`), 0.55 L (col), L (`mix(col, white, .3)`), then L − 0.026 and L (the surface: white at 80 %, or `#ffc53d` when `caught`), then L (transparent).
- **Order:** as today (outer ring first; missing, then the rest, then the complete, not matte ones in the ring's `-lit` glow group; the heart; a blooming petal last).
- **The heart:** its 28 stamens, the first round(28 × W) lit `#ffd35a`, the rest `#d9ccb4` (W = the mean level over the 44 petals = `overview.whole`); the heart's gradient and the stem's filter use `glow = 0.25 + 0.75 × W` (today they use the share of petals home); `count` is `[petals not missing, 44]` in Tree.
- **The HTML fx layer** above the SVG: a `SPARKLE` (22; 28 on the outer ring) at each complete, not matte petal's tip, twinkling twice on arrival (`--d` staggered 0.13 s); a `GOLD_GEM` (30) at each ready petal's tip hopping three times on arrival and on Help (the flower's `arrive-fx` class restarted). **Delete** the endless `wf-pulse ready` layer. Keep the `hint` pulse (WorldVisit uses it) and `landing`, `bloom`, `flash`, `misty`, `pics`, `stem`, `onPetal` (the nearest-petal pick includes missing petals, which say `petal_secret` in Tree's `openPetal`).
- **The rays and glow layers** grow with W instead of the share of petals home.

### 7.5 `PetalChart` (replaces `PetalScroll`), `ChartPetal`, `PageDots`, `ChartKey`

```tsx
function PetalChart(props: {
  save: Save; progress: Map<PhonemeId, PetalProgress>; multi: MultiSound[];
  onOpen: (pt: Petal, from: HTMLElement) => void;
  focus?: string | null;                  // a trip's gem: land there, ring it (§5.5)
  energyShow?: Record<string, number>;    // the practised beat: the gem meter's `from` (§5.3)
  reveal?: string[];                      // spellings just met: unlock (a new sound) or ink in (§5.1, §5.2)
  landing?: string | null;                // a gem just won: land it, then grow the colour (§5.4), then onLanded()
  riseFrom?: Record<string, number>;      // petal → the level before (practice or a gem won)
  onLanded?: () => void;
}): JSX.Element
```

- **DOM:** v1's (`div.pc-view` → `div.scrollable.petal-scroll.pc-scroller` → `div.pc-board` → three `section.pc-sheet[data-sheet]` → two `div.pc-half[data-half]` (`.lo`) → `ChartPetal`s; `ChartKey` after sheet 3's last petal), `i.pc-edge.t`, `i.pc-edge.b`, and `PageDots`. Keep both old class names on the scroller: scripts use them.
- **Masks and marks:** set `chartMasks()`, `--gold-gem`, `--star`, `--sparkle`, `--gem-line`, `--gem-won`, `--gem-mastered`, `--dust` once as custom properties on `.pc-view`.
- **Landing on arrival** (before the first paint), **the half-sheet on screen** (one IntersectionObserver, threshold 0.6, direct class changes, `sfx.page()` when the child turned the page), **the tap guard**, **mouse drag**, **Help** re-arming `.arrive` on the current half: all as v1 §7.3.
- **A petal:** met: `sfx.petal(); say({ sound: p }); onOpen(pt, el)`. Missing: restart `.shake`, `sfx.petal()`, `say({ line: "petal_secret" })`.
- **The reveal** (`reveal`, in chart order, 400 ms apart): a spelling whose petal has no met spelling outside the trip's (its sound is new with this trip) gets `.unlock` for 3.5 s with a temporary `i.pc-dots-tmp` (§5.1); otherwise its line gets `.inked` (§5.2).
- **The practised beat:** the line in `energyShow` renders its gem with `--e` = the shown value, then the real one next frame (the CSS transition fills it); when the transition ends, the petal in `riseFrom` gets `.rising` and its `--lv` goes from the snapped level before to the snapped level now.
- **The landing:** v1 §7.3's flyer (`div.pc-flyer` with the jewel), then the line swaps `.pending` → `.landed`, `fx.ring` ×2 and `fx.burst`, `sfx.great()`, `sfx.sparkle()`, then the rise (as above) from 2200 ms, and `onLanded()` at 3900 ms.

```tsx
const ChartPetal = memo(function ChartPetal({ p, sig, pr, look, lines, focus, reveal }: {
  p: PhonemeId; sig: string;              // look + each line's look and sound line + focus + reveal: the memo key
  pr: PetalProgress; look: PetalLook; lines: Line[]; focus?: string | null; reveal?: "unlock" | "ink" | null;
}) { … }, (a, b) => a.sig === b.sig);
```

- **The element:** `div.pc-petal[role=button][tabIndex=0][aria-label="petal <p>"][data-p][data-stage=<look.stage>]`, plus `.mys` (missing), `.outl` (outline), `.done` (complete), `.full` (complete), `.caught`, `.inked` (filling or complete), `.matte`, `.shake`, `.unlock`. Its style sets the colour variables (§7.8), `--M`, `--F`, `--gap`, `--top`, `--gw`, `--rw`, `--msh`, and `--lv` = `snapLevel(levelFromTop(drop)(look.level), lineBoxes(…), 296, lines)` (1 when complete).
- **Missing:** the cell alone (its `::after` is the dotted mask in `--ghost`). **Met:** `i.pc-gl` (the glow), `i.pc-fl > i` (the colour; plus `b` for the shine when complete and not matte), `img.pc-pic` (`src={petalImg(p)}`, `alt=""`, `decoding="async"`, `draggable={false}`), `span.pc-col` of `span.pc-ln`: `.m` + `.n|.c|.r|.w` (+ `.mx`, `.dust`) for a met spelling with `style="--e; --pol; --ms"` and `data-gem-chip={key}`, `.f` (pencil), `.hint`; `.ms` on a line with a sound line; `.focus` on the trip's gem.
- **Nodes:** 1 per missing petal; 6 + lines per met petal.
- **`PageDots`:** `div.pc-dots[aria-label="Chart pages"]`, six `i` (`.on` for the current), one target; `pointerdown` (captured) jumps to the nearest dot's half (`scrollTo({ top: half × 720, behavior: "smooth" })`), `pointermove` while captured scrubs. It replaces v1's `ChartMap`.
- **`ChartKey`:** §3.4.5, with small inline SVGs of each state (the mockup's `keyHTML`). It replaces `GemKey`.

### 7.6 `PetalDetail` (same export, same props) and `ForkPanel`

**`PetalDetail`** keeps its props (`pt`, `gem`, `onClose`, `onTrial`, `onPractice`, `quiet`, `invite`, `lead`), its nav (`useNav({ modal: true, … })`), `useHelp("wf_help_petal")`, `practiceGemFor`, the invite and lead logic and the explanation (`introGem` / `sameSound` / `introPetal`, as a `useExplain` hook like v1 §7.5), and adds optional `progress?: PetalProgress`, `multi?: MultiSound[]`, `from?: HTMLElement` (for the grow-out) and `onDetective?` props (computed from the save when absent; only Tree renders it). Markup:

```tsx
<div data-modal className="pd-backdrop" {...tapProps(onClose)}>
  <div className="pd-card" style={{ …colours, …fitVars, "--lv": snapped, transformOrigin }} onPointerDown={stop}>
    <div className={`pd-big ${stageClasses}`} data-petal={pt.p} role="button" aria-label="the spellings" onPointerDown={pickNearestLine}>
      {look.stage !== "outline" && <i className="pd-fl"><i />{look.stage === "complete" && !look.matte && <b />}</i>}
      <div className="pd-big-line" />
      <div className="pd-col">{lines: <span className="pd-ln m n|c|r|w [mx] [dust] [ms] | f | hint  [sel]" data-key data-st data-gem-chip
                                       aria-label={`gem ${g} ${st}`} style={{ "--e", "--pol", "--ms" }}>{g}</span>}</div>
    </div>
    <img className="pd-pic" src={petalImg(pt.p)} alt="" />
    <button className="btn-round pd-spk" aria-label="Hear the sound and its words" …><Icon.speaker /></button>
    <div className="pd-chosen">{g}<i className={`pd-gm ${mark}`} style={{ "--e", "--pol" }} />{line && <i className="pd-ms" />}</div>
    <div className="pd-cap">{caption}</div>
    <ExampleWords show={shelf} colour={colour} className="pd-shelf" />      {/* Sensei's words first, then the found ones; 3 */}
    {forkOthers.length > 0 && <button className="pd-also" aria-label={`${g}: its other sounds`} onClick={openFork}><LensIcon />{mini petals}</button>}
    {ready ? <RoundButton label={`Gem battle ${g}`} className="pd-act battle" …><img src={img("mon_gem_guardian")} alt="" /></RoundButton>
      : showGate && <RoundButton label="Practise in the dojo" className="go pd-act" …><GateIcon /></RoundButton>}
    {(ready || showGate) && <span className="pd-act-chip">{g}</span>}
    <div className="pd-close"><RoundButton sm label="close" onClick={onClose}><Icon.check /></RoundButton></div>
  </div>
</div>
```

- **The chosen spelling** starts as today's `gem` or `lead`; else a ready gem; else the least-charged met gem not won; else a dusty one; else the first met.
- **`showGate`** = the gem is met and not (mastered and not dusty), and `practiceGemFor` offers it (`canPractise`). The gate practises the chosen spelling: `onPractice(key)`.
- **What Sensei says** on opening (750 ms): the explanation, then §4.4's gem line (`gem_ready`, `t_practise_invite`, `gem_won_shine`, `petal_caught_up` when the petal is all won for now and the gem is won, `gem_sparkle`, `gem_dusty`; `petal_outline` for an outline petal). The action bobs (`.pulse`, 3 × 0.8 s) while she says it. Once per save (`heardBefore` / `heard` from `scenes/narrate.tsx`, keys `wf:card-speaker` and `wf:fork-chip`): `tv_train_hear_again` with the speaker's ring first, and `card_also_first` with the chip's bob last.
- **Opening, closing, the letterbox, `pickNearestLine`:** v1 §7.5.
- **Deleted from the card:** `SoundBadge`, the Sensei face (`explain-btn`), `MetWords`' speaker row, v1's ▶.

**`ForkPanel`** (in Tree.tsx; opened by the fork chip, it replaces the card's content, same scrim, same close):

```tsx
function ForkPanel({ g, from, save, progress, multi, onBack, onDetective }: {
  g: string; from: PhonemeId; save: Save; progress: Map<PhonemeId, PetalProgress>; multi: MultiSound[];
  onBack: () => void;                              // ✓: back to the petal card it came from
  onDetective?: (g: string) => void;               // MULTI_SOUND §8: makeDetective(g, { n: 4 }) via App; absent → no glass
}): JSX.Element
```

- The sounds: `soundsOfSpelling(g)` less `together` and u>w; met first (in teaching order), then later ones; at most four.
- The magnifying glass shows when `onDetective` is passed, the spelling is not explanation-only (MULTI_SOUND §7.4: < th >, < n >, < gh >, < gg >, < ai >) and, once `forks.ts` exists, `playableForks(save)` includes g. Until App passes `onDetective` (Sound Detective's lane), the panel explains only.
- The speaker: for each met sound in turn, `say([{ sound: p }, { word: example }])` with that petal lifted (`.on`: translateY(−8) scale(1.04)) and its word card lit; MULTI_SOUND's `tv_sd_can_be` / `tv_sd_as_in_<w>` lines replace this once recorded.

### 7.7 The `Tree` scene

- **The progress, once per save:** `const overview = useMemo(() => flowerOverview(save), [save])`, `const progress = useMemo(() => new Map(PETALS.map((pt) => [pt.p, petalProgress(save, pt.p)])), [save])`, `const looks = useMemo(() => petalLooks(overview), [overview])`, `const multi = useMemo(() => multiSoundSpellings(save), [save])`.
- **View 0:** `<WorldFlower look={(p) => looks.get(p)!} ready={readyPetals} bloom={bloomed} count={[metCount, PETALS.length]} onPetal={openPetal} … />` with `metCount` = petals not missing.
- **View 1:** `<PetalChart … />`, and the scene gets `.tree-chart` (the wall; no `bg-img`, no `.vignette`); a `useEffect` toggles `vp-chart` on `.viewport` while `view === 1`.
- **The toggle** at left 18, top 150 in both views; no progress ring.
- **`openPetal`** for the chart passes the tapped element for the grow-out. A missing petal on the flower: `sfx.petal(); say({ line: "petal_secret" })`, no card.
- **The trips:** the practised trip sets `energyShow` and `riseFrom` (the level before: `petalProgress({ ...save, energy: { ...save.energy, [gem]: from } }, p).whole`); the victory's end: `if (home) { setView(0); /* flight home, bloom and rise as today + §5.4 */ endTrip(); } else { setView(1); setLanding(gem); setRiseFrom({ [p]: before }); }` with `before = petalProgress({ ...save, gems: save.gems.filter((k) => k !== gem) }, p).whole`, and `onLanded={endTrip}`.
- **`window.__snState`:** unchanged fields, plus `half` (0–5 on the chart), `landing` (true while a gem lands) and `fork` (the spelling whose fork panel is open, else null).

### 7.8 CSS classes (`src/styles/tree-chart.css`)

Port them from the mockup's `<style>`, renaming (mockup → game):

| mockup | game | what |
|---|---|---|
| `.viewport` wall, `.card-open .viewport` | `.viewport.vp-chart { background: #f3e6cf }`, `.viewport.vp-dim { background: #a8998a }` | the letterbox |
| `.v-chart` | `.tree-chart` | the wall's light |
| `.scroller`, `.board`, `.edge.t/.b` | `.pc-scroller`, `.pc-board`, `.pc-edge` | v1's |
| `.sheet`, `::before` | `.pc-sheet` | the paper and the film edge (no pins) |
| `.half`, `.half.lo` | `.pc-half`, `.pc-half.lo` | the 4 × 2 grid, the snap point, `content-visibility: auto` |
| `.petal`, `::after`, `.mys::after`, `.outl::after`, `.done::after`, `.done::before`, `.matte` | `.pc-petal` … | the cell, the outline mask (50 % when outline), the dotted slot, the star and sparkles, matte |
| `.gl`, `.inked .gl`, `.done .gl`, `.full .gl` | `.pc-gl` | the glow: 14 / 26 / 50 %, gold when complete |
| `.fl`, `.fl > i`, `.fl > i::after`, `.caught …`, `.fl::after`, `.fl b`, `.fl.rising > i` | `.pc-fl` … | the colour from the top (`transform: translateY(calc((var(--lv) − 1) × 100%))`), the surface, the gold surface, the gloss, the shine, the 1.6 s rise |
| `.pic`, `.col` | `.pc-pic`, `.pc-col` | |
| `.ln`, `.m`, `.f`, `.hint`, `.inked .ln` | `.pc-ln` … | letters: ink `#2b1d14` (*M*), pencil `#9a8f84` (*F*); a paper halo on colour |
| `.ln.m::after`, `.w`, `.w.mx`, `.dust`, `.r` | `.pc-ln.m::after` … | the gem meter (§3.2): `background: var(--gem-line), linear-gradient(to top, var(--cj) calc(var(--e) × 100%), #f2ede5 0)` masked by `--m-gem`; won and mastered and dusty layers; ready = `--gold-gem` |
| `.ln.ms` | `.pc-ln.ms` | the sound line: `background: var(--ms) 50% 100% / 84% var(--msh) no-repeat` |
| `.half.arrive .ln.r::after` + `hop` | `.pc-half.arrive .pc-ln.r::after` | three hops |
| `.half.arrive .petal.done .fl b` + `shine`, `.petal.done::before` + `glint` | the same under `.pc-half.arrive` | once per arrival |
| `.shake`, `.unlock`, `.dots`, `drawin`, `stick`, `writein`, `fadein`, `fadeout` | `.pc-petal.shake`, `.pc-petal.unlock`, `.pc-dots-tmp` … | §5.1 |
| (v1) `.pending`, `.landed`, `.flyer`, `.inked` pop, `.focus::before` | the same, `pc-` prefixed | §5.2, §5.4, §5.5 |
| `.pages`, `.pages i`, `.on` | `.pc-dots`, `.pc-dots i`, `.on` | the page dots |
| `.key`, `.kp`, `.kg`, `.ks` | `.pc-key` … | the grown-ups' key |
| `.scrim`, `.card`, `.big`, `.big .bl`, `.big-col`, `.big .ln`, `.sel`, `.pic-big`, `.spk`, `.spk.hint::before`, `.chosen`, `.chosen .gm`, `.chosen .ms`, `.cap`, `.shelf`, `.wc`, `.wc.spot`, `.also`, `.also .mini`, `.also.pulse`, `.act`, `.act.battle`, `.act.pulse`, `.act-chip`, `.close` | `.pd-backdrop`, `.pd-card`, `.pd-big`, `.pd-big-line`, `.pd-col`, `.pd-ln`, `.sel`, `.pd-pic`, `.pd-spk`, `.pd-spk.hint`, `.pd-chosen`, `.pd-gm`, `.pd-ms`, `.pd-cap`, `.pd-shelf .ex-word`, `.spot`, `.pd-also`, `.pd-mini`, `.pd-also.pulse`, `.pd-act`, `.pd-act.battle`, `.pd-act.pulse`, `.pd-act-chip`, `.pd-close` | the card (§3.6) |
| `.ms-card …`, `.ms-title`, `.ms-title .ms`, `.ms-row`, `.sense`, `.sense .sp`, `.sense.on .sp`, `.lensgate`, `.lensgate .lg` | `.fk-card`, `.fk-title`, `.fk-ms`, `.fk-row`, `.fk-sense`, `.fk-petal`, `.fk-sense.on`, `.fk-lens`, `.fk-lens-g` | the fork panel (§3.7) |
| `.wf-grow` + `wfgrow` | the same, in tree-chart.css | the flower's §5.1 |
| `prefers-reduced-motion` block | the same | no hop, shake, shine, unlock, grow, pulse |
| (new) | `.tree-base[inert] :is(.pc-half.arrive .pc-ln.r)::after { animation: none }` | nothing hops under a trip |
| (new) | `@property --e { syntax: "<number>"; inherits: true; initial-value: 0 }` and `.pc-ln.m.filling { transition: --e 1.4s }` | the practised beat's gem filling (§5.3); one element, during the trip only |

The colour variables per petal (`chartColours`): `--c` the chart colour; `--cj` the jewel and ink colour (bronze `#7a4a24` for /or/'s ink petal); `--ink-c` the colour darkened to 4.5 : 1 on paper; `--ghost` `mix(c, paper, .7)`; `--c-deep` `mix(c, ink, .12)`; `--w0` `mix(cj, paper, max(.12, t))` where t is the lightest wash that keeps ink at 5.2 : 1; `--w1` `mix(cj, paper, min(.9, t + .4))`; `--surf` `mix(cj, ink, .08)`; `--cj-lite` `mix(cj, white, .5)`; `--cj-deep` `mix(cj, ink, .3)`; `--wash` `mix(cj, white, .72)`.

### 7.9 What to delete

- **`Tree.tsx`:** `scrollTap`, `PETAL_H`, `GemChip`, `MIST`, `ScrollPetal`, `ProgressVine`, `Roller`, `SwipeHand`, `GemKey`, `HINT_KEY`, `hintSeen` (and the `superninja.scrollHint` key), `PetalScroll`, its `IntersectionObserver`s, `MetWords` and `Explain` (folded into §7.6), the chart view's `bg-img` filter, `WorldFlower`'s endless ready pulse. **Keep:** `WorldFlower`, `FLOWER_RINGS`, `flowerColour`, `petalLight`, `DarkCrystal`, `Jewel`, `BigPetal`, `slotsOf`, `ExampleWords`, `useSpokenWord`, `GemVictory`, `PractisedTrip`, `ChartIcon`, `FlowerIcon`, `GateIcon`, and every export (§7.10).
- **`tree-visit.css`:** `.sp-cv`, `.sp-mist`, `.sp-blob`, `.sp-rune`, `.sp-focus`, `.wf-focus` and their keyframes, and their entries in the `.tree-base[inert]` rule.
- **`tree-teach.css`:** `.pd-sheet`, `.pd-left`, `.pd-petal`, `.pd-petal-hear`, `.pd-actions`, `.pd-main`, `.pd-gems`, `.pd-gem`, `.pd-play`, `.pd-explain`, `.pd-found`, `.pd-found-words`, `.met-word`, `.chip-reveal`; `.pd-backdrop` and `.pd-close` move to tree-chart.css.

### 7.10 What must stay compatible

- **The `Tree` props** (`onBack`, `onTrial`, `onPractice`, `celebrate`, `visit`) and App's routes: unchanged. `onDetective` is optional and new (§7.6); App passes it when Sound Detective lands.
- **Exports used elsewhere:** `Tree`, `visitFlower`, `focusGem`, `celebrateGem`, `tripDue`, `setTripDue` (App); `WorldFlower`, `FLOWER_RINGS`, `BigPetal`, `ExampleWords`, `Jewel`, `petalLight`, `slotsOf` (Intros, Stickers); `PetalDetail`, `DarkCrystal`, `GateIcon`, `FlowerIcon`, `teardrop`, `teardropAt`, `mix`, `neededGems`.
- **The engine** (`gemState`, `energyOf`, `petalComplete`, `knownNow`, `readyGems`, `canPractise`, `markVisited`, `lastPractice`) and **`progress.ts`**: read only.
- **Hooks for bots, the treadmill and the tweet kit** (v1 §7.8): `.petal-scroll` and `.scrollable` on the scroller; `[aria-label="petal <id>"]`, `[data-p]`, `role="button"` on each chart petal, with an `img` inside once met; `[data-gem-chip]` on met lines; `[aria-label="Petal chart"]` / `[aria-label="The World Flower"]` on the toggle; `[aria-label^="gem "]` on the card's spellings; `[data-petal]` on the card's big petal; "close", "Practise in the dojo", "Gem battle <g>", "Hear the sound and its words", `[data-nav="again"]`; `window.__snState` (§7.7). **Changed:** the card's "Hear the sound" button is now "Hear the sound and its words", and "Sensei explains" is gone (update `scripts/treadmill/sweep.ts`'s `INTENT` texts and any bot that taps them).
- **Scripts that swipe sideways must swipe vertically** (v1 §7.8): `scripts/record-clips.ts` `swipeScroll`, `assets-src/tweet/2026-09-26/clip-recipes.ts` `swipe`, `assets-src/tweet/2026-09-26/petal-scroll/drive.ts`.
- **Docs to update after the build:** NAVIGATION.md §4 and §2.3's World Flower rows, SOUND_DISPLAY.md rows 52–53, PERF.md fix 9.

### 7.11 Order of work

1. `petalLook.ts` and `chartPetal.ts` with their tests (§8.3).
2. `WorldFlower`'s look (the free flower), then `PetalChart`, `ChartPetal`, `PageDots`, `ChartKey` and tree-chart.css; delete the scroll. Compare the stills (§8.1).
3. The card and the fork panel.
4. The reveal, the practised beat, the landing and the rises, the focus ring, the flower's `grow` and `rise`.
5. The scripts and hooks in §7.10, then the sweep and the soak.

---

## 8. Acceptance

### 8.1 Stills to compare with the mockup

Take each at 844×390, DPR 3, touch (the `s…` ones at 667×375, DPR 2) with the model's children: `bun playtest/runs/flower-v2/mockup/dump-progress.ts`, then `bun playtest/runs/flower-v2/saves/export.ts` writes `playtest/runs/flower-v2/saves/<child>.json` and `clock.json`. Before the game loads, put the save in `localStorage["superninja.save.v1"]` and set the page clock to the child's time (`page.clock.setSystemTime`). Open `?scene=tree` and tap "Petal chart" where the still is of the chart. Each must match its mockup still in layout, letters, colour levels, gem marks, lines and colours. The `programme` child is an illustration the game can't load until it teaches the Extended Code; its stills (05, 11, 12, 15, 16, 19–22, 24–26, 31, `whole-programme`, s01–s04) are checked on the mockup only, and in the game with the nearest real child (year1) for layout.

| still ([`shots/`](scroll-design/final/shots/)) | child | the game |
|---|---|---|
| `01-flower-new`, `02-flower-first`, `03-flower-reception`, `04-flower-year1`, `06-flower-away` | new, first, reception, year1, away | `?scene=tree` |
| `07-chart-new`, `08-chart-first`, `09-chart-reception`, `10-chart-year1` | new, first, reception, year1 | "Petal chart"; the half-sheet it lands on (for new and reception, swipe to /s/'s and /e/'s half) |
| `12b-chart-year1-sheet2`, `14-chart-year1-sheet3`, `13-chart-away` | year1, year1, away | swipe to sheet 2 top, sheet 3 bottom (the key); away: sheet 2 top |
| `17-card-year1-ae-dusty` | year1 | tap /ae/, then *ai* |
| `18-card-first-s-outline-firsttime` | first (a fresh ledger) | tap /s/: the speaker rings, `tv_train_hear_again` |
| `32-card-reception-d-caughtup`, `s06-card-reception-d-caughtup` | reception | tap /d/ |
| `33-card-year1-y-matte` | year1 | tap /y/ |
| `23-fork-year1-th-explain-only` | year1 | tap /th/, then the fork chip: two petals, no magnifying glass |
| `34-mystery-tap-year1` | year1 | tap /oy/: `petal_secret` |
| `35-unlock-chart-first-s-mid`, `36-unlock-chart-first-s-after`, `37-unlock-flower-first-s-mid` | first | `?scene=tree&visit=spelling:s>s`, Next to the end: the chart's reveal unlocks /s/ (its only met spelling is the trip's); the flower's is B3's `GemFound` |
| `whole-first`, `whole-reception`, `whole-year1` | | a full-page capture of the scroller at 1280 wide |
| `s05-flower-reception`, `s07-chart-first` | reception, first | the small phone |
| `x1`–`x4` | | rejected variants: nothing to match |

### 8.2 Numbers (Chromium, 844×390, DPR 3, touch, CPU ×4; `playtest/runs/flower-v2/mockup/cost.ts` can be pointed at the game)

- **DOM:** the chart view ≤ 600 nodes with a card open; the flower view ≤ 700 with a card open; the year1 child's chart view ≤ 450 and flower view ≤ 520 with nothing open.
- **At rest:** main thread ≤ 2 %, 0 compositor frames, 0 running animations 4 s after arrival, 0 endless animations anywhere in the scene.
- **Swiping:** frame p95 ≤ 20 ms (≥ 50 fps), 0 long tasks, main thread ≤ 20 % per gesture, each flick one half-sheet (at least 13 of 15 with queued 60 Hz touch; all with paced touch).
- **Taps:** a tap during a glide opens nothing; a tap on the scrim or the letterbox closes the card.
- **Opening a card:** no task over 120 ms. **The progress:** `flowerOverview` + 44 × `petalProgress` under 10 ms unthrottled, computed once per save change.

### 8.3 Unit tests

`petalLook.test.ts`, on the simulator's children (import them as `dump-progress.ts` does, or copy the saves):
- every petal's look agrees with the model: missing ⇔ `state === "missing"`; complete ⇔ `complete.full`; `caught` ⇔ `state === "complete" && !complete.full`; level = whole; matte ⇒ complete;
- the away child has exactly the year1 child's stages and levels (time never takes colour away);
- every gem's mark matches its stage; `polish` is 1 when mastered; `dusty` ⇔ `fading`;
- `soundLineOf`: *th* gives two segments on year1 (/th/ first in the /th/ petal, /dh/ first in the /dh/ petal); *u* gives none; *x* never; every segment is unsure without `sure`.

`chartPetal.test.ts`:
- v1's fit invariants for every petal, every child and every spelling met: every line and its mark inside the teardrop; *F* ≥ 22 on the sheet and ≥ 34 on the card; *M* ≤ 1.6 *F* whenever *F* ≥ 0.62 *M* fits; no line below `bottom`;
- `levelFromTop` is monotonic and area-true (the area above `levelFromTop(a)` is `a` ± 1 %);
- `snapLevel`: never inside a line box; never below a pencil line's top when that line is the next below it; a won line straddled by the level is inside; the result is within two lines of the unsnapped level;
- `landingHalf` follows §3.4.4's order; `halfOf` maps the 44 petals to the 6 half-sheets.

### 8.4 Sweep cases

- The existing tree cases pass unchanged in intent: `tree`, `tree-petal`, `tree-victory`, `tree-found`, `tree-world`, `tree-practised`, `practise`, `trial`, `tree-practise-tap`, `tree-home`, `home-trip`, `home-trial`.
- **New `tree-chart`:** `?scene=tree` with `FLOWER_SAVE`, tap "Petal chart", three swipes up and one down, tap a petal, close with the scrim, tap a missing petal, tap a page dot, Home → the map.
- **New `tree-land`:** v1 §8.2's (a victory whose petal isn't completed by it) ends on the chart with the jewel beside *oa* and the colour grown, then `done`.
- **New `tree-fork`:** the year1 save, tap /th/, tap *th*, tap the fork chip: two petals, no magnifying glass; ✓ returns to the /th/ card.
- **Every tree case:** no `tiny-target` (chart cells 115 × 164, the page dots 47 × 181, every card and fork panel target ≥ 44), no `zone-conflict`, no `covered-target`, `home-missing` passes, no `auto-advance`.

### 8.5 The soak's World Flower rows

`scripts/treadmill/soak.ts --mobile --cpu 4` keeps passing its World Flower rows (main thread ≤ 30 %, longest task ≤ 120 ms, median fps ≥ 50, endless non-composited animations ≤ 2, DOM ≤ baseline + 600), with three rows added or changed: **the still flower** and **the still chart** (main thread ≤ 2 %, rAF requests ≤ 5 /s, 0 endless animations), and **swiping the chart** (median fps ≥ 58, main thread ≤ 20 %), replacing PERF's "swiping the World Flower's petal chart" row.

---

## 9. Decisions and open questions

**Decisions** (made without asking, as the house rules say; this run could write only to `docs/scroll-design/`, this file and new files, so `docs/DECISIONS.md` isn't touched):

1. **The colour is `whole`; the gold line is "all won for now"; the star is the whole column** (the visual designer's mapping, confirmed). `fill` keeps a keen child's flower about 95 % full and drops whenever a spelling is taught; `whole` only rises and shows progress through the programme. *Reverse:* `level = fill` in `petalLook`, one line.
2. **The chart colours in from the top; the flower from the heart.** The chart lists the commonest spellings first, so from the top the colour sits behind what the child has won; from the point it sat behind the spellings still to find. The flower has no letters, and growing from the heart reads as the flower blooming. In a flight between the two views the petal is drawn in the flower's style.
3. **The surface never cuts a spelling, and the colour holds what is won** (§3.4.3), within a line or two of true area.
4. **Missing petals are absent on the flower** (Jonas: "starts missing"), with dotted hints only for the sounds hiding in the child's land; **dotted slots on the chart**, because the chart is the school's sheet and every petal has its place.
5. **Dust only on gems; complete petals go matte; colour never falls** (the model's rule and MULTI_SOUND D8).
6. **The gem meter is a cut gem filling from its point, pencil until won, ink once won,** its frost clearing with consolidation. The ring looked like radio buttons and the ink-in letters like a rendering bug (stills `x1`, `x2`).
7. **No ▶.** One action per card, named by a chip: the gem guardian, the dojo gate, or nothing for a mastered gem that isn't dusty.
8. **No Sensei face on the card.** Help is Sensei; tapping the chosen spelling again replays her explanation; the speaker says the sound and the words.
9. **Page dots replace v1's map;** no pins; no progress ring on the toggle.
10. **The sound line is MULTI_SOUND's,** faint until Sound Detective says the child is sure; until `forks.ts` exists every segment is faint (the mockup stands in "mastered" for "sure" so both looks can be seen). < u > as the /w/ of < qu > and < x > never get one.
11. **The fork panel is a second face of the card,** opened by the fork chip; its gate is the magnifying glass, shown only when App passes `onDetective`.
12. **The heart counts petals on the flower** (sounds met), not petals complete: with `whole` as the colour, "complete" is rare until Year 2.
13. **Ready gems hop three times, never pulse endlessly,** on both views.
14. **Three words on the card, no placeholders.**
15. **Kept from v1:** the half-sheet paging, the tap guard, the fit, the wall and letterbox, the toggle under Home, no ninja on the chart, nothing moving by itself.

**Open questions and follow-ups:**
- **Is `whole` too slow for a Reception child?** Their petals sit at a quarter to a half coloured for two years. Watch the playtests; decision 1's reverse is one line.
- **/v/ can never be won:** *ve* has only two testable words (progress-model §10); unit 11 needs a third (*twelve*, *solve*).
- **`gemState` shows a lesson's spellings one lesson early;** the chart follows the model (pencil until the lesson). Worth aligning in `gems.ts`.
- **Assets:** `petal_s.webp` is a red ring (it reads as "o"); the chart has a red outline circle for /s/.
- **Safari on the iPhone** hasn't been profiled; check the masks, the flower's glow filter and `content-visibility` there.
- **Chromium's late fling** (§6): check on Jonas's phone before anything in script.

---

## 10. Evidence

- **The mockup:** `docs/scroll-design/final/index.html`, built from `playtest/runs/flower-v2/mockup/template.html` by `build.py`, with `data.json` (`dump.ts`: `src/content/flower.ts`), `progress.json` (`dump-progress.ts`: `src/content/progress.ts` on the simulator's children, copied from `progress.test.ts` at run time) and `lines.json` (captions).
- **Stills:** `docs/scroll-design/final/shots/*.jpg`, from `playtest/runs/flower-v2/mockup/shots.ts` (it serves the repo root on its own port; `V2_PATH=/docs/scroll-design/final/` shoots the published copy). `compare.png` from `compare.py`. The iterations are in `playtest/runs/flower-v2/shots/` (`iter1`–`iter7`, `final`, `lead1`–`lead8`, `v2-final`).
- **Cost:** `playtest/runs/flower-v2/mockup/cost.ts` (v1's probe, pointed at v2; raw JSON in `out/`), `probe.ts` and `domcount.ts`.
- **Saves for the game's stills:** `playtest/runs/flower-v2/saves/export.ts`.
- **v1:** `docs/scroll-design/v1/` (its spec, mockup, stills and compare). **The school chart** is a reference for eyes only: its side-by-side reviews stay in `playtest/runs/` and never go into `docs/` or `public/`.
