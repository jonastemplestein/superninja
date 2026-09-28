# Map audit (27 Sep): what the child sees and taps today

Jonas, 27 Sep: "on the overworld map the kids can still never find the right button to press and their avatar weirdly overlays half of the button etc and its all v weird. Also we could have some failsafe there where going back to a previous lesson accidentally, the sensei asks if thats what we want."

This is the evidence for docs/MAP_DESIGN.md. Everything below was measured on production.

## In short

1. **The right button is the gold stone, and the child's own ninja stands on top of it.** The ninja's box covers **97 % of the stone's width and 70 % of its height** (63 × 45 CSS px of a 65 px stone on an 844 × 390 phone). The ninja is on top for taps, and it takes **76 % of the taps on the stone's disc**. The ninja's painted pixels hide **31 % of the disc and 38 % of the stone's picture**. What the child sees is a ninja standing in a gold glow, with a pig or Sensei poking out round its legs ([close-up](current/bamboo-844x390-closeup.png), [the same without the ninja](current/bamboo-844x390-closeup-no-ninja.png)).
2. **Tapping the ninja still works**, because it is a hidden shortcut into the next level (`data-tap-proxy`). Nothing tells the child to tap the ninja, though. Sensei says "Tap the **glowing stone**", Help says "the **big, gold, bouncing stone**", and a locked stone says "Play the **big gold stone** first". The stone and the ninja also bob out of step: the stone every 1.1 s, the ninja every 2.2 s. So the stone slides up and down behind the ninja's feet, which is the "weird" part.
3. **Most of what a child can tap is a mistake.** Partway through Bamboo Village, finished stones make up **42 %** of the screen's tappable area, and each one **replays its old level the moment a finger touches it**, with no confirm. The next level (stone plus ninja) is **11 %**, and the part of the stone you can actually see is **1.5 %**.
4. **The pointing hand points beside the stone, not at it.** Its fingertip sits 4.8 CSS px outside the gold stone, and the hand's middle is **15.6 px from the gold stone and 20.6 px from the finished stone next to it** (the battle just won). A tap on the hand itself does nothing. The hand shows all the time from the first frame, so it never gets any stronger.
5. **There are five gold round things on the map**, and Sensei asks for "the big gold stone". They are Home (goes to the title), Hear it again, Sensei's Challenge (starts a review level instead of the lesson), the ◀ ▶ land arrows when they are open, and the stone.
6. **The map has no idle ladder.** Sensei says the land's welcome and one hint about 2 s after arriving, and then nothing more, ever (checked to 45 s). TEACHER_SCRIPT §5.8 (`tv_map_hint` as the 8 s nudge, `tv_map_next_<game>`, `tv_welcome_back`) isn't wired in production. B1 is wiring it now (TV-B1.2).
7. **The lands page; they don't scroll.** ◀ ▶ swap the whole map, and swipes do nothing. ◀ takes a child to a land where every stone is a replay, and there is no gold stone, no ninja and no hand. Help there still says "Tap the big, gold, bouncing stone".
8. **The treadmill can't see any of this.** All 357 bot taps on the map in 48 transcripts are `pointerdown` events dispatched straight onto `[aria-label="level <next>"]`, so they are never hit-tested. The sweep's `covered-target` and `zone-conflict` checks skip `[data-tap-proxy]`. The one time the sweep did catch the ninja covering a stone (25 Sep), the fix moved the ninja onto its own stone and exempted it from the check.

## How this was tested

- **Production:** https://superninja.templestein.com/play/, bundle `play-BkhzgbZT.js`. It is the same as local `dist/` and matches `src/App.tsx` as of 00:56 today; the fix workflow hasn't changed the map yet.
- **Browser:** Playwright Chromium, `isMobile`, `hasTouch`, DPR 3, an iPhone user agent, and real touch taps (`touchscreen.tap`). `(pointer: coarse)` is true, so the stage has its phone insets. The stage is 1280 × 720, scaled 0.4917 at 844 × 390, 0.4708 at 667 × 375 and 0.5472 at 932 × 430.
- **Three children**, seeded as saves with captions off and music off:
  - **new**: just after the first session, next stone `w1-wu3` (the third warm-up).
  - **bamboo**: partway through Bamboo Village, next stone `w1-7` (Sound Hunt).
  - **w3**: in the Misty Mountains, next stone `w3-6` (a dojo).
