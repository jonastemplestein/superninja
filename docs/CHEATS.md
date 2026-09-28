# The cheat menu

A full-screen menu for grown-ups testing Super Ninja. It jumps to any level or screen, sets the mastery model (presets, the 44 sounds, each gem, words and stickers), moves time and the teacher's voice ledger, changes play settings, and exports, imports or resets saves. Jonas (27 Sep): "a way to open a cheat menu to jump to different sections… lots of ways to shortcut jump to places or modify mastery model". It is for grown-ups, so it uses plain text and doesn't try to look like the game.

## Opening and closing it

| How | Where it works |
|---|---|
| **Tap the top-right corner five times within 2.5 s.** The corner is 60 × 60 CSS px. | Everywhere. On a phone held sideways the corner is outside the game's letterboxed stage, so the taps land on bare background. Taps on a button or other control never count, so a child hammering a corner button (Hear it again, the map's gear) on a 16:9 screen can't open it. The first four taps go through to the game as usual. The fifth opens the menu and goes no further. |
| **The backquote key** (`` ` ``) | Toggles it, except while you are typing in a text field. |
| **`?cheat=1` in the address** | Opens it as the page loads, for example `/play/?scene=map&cheat=1`. |
| **`window.__snCheat(true)`** | From the console or a bot: `true` opens it, `false` closes it, no argument toggles it. |
| **Grown-ups → "Cheats"** | Waiting on a fix request: Grownups.tsx belongs to another lane (docs/fix-requests.md, "Cheat menu"). |

To close it: **Close ✕** (top right), **Escape**, or backquote. Every jump also closes it.

**The game waits while it is open**, as it does under the turn-your-phone picture (`holdGame` in CheatMenu.tsx): the line Sensei is saying stops, and is said again from its start when the menu closes; the next lines wait (`pauseSpeech`, audio.ts); sound effects are hushed; and lesson clocks stop (`pauseLessonClock`), so a cut lesson's budget doesn't run down. Three things keep going:
- A scene's own timers and animations: a battle's charge, the idle hints, CSS animations. They wait only for an upright phone or a confirm, and `src/cheat` can't set either.
- The music. Turn it off in the Play tab.
- The AudioContext. It isn't suspended, because audio.ts resumes it on every tap, including taps in the menu.

With the phone upright, the turn-your-phone picture already holds the speech, and it lets it go when the phone turns back. If the phone turns back while the menu is open, the menu holds the speech again straight away.

**Cost while closed:** two event listeners (`pointerdown` and `keydown`, each an O(1) check) in `src/cheat/gesture.ts`. There are no timers and no animation frames. The menu is its own chunk (`CheatMenu-*.js`, about 46 KB, plus about 9 KB of CSS). It is fetched on the first open, and its React root is unmounted on close. The one exception is the `__snState` overlay (Play tab). While it is on, it polls twice a second, and it stays on across reloads, which loads the chunk at start-up. It is off by default.

## How a jump works

1. **The save first.** A jump edits a copy of the save to give the screen what it needs (below). It then commits the copy through the store: one `store.set`, which every `useSave` sees, then `store.flush()`. The flush writes to localStorage at once and cancels the pending debounced write. Without it, the 200 ms timer or the `pagehide` flush could write an older copy over the edit. If there is no player yet (a fresh device), one called "Ninja" is created first, or the save would never be written.
2. **Module state** that a screen reads as it opens is set next: `visitFlower()` for a World Flower trip, `focusGem()` for the scroll, `makeTrial()`, `makePractice()`, `makeReview()`, `mapAnim.from` for the map walk, and `levelGains` / `levelNewWords` for a reward's gems and stickers.
3. **Then it goes.**
   - **In-app** (the default): through App's own `go()` (`window.__sn.go`). The sound stays unlocked. A jump to the screen already on show (a reward from a reward, the Sticker Book from the Sticker Book) first leaves it for an empty route, rendered at once (`flushSync`), and sets the module state only after that: App remounts some screens on every `go()` (the map, levels, the World Flower) but not others (`Reward` has no `key`), and those would keep what they read as they first opened. The address bar is set to the jump's deep link (`?level=w2-4`, `?scene=map`), so a reload replays it. The World Flower's petal detail needs `&gem=…&open=1` in the address as it opens; the menu puts that up for the jump and takes it down 1.2 s later.
   - **Reload** (the Jump tab's "Reload the page on jump" switch): loads the deep link as a new page. This also clears the in-memory caches that in-app jumps keep: the letters lines said this session, the reminder caps, the banked streak, a pending trip. Use it when testing the read-back reminders. The switch is remembered across reloads (`sn.cheat.reload`).

     **Some jumps always stay in-app**, even with the switch on. The switch's label says so, and while it is on these jumps are tagged **in-app** in the grid. A jump stays in-app when a page load can't give its screen what it needs (`inAppOnly` in jumps.ts):
     - It needs module state (`url: null`): the World Flower's trips, the scroll, the petal detail, the gem won or lost, the rewards with stickers or a glowing gem, and the map walk.
     - Its route has more in it than App's deep links carry (`survivesReload`). App reads only `?level=`, `?trial=`, `?practise=`, `?scene=<name>` and a reward's `id`, `stars` and `closing`. It doesn't read a map's land or intro, the opt-in's mode, or a World Flower celebration. So a map of any land but the next stone's stays in-app, and so do the four map intros (welcome back, super listener, practise again, after the first session) and the moving-up opt-in (its screen B).

     The next stone's own land, the trip-due map and the presets go to a plain `?scene=map`, which opens on that land anyway, so they do reload. Before 27 Sep they reloaded on `?scene=map` whatever the jump: the other lands landed on the next stone's land, the intros were lost, and the moving-up opt-in opened on screen A. `jumps.test.ts` now checks that every jump in the catalogue either lands on its own route after a reload or stays in-app. It also fails if App starts reading a new deep-link key, so that `survivesReload` can be widened to match.
   - **Always reload:** the film's shots, the ninja and nav demos, and speed changes. These read the address as the page loads.

Most jumps into the game also mark the player as in play: a hero (Kai if none), the film seen, Training and placement done, and no first session running. That means no cut lessons and no first check drop.

## The tabs

A status line at the top of each tab shows the player, the next stone (`frontier()`), the screen (`__snRoute`), the session number, how long since the last play, and the speed.

### Jump

- **How to go:** the reload switch (it names the jumps that always stay in-app, which are tagged **in-app** while it is on), the **gem** the World Flower jumps are about (every gem in play, with its state), and the **level** the reward jumps are for. When a jump can't be made from this save, tapping it shows why in a toast, and the menu stays open. Examples: the map walk needs a stone finished in the next stone's land; the practice dojo needs a gem with words to build; Jump ahead needs the conditions below.
- **Chip rows** (the level kinds, the teacher-voice forms) keep their size and scroll sideways when they don't fit (667 × 375, or 390 wide upright). A vertical swipe that starts on them still scrolls the menu, because they allow both pans.
- **Levels:** all 74 by land. Filter them by kind (ears, picread, firstsound, soundhunt, dojo, battle, boss, run, swap, story, sort). Each shows its stars and new spellings, and the next stone is outlined in gold. "Warm-ups play the preschool / Reception version" sets `band` (W or R) for warm-up jumps (`warmupScript` picks the version by band).
- **Start:** Get ready (install), Title, Who's playing?, the intro film and each of its 8 shots, Choose your ninja, the opt-in (a new child), the opt-in's moving-up question (sets `schoolYear` to R if unset, and `schoolYearAt` a year back), Training, Placement, and the picture parade.
- **First session:** lesson 1 as each opt-in answer leaves it: preschool; Reception in the autumn, spring or summer term (`startFor` with a date in that term); Year 1; Year 2. Each sets `schoolYear`, `band`, `firstSession {lessons, step 0}` and runs `placeAtUnit`. So school starts get the cut lesson and the first check. Also Reward 1 (the Sticker Book arrives: `seenBook` false), Reward 2 (the shiny fish-dog and the first petal: `fishdog` out of `shiny`, `s` out of `petals`, lesson 1's stickers moved to the end of `stickers` so the open book shows them; none is taken away), and the map after the first session ("Your Sticker Book lives here").
- **Map:** each land, welcome back, super listener, practise again, the walk to the next stone (`mapAnim.from`), a World Flower trip due (`tripDue`, so the flower pulses), and Sensei's Challenge.
- **World Flower** (for the chosen gem). A won gem stays won in every jump but three, which are about winning it: the Gem Trial, the practice dojo and the lost battle take it out of `gems` (their notes say so). The rest only make the gem met when it is hidden. The first visit (`seenFlower` false), a free look, a trip for a new spelling (the gem met, its `spelling:` trip forgotten), arriving in each land 2–6 (the `world:N` trip forgotten), back from practice (energy ¾, animated from ¼), the scroll, the petal detail, the gem-won celebration (the gem added to `gems`), a lost gem battle, the Gem Trial itself (energy full), and the practice dojo (when the gem has words to build).
- **Rewards** (for the chosen level): nothing new (its trophy); new stickers with gems filling past half (3 of the level's words read once and in the book, `levelNewWords`, and 2 gems with `levelGains` 3); a gem glowing (energy full, so the World Flower button shows). The gems are the level's that aren't won; only "a gem glows" un-wins one, and only when the level has none left to win; the land finished (its boss); a later warm-up's sticker reward; Reward 1 and 2; the finale.
  - **Reward with Jump ahead** opens the reward of the last level finished that isn't a warm-up. It sets the last three such levels to 3 stars, sessions to at least 3, and removes `jump-offer` from the ledger. Its note names that level. The warm-ups are skipped because a warm-up's reward is the sticker reward, which never offers Jump ahead. The game's rule is `shouldOfferJump` (engine/gems.ts): the last three levels with stars all at 3, a session past the second, the offer not made in the last two sessions, and a milestone that starts after the next stone.

    Two things can't be fixed by editing stars, and the button then says why in a toast instead of opening a reward with no Jump ahead:
    - Fewer than three levels finished after the warm-ups: a new child, "Warm-ups done", or a placed preset.
    - No milestone left after the next stone. Today's content stops at unit 12, so Jump ahead goes no further than w6-1, and every preset from the End of Reception on is past it.

    `offerHolds` is the same rule without its side effects, and `jumps.test.ts` checks it against `shouldOfferJump`.
- **Sticker Book:** as usual, or its first look (`seenBook` false).
- **Grown-ups and demos:** Grown-ups, NavDemo (`badges`, `ready`, `ready&first`, `ready&col`), and NinjaDemo (tiers 1–3, `strike`, `ready=bow`, `caption`).
- **Teacher voice:** pick a form, then a game (all 25 game types in `GAMES`). The menu writes that game's ledger entry (below) and jumps to the first level that plays it. A Gem Trial is used for `trial`, Sensei's Challenge for `review`, and the Reception warm-up for a game only its Reception version plays. Each game shows its form now.

### Mastery

- **Presets.** Each builds a whole save (`presetSave()` in actions.ts) and goes to its map. A "new child" goes to the title.

  | Preset | Next stone | Where the numbers come from |
  |---|---|---|
  | New child | w1-wu1 | A blank save that keeps the device's settings |
  | Warm-ups done | w1-2 | The six warm-ups; `schoolYear` none |
  | Middle of Reception | w4-1 | MILESTONES unit 7, `startLevelAfter(7)`; R |
  | End of Reception | w6-1 | MILESTONES unit 11; R |
  | Middle of Year 1 | w6-5 | Not in MILESTONES: /ae/ and /ee/ sorted; Y1 |
  | End of Year 1 | w6-11 | Every level but the last boss; Y1 |
  | End of Year 2 | (all done) | Every level, every gem won, the World Flower complete; Y2 |

  Today's content stops at unit 12, so MILESTONES' two unit-12 milestones would land on the same stone (w6-1). The presets spread them across the Sky Temple instead.

  **Played through** (the default) sets:
  - `stars`: 1 on each warm-up, 3 on every other level before the stone, with `warmups` scores.
  - `petals`: `knownSpellings()` of the last level finished.
  - Gems: the earlier units' gems won; the latest unit's charging (60%), and its first gem full, so a Gem Trial is waiting.
  - `read` / `spell` skills.
  - `words`: every word of the units played that uses only spellings met, read twice.
  - `stickers`: the warm-ups' pictures, then those words. `shiny` has the fish-dog after W2.
  - `flowerSeen`: every taught spelling's trip, and each land entered.
  - The ledger (`narr`): every game played told twice (its short form), the once-only explanations heard, and the two-letter reminders retired.
  - Other fields: `sessions`, `minutes`, `schoolYear` / `band`, the `seen*` flags, and one line in the grown-ups' `adjustLog`.

  **"As placed by the opt-in"** does what `placeAtUnit` does instead: `placedAt` the stone, the petals up to its unit, those gems half full, no stars, and nothing heard.
- **The 44 sounds**, drawn as their petals (`SoundBadge`; misty when not met). A tap cycles **not met → met → secure**:
  - not met: its spellings out of `petals`, its gems out of `gems`, energy and skills cleared.
  - met: spellings in, gems half full.
  - secure: every gem it can have won, so the petal is home.

  A sound the next stone has already taught stays met at least. The game works that out from the levels, not from `petals`, and the menu says so. Sounds with no spelling in the game yet are dashed ("not in the game").
- **Gems, per spelling**, grouped by sound and filled to their energy. A tap cycles **not found → charging (½) → glowing (full) → won**. A full gem only glows once there are three trial words the child can spell. Until then it shows as charging, and the menu says why.
- **All mastered:** every gem won and every spelling met. **Reset mastery:** `petals`, `gems`, `energy`, `read`, `spell` and `foundations` emptied; stars, words and stickers stay.
- **Words found:** per unit, all or none (read twice, with a word sticker; or the record and sticker removed), plus every word or none.
- **Stickers:** add the warm-up pictures, add every word met, empty the book, and switch the shiny fish-dog and moving-up star on or off.

### Time and voice

- **Sessions:** −1, +1, or 0, 1, 2, 3, 5, 10, 30. `sessions` goes up by one at each tap on the title's Start. The jump offer waits for session 3, and the forms and reminders are spaced in sessions.
- **Days since the last play:** today, 1, 7, 20, **22 (recaps)**, 30 or 60. Every timestamp moves back together, so the newest is that many days ago: the games' `lastAt`, the words' `last` / `met`, and the skills' `last`. Past 21 days (`GAME_REFRESH_MS`), every game told before plays its recap with the Ready hold, and the reading and spelling skills decay as they would.
- **Game introductions:** every game at once (first time, recap, or short), or per game: the struggled switch and full / recap / 22 d / short. Each row shows the form now (`frameForm`), how many times it was told, and when it was last played.
- **Dosage ledger:**
  - reset the letters reminders (`letters:*`, `two-sounds:*`)
  - reset the jump offer (`jump-offer`)
  - reset the other explanations (everything except the games, the reminders and the offer)
  - clear the whole ledger

  Every entry is listed with its count and sessions, and can be removed on its own.
- **Once-only screens:** switches for `seenIntro`, `seenTraining`, `seenPlacement`, `seenFlower`, `seenBook`, `seenTimer` and `seenStreak`. Also "Forget the World Flower trips" (`flowerSeen` emptied and `tripDue` cleared).

### Play

- **Speed:** 1×, 2×, 3×, 4× or 8×. Reloads this screen with `?fast=N` (`engine/fast.ts`, read as the page loads). "Reload this screen" does the same at the current speed. One-off levels (Gem Trials, practice, Sensei's Challenge) come back as the map.
- **Settings:** captions, music (0.32 or 0, applied live), relaxed mode (no timers) and unlock every level.
- **Streak:** 0, 3 (glow), 6 (super) or 10 (master), through `streak.set()`. The ninja powers up.
- **Hero:** Kai or Suki.
- **Live state:** a small readout at the top centre that never takes taps. It shows `__snRoute`, the streak, `__snNav` (Next and the presentation step) and `__snState`.

### Save

- **Export:** copy the current player's save to the clipboard, download it as `superninja-<name>-<date>.json`, or show the JSON.
- **Import:** paste into the box, or use "Paste from the clipboard". It takes a whole save, `{ "save": … }`, or a partial one such as `scripts/treadmill/bot.ts` `save()`, laid over a blank save as `loadSave` does. It is checked (JSON, an object, version 1, the right types) before "Import into <player>" is offered. A confirmation in the menu then replaces the save and reloads on the map.
- **Players:** switch (`profilesApi.select`, then reload on the title), or create one and switch to it.
- **Reset**, each with a confirmation in the menu (never `window.confirm`):
  - this player's progress (`store.reset()`; the player stays)
  - everything on this device: every player removed, every `superninja*` key and the install screen's `sn.setup` cleared, then a reload. The menu's own preferences (`sn.cheat.*`) stay.

## How it maps onto the save

| Control | Save fields | Ledger (`narr`) keys |
|---|---|---|
| Presets | everything below | `game:*`, `games:v1`, the once-only keys, `letters:*`, `two-sounds:th` |
| Sounds and gems | `petals`, `gems`, `energy`, `read`, `spell` | |
| Words and stickers | `words`, `stickers`, `shiny` | |
| Teacher voice, game introductions | | `game:<id>` = `{ n, at, s, lastAt, lastSession, struggled }`, and `games:v1` |
| Days away | `words[].last` / `met`, `read` / `spell[].last` | `game:<id>.lastAt` |
| Sessions | `sessions` | |
| Ledger resets | | `letters:*`, `two-sounds:*`, `jump-offer`, and the rest |
| Once-only screens | `seen*`, `flowerSeen`, `tripDue` | |
| Settings, hero | `settings.*`, `hero` (`captionsV2` is set too, so a reload keeps the captions) | |

The game forms are written so that `frameForm()` reads them back as that form (tested):

| Form | Entry |
|---|---|
| full | no entry |
| recap | 1 telling, in the last session, yesterday |
| recap-21 | 2 tellings, last played 22 days ago (with the Ready hold) |
| recap-struggled | 2 tellings, `struggled` (with the Ready hold) |
| short | 2 tellings, yesterday, in the last session |
| none | played this session: mid-level only, since a level opens on at least the short form |

The `games:v1` migration marker is always set with them. Otherwise narrate.tsx folds every game with stars back to its short form the next time it reads an old save.

## Things to know

- **No `aria-label` anywhere in the menu.** App's first check (`useFirstCheck`) reads the nearest `aria-label` of any tap as the child's answer. The dialog is labelled with `aria-labelledby` instead.
- **Kid-proofing:** main.tsx stops text selection and long-press menus on the whole page. The menu lets them through in its text fields only. Keys pressed in the menu never reach the game (a Dojo taps a tile for each letter typed).
- **The ghost click:** the menu opens on the fifth tap's `pointerdown`, so that touch's own click arrives a moment later, right on Close. A click in the corner in the first 600 ms is swallowed.
- **Not yet:**
  - The film's shots 2–8 start at shot 1 until IntroFilm reads `?shot=`.
  - Music off doesn't survive a reload until the saved volume is applied at start-up.
  - These two are in docs/fix-requests.md.
  - A scene's own timers and animations keep running under the open menu, as described above. Pausing them would need a pause flag that the scenes read, like the confirm's `useConfirmOpen`, which is outside this lane.
  - A map of a land other than the next stone's can't be reloaded: "Reload this screen" (Play tab) brings back the next stone's land. The fix would be App reading `?world=` and `?intro=`, as it reads `?level=`.

## Files and checks

- `src/cheat/gesture.ts`: the ways in (the only part in the main bundle), installed from `src/main.tsx`.
- `src/cheat/CheatMenu.tsx`: the menu (its own React root) and the state overlay.
- `src/cheat/actions.ts`: the pure save edits and `commit()`.
- `src/cheat/jumps.ts`: every jump, `runJump()`, and the deep links.
- `src/styles/cheat.css`: laid out for 844 × 390 first, and checked at 667 × 375 and 390 × 844 upright. It scrolls natively; tabs and buttons are at least 44 px high.
- Unit tests: `bun test src/cheat`.
  - `actions.test.ts` covers what each preset produces (petals, gems, words, stickers, trips, ledger) and each edit read back through the game's own rules.
  - `jumps.test.ts` covers the jumps. With reload on, every catalogue jump either lands on its own route or stays in-app. The 27 Sep wrong landings go through `go()` with their whole route. App's deep-link keys are pinned. "Reward with Jump ahead" gives a reward that the game's `shouldOfferJump` offers Jump ahead on, or says why it can't.
- The browser check: `bun playtest/cheat/verify.ts` against a frozen build on port 4901 (`bun scripts/treadmill/frozen.ts --port 4901 --out playtest/runs/cheat/.build --detach`). It checks, at 844 × 390 with touch:
  - the corner taps (four do nothing, five open it), and that the chunk loads lazily;
  - seven jumps and two presets;
  - the backquote key, Escape and `?cheat=1`;
  - a reload-mode jump and the overlay.

  Screenshots and the log are in `playtest/cheat/`.
- The 27 Sep fixes were checked on a frozen build on port 4921 (`--out playtest/runs/cheat/.build-fix`), with touch, at 844 × 390 and 667 × 375, plus 390 × 844 for the chip rows. The checks were:
  - every jump the verifier flagged, with reload on;
  - Jump ahead showing on a mid-Reception save and on an early one, and the toasts on "Warm-ups done" and End of Year 2;
  - the chip rows: sideways swipes, and vertical swipes that start on a row (with the old `pan-x` alone, the same swipe scrolls 0 px);
  - speech waiting while the menu is open.

  Screenshots are in `playtest/runs/cheat/fix-shots/` (git-ignored). The original `verify.ts` passes on the same build.