- **Ways onto the map:**
  - the `?scene=map` deep link;
  - the title → Start → the player (the "welcome" arrival);
  - Home on Reward 2 (the end of the first session, with the Sticker Book introduction and the walk);
  - Home on w1-6's reward (a normal return, with the walk).
- **Measurements:** in-page geometry, a 1 CSS px hit-test (`elementFromPoint`) of the next stone's disc, and the ninja sprite's alpha channel for what it hides.
- **Files:** the scripts are in `current/scripts/` (`map-audit.ts`, `page-audit.ts`, `area-audit.ts`). The raw numbers are in `current/measurements-*.json`.

## 1. What "the right button" is, and how it looks

The next level is `frontier()`: the first level with no stars. On the map it is the only stone with `className="map-next"` (App.tsx `WorldMap`).

| | the next stone | a finished stone | a locked stone |
|---|---|---|---|
| Size, stage px (Bamboo's 3 rows / 2-row lands / 1-row lands) | 132 / 146 / 158 | 94 / 104 / 104 (a boss: 112 / 128) | 76 / 84 / 84 |
| Size, CSS px at 844 × 390 | 65 (Bamboo), 72 (w3) | 46, 51 | 37, 41 |
| Colour | gold radial (`#fffbe6 → #ffc53d → #c98a00`), 7 px ink border | the land's colour, 5 px border | grey, a lock badge |
| Glow | a 10 px gold ring and a 40 px gold halo (box-shadow) | none | none |
| Motion | bounces for ever (`mapnext` 1.1 s: up 12 px, scale 1.06) | pops in once | pops in once |
| Picture | the level kind's picture, 86 % of the stone | the same pictures | the same pictures, greyed |
| Number | none (no stone has one) | none, but three gold stars under it (except warm-ups) | none |
| On top | **the ninja**, the pointing hand | | |

Things that make it hard to spot:

- The pictures are shared by kind, so the next stone looks like its neighbours. The warm-ups alternate tortoise, fish-dog, tortoise, fish-dog, so the new child's gold stone is the third tortoise ([new-844x390](current/new-844x390.jpg)).
- Dojo stones carry Sensei herself (`sensei_idle`), the same face as the Help button. In the Misty Mountains the next stone is a dojo right beside Help, and the ninja stands on Sensei's head ([w3 close-up](current/w3-844x390-closeup.png)).
- The locked stones were meant to recede at `opacity: .8`, but the `pop-in` animation's `both` fill holds opacity at 1. They are grey, but fully opaque.

Screens: [new-844x390](current/new-844x390.jpg), [bamboo-844x390](current/bamboo-844x390.jpg), [w3-844x390](current/w3-844x390.jpg), and the same at [667 × 375](current/bamboo-667x375.jpg) and [932 × 430](current/bamboo-932x430.jpg).

## 2. Where the ninja sits, and how it covers the stone

In the code, the ninja's box is 128 × 172 stage px, centred on the stone, with its feet 26 px below the stone's centre (`left: p.x − 64, top: p.y + 26 − 172`). So it runs from 146 px above the stone's centre to 26 px below it. The CSS comment says it "stands ON its stone like a game piece". The box is `z-index: 8`; the next stone is 7 and other stones are 5, all in the same stacking context. **The ninja is on top for taps**, and its tap handler opens the next level (`onLevel(cur.id)`).

| child, viewport | next stone (CSS px) | ninja box (CSS px) | box over stone, w × h (CSS px) | share of the stone's width / height | disc taps that hit the ninja | disc painted over by the ninja | stone's picture painted over |
|---|---|---|---|---|---|---|---|
| bamboo 844 × 390 | 64.9 | 62.9 × 84.6 | **62.9 × 45.2** | 97 % / 70 % | **76 %** | 31 % | 39 % |
| bamboo 667 × 375 | 62.2 | 60.3 × 81.0 | 60.3 × 43.3 | 97 % / 70 % | 77 % | 31 % | 39 % |
| bamboo 932 × 430 | 72.2 | 70.0 × 94.1 | 70.0 × 50.3 | 97 % / 70 % | 76 % | 31 % | 38 % |
| new 844 × 390 | 64.9 | 62.9 × 84.6 | 62.9 × 45.2 | 97 % / 70 % | 76 % | 31 % | 38 % |
| w3 844 × 390 | 71.8 | 62.9 × 84.6 | 62.9 × 48.7 | 88 % / 68 % | 70 % | 28 % | 33 % |
| w3 667 × 375 | 68.7 | 60.3 × 81.0 | 60.3 × 46.6 | 88 % / 68 % | 70 % | 28 % | 33 % |
| w3 932 × 430 | 79.9 | 70.0 × 94.1 | 70.0 × 54.2 | 88 % / 68 % | 69 % | 28 % | 34 % |

- The ninja's painted sprite fills its box almost edge to edge (61.5 × 83 of 62.9 × 84.6 CSS px). Its transparent gaps between the arms and legs still take taps, because the whole box is the target.
- The box rises about 39 CSS px above the stone. On Bamboo Village's middle row, that is into the row above: it covers **21.6 × 15.5 CSS px of the locked stone w1-12** at 844 × 390. A tap there opens the next level, not "Not yet!".
- **The only moment the stone reads clearly is the walk.** For the first 1.35 s after a level, the ninja stands on the finished stone and then runs across. During that time the gold stone is bare, with the hand beside it. It reads at once ([arrive-w1-6 at 0.3 s](current/arrive-w1-6-0300ms.jpg), [0.9 s](current/arrive-w1-6-0900ms.jpg)). Then the ninja hops on and covers it ([3.5 s](current/arrive-w1-6-3500ms.jpg)).
- **The walk animates `left` and `top`** (`.map-hero { transition: left .9s, top .9s }`). That is a layout animation, not a compositor-only one.
- **History:** on 25 Sep the sweep reported "covered-target: level w1-15, centre is covered by div". The ninja was then standing above its stone, on top of the other row's stone ([that shot](current/history-25sep-sweep-ninja-covers-w1-15.png)). The fix put the ninja on its own stone and exempted `[data-tap-proxy]` from the check (sweep.ts l. 205, 215; HERO.md "It skips … anything marked data-tap-proxy"). So the check that found the problem was switched off for it.

## 3. What else is tappable, and how a three-year-old's first tap goes wrong

**Tap maps** (every 6 CSS px, what a finger there hits): [bamboo 844](current/bamboo-844x390-tapmap.jpg), [w3 844](current/w3-844x390-tapmap.jpg), [new 844](current/new-844x390-tapmap.jpg), and the same for 667 and 932. Green is the next level, orange a finished stone (it replays), grey a locked stone, purple the lands, blue the side buttons, red Home and cyan Help.

**Share of the screen's tappable area** at 844 × 390, in CSS px² (`current/measurements-area.json`):

| target | new (next `w1-wu3`) | mid-Bamboo (next `w1-7`) | Misty Mountains (next `w3-6`) |
|---|---|---|---|
| the next level: the ninja + the visible stone | 6,340 (13.5 %), of which the stone is 808 (1.7 %) | 6,436 (**11.3 %**), stone 868 (**1.5 %**) | 6,888 (14.0 %), stone 1,320 (2.7 %) |
| finished stones and their stars (replay at once) | 3,584 (7.6 %) | **24,140 (42.3 %)** | 15,048 (30.4 %) |
| locked stones ("Not yet!") | 22,936 (48.7 %) | 10,464 (18.3 %) | 9,788 (19.8 %) |
| Help, Hear it again, Home, Sticker Book, World Flower, Challenge, ◀ ▶, gear | the rest (about 3–6 % each) | | |

**Everything tappable on the map** (stage px centre; CSS size at 844 × 390):

| target | where | CSS px | what it does |
|---|---|---|---|
| the next stone | on the path | 65–72 | the next level (on finger-down) |
| the ninja | on the next stone | 63 × 85 box | the next level |
| a finished stone (and its stars) | on the path | 46–51 | **replays that level at once, no confirm** |
| a locked stone | on the path | 37–41 | `sfx.wrong` + "Not yet! Play the big gold stone first." |
| Home (gold) | 68, 66 | 49 | **to the title**, no confirm |
| ◀ previous land (gold) | 300, 64 | 45 | pages to the land before; hidden in land 1 |
| ▶ next land (gold when open, grey when locked) | 968–980, 64 | 45 | pages, or "Not yet!…" when locked |
| gear (hold 2 s) | 1216, 64 | 45 | grown-ups; a short tap says "This part is for grown-ups…" |
| Sticker Book | 1214, 172 | 47 | the Sticker Book |
| World Flower (pulses with a ready gem or a due trip) | 1214, 282 | 47 | the World Flower (a trip, when one is due) |
| Sensei's Challenge (gold target; from w1-4 on) | 1214, 392 | 47 | **a review level**, "Practice time with Sensei!…" |
| Hear it again (gold speaker) | 1212, 504 | 49 | the arrival lines again |
| Help (Sensei's portrait) | 1204, 644 | 61 | "Tap the big, gold, bouncing stone to play!" |

**Real taps** (844 × 390, mid-Bamboo, after the arrival lines; `current/measurements-taps.json`, `current/tap-*.jpg`):

| tap | result |
|---|---|
| the ninja's head | w1-7 ✓ |
| the gold rim showing below the ninja | w1-7 ✓ |
| the hand's fingertip | w1-7, but only because the stone's bounce (scale 1.06) had reached it; at rest the fingertip is 4.8 px outside the stone |
| the middle of the hand | **nothing** (the hand has `pointer-events: none`, and its palm is over the background) |
| w1-6, the finished stone beside the gold one | **replays the battle at once**: "Baron Muddle hid the sounds. Let's win them back from his monsters." |
| locked w1-8 | "Not yet! Play the big gold stone first." |
| Sensei's Challenge (gold) | **a review level**: "Practice time with Sensei! Let's try the sounds you found tricky." |
| ▶ (Blossom Hills still locked) | "Not yet! Play the big gold stone first." |
| Home | the title |
| ◀ (from the Misty Mountains) | Blossom Hills: every stone a replay, no gold stone, no ninja, no hand ([shot](current/w3-tap-prev-land-blossom-844x390.jpg)) |

**How a three-year-old's first tap probably goes wrong,** most likely first:

1. **The finished stone next to the gold one.** The hand sits between the two stones: its middle is 15.6 CSS px from the gold stone and 20.6 px from the finished one (the fingertip is 4.8 and 13.1). The gap between the two stones is only 15.9 CSS px, about 2.5 mm on an iPhone and a fraction of a child's fingertip. The finished stone is a bright monster with three gold stars, and it isn't covered. The tap replays that level on finger-down, with no "is that what you want?". This is the accidental trip back that Jonas describes. Finished stones are the biggest tappable area on the map from mid-Bamboo on.
2. **The hand itself.** Children tap what points. Its palm and wrist are over the background, so nothing happens: no sound, no wobble, no line. The child learns the map is "broken".
3. **"The big gold stone" is something else gold.** Sensei's Challenge is a gold disc the same size as a finished stone, one column away, and it starts a different activity. Home is gold and leaves for the title. Hear it again is gold. The open ◀ ▶ are gold.
4. **An arrow.** ◀ strands the child on an earlier land made entirely of replays (item 1 again, with no correct answer on screen). Help there still asks for the gold stone. ▶ on a locked land only says "Not yet!".
5. **Sensei's face.** Dojo stones show Sensei, the same picture as the Help button. In the Misty Mountains the next stone (a dojo) and Help are about 210 stage px apart, centre to centre, and both show Sensei.
6. **The Sticker Book or the World Flower,** when either pulses (the book on the first-session arrival, the flower with a ready gem or a due trip). Their pulse (scale 1.1 every 1.3 s) competes with the stone's bounce.
7. **A locked stone.** Harmless ("Not yet!"), but it names the gold stone the child can't see.
8. **The ninja.** This one works, by luck. It is the biggest, most alive thing on the screen and it is the next level, but no line, hand or glow says so.

Decorations (the huts, lanterns, drifting petals) aren't tappable. A tap there does nothing, with no feedback. That is 83 % of the screen at 844 × 390, letterbox included.

## 4. What Sensei says, and when

Measured from the audio log (`window.__audioLog`) on production:

| arrival | what is said (seconds after the map appears) | the hands |
|---|---|---|
| **End of the first session** (Reward 2 → map) | 0.2 s `fm_rw2_map` "Your Sticker Book lives here, on the map!", then 3.1 s `map_hint` "Tap the glowing stone to start your next adventure." | **two hands at once**: one on the Sticker Book (which bounces) and one by the stone, until 2.5 s after `map_hint` ends. The ninja walks from w1-wu2 to w1-wu3 meanwhile ([0.3 s](current/arrive-r2-0300ms.jpg), [0.9 s](current/arrive-r2-0900ms.jpg), [3.5 s](current/arrive-r2-3500ms.jpg)) |
| **From the title** (Start → the player) | `welcome_back` "Welcome back, Super Ninja! Ready for more training?", then `map_hint` about 2.9 s later | one, by the stone |
| **After every level** (the reward's Next or Home) | 0 s `world_1` "Welcome to Bamboo Village!" (**on every return**, though the child never left the land; also in the transcripts, e.g. 38:54.0), then 2.1 s `map_hint` | one, by the stone |
| **Turning to another land** (◀ ▶) | the land's welcome only (`world_2` "Welcome to Blossom Hills!"); no hint | only on the child's current land |
| **Help** | 1st press `help_map` "Tap the big, gold, bouncing stone to play!"; later presses `help_map` + `map_hint`. The same on a land that has no gold stone | none added |
| **Locked stone / locked ▶** | `map_locked` "Not yet! Play the big gold stone first." with `sfx.wrong` | |
| **Hear it again** | the arrival lines again | |
| **Idle** | **nothing, ever** (no line after `map_hint` in 45 s; [45 s shot](current/idle45-bamboo-844x390.jpg)) | the one hand stays exactly as it was |

- **No pointing escalation and no idle ladder.** The map has no Next, so NAVIGATION.md §3.2's ladder (8 s glow and hand, 16 s line, 40 s) never runs. The hand is there from the first frame, always the same.
- **Three names for the target:**
  - "the glowing stone" (`map_hint`, and `tv_map_hint` to come);
  - "the big, gold, bouncing stone" (`help_map`);
  - "the big gold stone" (`map_locked`).
  
  On screen, none of them describes the ninja on top.
- **The script isn't wired yet.** TEACHER_SCRIPT §5.8 has `tv_welcome_back`, `tv_map_hint` (the first two arrivals, then the 8 s nudge), `tv_map_next_<game>` (the first stone of a new game) and the land's welcome only once a session. None of them plays in production: `WorldMap` still uses `map_hint`, `welcome_back` and `world_<n>` on every arrival. `map_hint`'s "adventure" is marked to retire. `arrivalLines()` and `mapPreview()` exist in narrative.ts and narrate.tsx but aren't called. B1 is wiring them in the current fix workflow (TV-B1.2), so the map redesign should build on those lines.
- **The first tap usually comes before the hint.** The hint starts about 2 s after arrival, after the land's welcome, and a three-year-old often taps first. Until then nothing says it's their turn.

## 5. Do the worlds scroll or page?

**They page.** `WorldMap` shows one land at a time (`wi`). ◀ and ▶ (92 stage px, 45 CSS px) sit either side of the land's banner at the top:

- ◀ is hidden on land 1.
- ▶ is greyed (`grayscale(1)`) but still tappable when the next land is locked, and says "Not yet!…".
- A page turn swaps the background (a 0.5 s fade) and pops the stones in again, one after another.
- Swipes do nothing: a 400 px swipe either way left the banner on "Misty Mountains".
- The map opens on the land of the level just played, or on the current level's land.
- On any land but the child's current one there is no gold stone, no ninja, no hand and no hint. Every stone replays.
- A land's stones all fit on one screen. Bamboo Village's 20 stones sit in three snaking rows 168 stage px apart, and the ninja's box (172 px tall) is taller than that gap.

## 6. What the bots and the treadmill saw

- **Transcripts:** 48 `continuous-*.json` files under `playtest/`, with 357 map taps, every one "level <the next id>". The bot (scripts/treadmill/continuous.ts l. 204, 266) calls `locator('[aria-label="level X"]').dispatchEvent("pointerdown")`. That fires on the element itself, so it never hits the ninja, a neighbour, the hand or the background. No run has ever tapped the map by position. The transcripts do show the lines: `world_1` + `map_hint` on every return, and the bot tapping 3–4 s in, sometimes cutting `map_hint` off (✂, e.g. 33:51.3).
- **The sweep:**
  - `covered-target` and `zone-conflict` skip `[data-tap-proxy]` (sweep.ts l. 205, 215), so the ninja over the next stone isn't reported.
  - The map case's only findings in all runs are the 25 Sep `covered-target` on w1-15 (the ninja, before it moved onto its own stone), `tiny-target` stones of 33 px (25–26 Sep, before the stones were enlarged), and the World Flower under Help (25 Sep).
  - The monkey mode does tap at random coordinates (l. 822), but it records only crashes.
- **FEEDBACK.md Round 3:** "The map never makes it clear what to tap". The answer then was the big gold bouncing stone, the pointing hand, and "tapping the ninja also opens it". Jonas's "still" is about the result of that fix: the ninja now stands on the answer.

## 7. What the redesign has to solve (for MAP_DESIGN.md)

1. **Nothing may cover the next stone.** The ninja stands beside it, or behind it and smaller, never over it. The 0.3 s walk frame shows that a bare gold stone with the ninja beside it reads at once. One visible target means one tap region, and the stone's own picture stays whole.
2. **Only one gold thing.** The next stone should be the only gold, bouncing, glowing thing on the map. Either Home, Hear it again, Sensei's Challenge and the open land arrows stop being gold, or the stone's language changes.
3. **One name for the target, and the name matches the picture.** Pick one phrase (TEACHER_SCRIPT's "the glowing stone" is the base) and make `help_map` and `map_locked` say the same thing.
4. **Finished stones need the confirm** (Jonas's failsafe). A tap on a finished stone should ask ("Do you want to play this one again?", with the reusable confirm) instead of starting the level on finger-down. Home from the map, Sensei's Challenge and ◀ to an earlier land are candidates for the same confirm, or for moving out of reach.
5. **The hand should point at the stone.** Its fingertip belongs on the stone and clear of any neighbour, and it should come on the idle ladder: 8 s glow and hand, 16 s `tv_map_hint`, 40 s once more, then quiet (NAVIGATION.md §3.2 and TEACHER_SCRIPT §5.8), not stay on for ever. A tap on the hand itself should count as a tap on the stone.
6. **Give the next stone room.** Its nearest neighbour is 15.9 CSS px away in Bamboo Village, about 2.5 mm. Either more space round it or smaller, quieter finished stones.
7. **Other lands need a way home.** On a land without the next stone, show the way back (▶ glowing, "Your ninja is over here!") and make Help say something true there.
8. **Motion:** one rhythm for the stone and the ninja (today 1.1 s and 2.2 s, out of step). Walk with `transform`, not `left`/`top`.
9. **The treadmill has to tap like a child.** Map taps by coordinates (the centre of what's visible), a `covered-target` check that no longer exempts the ninja over the next stone, and a check that the next level's visible area is the biggest tappable area on screen.

## Files

- `current/<child>-<viewport>.jpg`: the map as the child sees it (new, bamboo, w3 × 844 × 390, 667 × 375, 932 × 430).
- `current/<child>-<viewport>-closeup.png` and `-closeup-no-ninja.png`: the next stone at full resolution, with the ninja and without it.
- `current/<child>-<viewport>-tapmap.jpg`: what a finger hits everywhere on screen.
- `current/arrive-r2-*.jpg`, `current/arrive-w1-6-*.jpg`: the walk and the arrival, at 0.3, 0.9, 1.6, 3.5 and 8 s.
- `current/tap-*.jpg`: the screen after each probe tap. `current/w3-tap-prev-land-blossom-844x390.jpg`: after ◀ from the Misty Mountains.
- `current/idle45-*.jpg`: the map after 45 s untouched.
- `current/history-25sep-sweep-ninja-covers-w1-15.png`: the sweep's 25 Sep finding.
- `current/measurements-{shots,taps,idle,arrive,paging,area}.json`: the raw numbers.
- `current/scripts/`: the scripts that made all of this. Run them with `bun docs/map-design/current/scripts/map-audit.ts --only shots|taps|idle|arrive`; add `--base http://localhost:49xx` to point them at a frozen build.
