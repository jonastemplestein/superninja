# Navigation: Home everywhere, hear it again, nothing moves on by itself

**Status:** the spec for implementation, written 26 September 2026 from an inventory of the code and a play-through at 844×390 (Playwright, `?fast=3`). Evidence: `playtest/nav-inventory/` (`logs/*.txt` per screen: what was on screen, said and tapped, sample by sample; `frames/*.png`; the probe `probe.ts` and the two targeted checks `verify.ts`).

**Jonas's asks (verbatim):**
- "need to make sure the home button is on any screen including tutorial. and it needs to not be possible to 'miss' something. should probs be back buttons or repeat etc in places"
- "and in general best not to autoplay to next step of a presentation etc"
- "in fact even the intro sequence should have buttons to go to next clip"
- "each petal has an image in the corner to illustrate the sound, because spelling sounds with letters can be confusing. I want that in the game."

---

## 1. The rules

Three words are used throughout:
- A **turn** is when the game waits for the child's answer (tap a picture, a tile, a chest, a lantern).
- A **show** is when Sensei shows or tells something and the child only watches: an explanation, a demo ("Let me show you!"), a film shot, a trip to the World Flower, a celebration.
- A show is made of **steps**. A step is one idea (at most about 12 s of speech) and ends on a still picture.

The rules:
1. **Home is on every screen** except the title (which is home), top-left, always on top and never covered.
2. **A step never moves on by itself.** When a step has finished, the screen holds and a big green Next arrow waits. Back and Hear it again are there too.
3. **A show may lead straight into a turn**, because the turn waits for the child. In that turn, **Hear it again** replays the question and anything explained with it, and, if a demo led into the turn, **Show me again** replays the demo.
4. **After a turn is answered**, its feedback plays and what comes next starts by itself, as now: the child's answer was the input.
5. **No timer ever moves on.** No auto-picks, no paw that answers for the child, no "if nobody taps in 4 s". Idle help escalates (a glow, the question again, the paw pointing) but waits.
6. **Next is dim and does nothing until the step has finished** (a tap on it gives a little wiggle). Back and Hear it again work at any time. Once a step has finished, Hear it again replays it with Next still green (the child has seen it; a tap on Next goes on at once).
7. **A level's closing line and its reward are one celebration.** The level hands over to its reward by itself (rule 4), and the reward's Hear it again starts with the level's closing line.

Praise ("Brilliant!"), streak lines and corrections are feedback, not instructions: they are not replayed. "Celebration lines" in the asks means the celebrations that are shows (rewards, the gem victory, lesson and level endings, the finale), and those are all replayable.

---

## 2. Inventory: how it is today

Played on the dev server at 844×390 (a landscape phone). "Home" means a Home button a child can actually tap. Every timer and every "when the line ends, go on" is listed.

### 2.1 Before the map

| Screen or moment (file) | Home | Way back | Replay | Moves on by itself today | A child could miss |
|---|---|---|---|---|---|
| Get ready, grown-ups (Setup.tsx) | no | n/a | nothing is said; Help is registered as a no-op | nothing | (grown-up page) |
| Title (App `Title`) | n/a (it is home) | n/a | Help says `help_start` | nothing (Start 500 ms after the tap is the child's input) | nothing |
| Who's playing? (Profiles.tsx) | no | n/a | Help only | 560 ms after a player is tapped (the child's input: fine) | nothing |
| New player, type a name (Profiles.tsx `NewPlayer`) | no | ◀ top-left, only when other players exist | `help_name` after an empty Go; not replayable | nothing | `help_name` |
| Intro film, 8 shots (IntroFilm.tsx) | **no** | **no** | **no**; Next (92 px, top-right) skips a shot at any moment; "Skip film" | **every shot**: the next starts when its video and line have both ended (`check()`); `setTimeout(next, 16000)` guard; the last shot → `onDone()` 600 ms after its line (logs/first-session.txt: 8 "AUTO" changes in 46 s) | every shot: the World Flower, "every petal was a sound", Baron's motive, the petals scattering. A tap on Next skips mid-line |
| Choose your ninja (App `Choose`) | no | no | `intro_8` is said once; Help says `help_choose` | `await say("chose"); await sleep(1200); onDone()` → the opt-in | "I am Sensei Maple. I will train you." |
| Opt-in A: "Do you go to big school yet?" (OptIn.tsx) | no | n/a | Help replays the question and labels; no speaker | a tap starts a 1.5 s settling ring, then it confirms (`SETTLE_MS`); 8 s: asks again; **20 s: the game picks "not yet" for the child** | the labels; the choice itself (the auto-pick) |
| Opt-in B: "Which class?" (OptIn.tsx) | no | **no way back to A** | as A | as A; 20 s picks Reception | as A |
| Opt-in confirm: the badge flies to the gear, "I've set up…", "Your grown-ups can change this later…" | no | no | no | `await say(lines); await flown; sleep(200); onDone()` → the welcome or the first lesson | the confirmation, and the grown-ups line |
| Opt-in, new school year (mode `newyear`) | no | no | as B | as B, 20 s picks "not sure" | as B |
| Dojo welcome: gong (Training.tsx) | **no** | no | Help says `tut_1` | nothing (the child taps the gong) | nothing |
| Dojo welcome: "Stuck? Tap me" | **no** | no | the Help tap is the answer | after the Help tap, `fm_help_ok`, then the speaker step | nothing |
| Dojo welcome: the speaker | **no** | no | the speaker is the answer | **`setTimeout(tapSpeaker, 9000)`: the paw taps it for the child**; then `sleep(250)` → Lesson 1 | the whole step, for a slow child |

### 2.2 The first session's lessons and rewards

| Screen or moment (file) | Home | Way back | Replay | Moves on by itself today | A child could miss |
|---|---|---|---|---|---|
| Warm-up W1 Ninja Ears (Warmup.tsx; beats in content/warmups.ts): hello and naming → tap (demo, then the child) → fast and slow (Sensei, 4 lines) → the child's tortoise and rabbit → notice ("sun and sock start with the same sound") → tap all that start with /s/ (naming, demo, the child) → done | yes (top-left, "map") | no | the speaker appears at the first question and **always replays the last question**, even during later shows: verified, during the fast/slow show it says "Tap the sock!" (`frames/w1-stale-speaker.png`) | every beat starts when the one before ends; the demos; idle: 8 s asks again, **16 s the paw answers for the child**; at the hard cap the child's turn lasts 7 s (`MIN_TURN_MS`), **then the paw finishes it**; done → Reward 1 | the naming, the demos, "Words are made of sounds!", the notice, and the child's own turn (the 16 s paw) |
| Reward 1, the Sticker Book arrives (Stickers.tsx `mode: "intro"`) | **no** | no | no | the whole 21 s sequence: the cards flip, the book swoops in, stickers land on each word, "Every picture you play with becomes a sticker!"; "Tap a sticker!" **gives up after 4 s** (`Promise.race([tapped, sleep(4000)])`); then the arrow holds (bounces harder at 10 s) | the book's introduction, the sticker tap |
| Warm-up W2 Ninjas Read This Way: the rail (Sensei reads, the fish-dog merges) → the child's rail → swap (◇) → which did I read (demo, the child) → sunflower (Sensei) → starfish (the child) → tap all (◇) → done | yes | no | as W1 (stale question) | as W1 | as W1 |
| Reward 2: six stickers, the shiny fish-dog, "they all start with /s/", the first petal (Stickers.tsx `mode: "open"`) | **no** | no | no | the whole sequence, **then straight to the map** (`if (p.then === "map") p.onNext()`, logs/first-session.txt at 241.7 s) | "This petal is for the sound… /s/", the child's very first sound |
| Map after the first session: "Your Sticker Book lives here, on the map!" | yes | ◀ ▶ worlds | no (Help says `help_map`) | nothing | that explanation (said once) |

### 2.3 Hubs and the World Flower

| Screen or moment (file) | Home | Way back | Replay | Moves on by itself today | A child could miss |
|---|---|---|---|---|---|
| Map (App `WorldMap`) | yes (→ title) | ◀ ▶ worlds | no; Help says `help_map` + `map_hint` | nothing (the ninja's walk is an animation) | "Welcome back", the land's line |
| Level reward (App `Reward`) | **no** | ↻ Play again | no; Help says `help_next` | nothing at the end (holds on Next). Nudges at 3 s (hand), 6 s (the ninja jumps, `help_next`), 14 s. **Next works before the speech ends** | the gem explanation ("Look, a gem! Each gem holds…"), `petal_got`, `world_done`, the rest nudge |
| Jump ahead (JumpAhead.tsx, a dialog) | under it | ◀ No thanks | Help says `jump_pick` | after a grown-up's press-and-hold, `setTimeout(map, 1200)` (a grown-up's choice: fine) | nothing |
| Sticker Book (Book.tsx) | yes ("back") | page ◀ ▶ | no; `fm_rw_book` said once, the first time | nothing | "This is your Sticker Book!" |
| Grown-ups (Grownups.tsx) | ◀ only | ◀ → **always the map**, even when the gear was held on the opt-in (a brand-new child lands on the map mid-first-session) | n/a | nothing | (grown-up page) |
| Picture parade (App `PicParade`, grown-ups) | ◀ only | ◀ → map | n/a | nothing | (grown-up page) |
| World Flower, free view: flower and petal chart (Tree.tsx) | yes ("back") | the flower ↔ chart button | no; `flower_tap` said on entry | the chart button pulses after 6 s; the scroll's own nudge (animation) | "Tap a petal to see its gems." |
| Petal panel (Tree.tsx `PetalDetail`, a dialog) | under the backdrop | ✓ close, or a tap on the backdrop | yes: the petal says its sound, Sensei's face replays her explanation, a speaker for the found words | the explanation 750 ms after opening; the practise invite | nothing |
| World Flower first visit, 6 steps (Intros.tsx `FlowerIntro`) | **covered by the overlay**: a tap on Home skips a step instead (verified, `frames/flower-intro-home-tap.png`) | no | no | **every step, 500 ms after its line** (`useSteps`); **a tap anywhere skips a step** | every step, and a toddler's stray tap skips one |
| Trip: new spellings found (Intros.tsx `GemFound`) | covered | no | Help says the beat again | **every beat, 250 or 450 ms after its line** (`useBeats`); a tap anywhere skips; the trip is marked seen when it *starts* (`markVisited`) | "It's two letters, but it's one sound", the example words, "Now you know two ways…" |
| Trip: a new land (Intros.tsx `WorldVisit`) | covered | no | Help | as GemFound | the sound re-explained, "New sounds are hiding in this land" |
| Gem victory (Tree.tsx `GemVictory`) | yes | no | Help replays the talk | the whole ~30 s on the music (build, burst, each talk beat 250 ms after the last, the petal flies home, `sleep(1500)`, `sleep(1100)`, 650 ms out) → Carry on | the explanation beats |
| Back from practice (Tree.tsx, `practisedScript`) | yes | no | no | beats start after 1.4 s and run on; then Carry on | "Your gem filled up…" |
| After a trip: Carry on (Tree.tsx) | yes | no | no | holds; hand at 3 s, `help_next` at 7 s | nothing |
| A Gem Trial lost (Battle.tsx → Tree.tsx with the petal panel open) | yes | the panel's ✓ | the panel's controls | "So close! Keep playing…" in the battle; the panel opens and says "Shall we practise…?" after 0.9 s; nothing moves on | nothing |
| Finale (Intro.tsx) | **no** | no | Next (top-right) only hushes the line | `finale` → the ninja celebrates → Baron appears → `baron_final` → `sleep(1200)` → the map | Baron's apology |
| Show Sensei, the placement quiz (Placement.tsx, from the grown-ups page) | **no** | no | yes, a speaker bottom-centre | the first miss → `finish()` → `place_done` and the celebration → `onDone()` → the map | "how far you got" |

### 2.4 Levels

Every level has Home top-left today (label "map"; a Gem Trial or practice goes back to the World Flower), and every level hands over to its reward by itself after its closing line and the ninja's celebration (`useFinish`, the `done` beat, `dojo_done`, `battle_win`, `run_end`, `story_end`): the closing line can't be heard again.

| Level type (file) | Replay today | Moves on by itself today | A child could miss |
|---|---|---|---|
| Warm-ups W3–W6 (Warmup.tsx) | as W1: the stale last question | as W1; W3's slow-word pick and tap-alls, W4's rails, W5's sounds, W6's dots all start from demos that play once | every "Let me show you!" |
| First sound, w1-2, w1-3, w1-10 (Early.tsx `FirstSoundLevel`) | the speaker replays the current item's question only | `first_intro` → items; the I do item's paw answers after 1.1 s (a demo: fine); each item after its feedback (fine) | `first_intro`, the I do demo, "We hear the sound. Now look: this is how we spell it" (said once per save) |
| Sound hunt, w1-7, w1-11 (Early.tsx `SoundHuntLevel`) | as above | `hunt_intro` + "The middle sound comes after the first sound…" → items | both lines (the middle one is said twice in all) |
| Early dojo, w1-4, w1-5 (Early.tsx `EarlyDojo`, `BuildOne`, `ReadCheck`) | "Hear the word" beside the card (the stretched word only) | "This is our dojo…" → "This word has two sounds!" → the ~20 s I do word ("Ninjas read this way! We start here…", said once) → we do → you do; the gem explanation after the first built word; "Who read it right?" | the dojo explanation, the I do, left to right, the gem, and **what Kai and Suki read** (it can't be heard again: tapping a reader answers) |
| Dojo, w2-1 on (Dojo.tsx `Learn`, `Find`, `Build`) | Learn: **no speaker after the spelling appears** (Help says a shorter recap; `frames/dojo-learn-no-replay.png`); Find: a speaker (the question); Build: "Hear the word" (the word) | Learn → Learn after the second tap; the welcome; the reveal; "Ninjas read this way!" (once per land), the neighbours explanation (once per unit), the gem (once) | the reveal explanation ("It's two letters, but it's one sound", protected from taps but not replayable), the welcome |
| Battle, boss, review, Gem Trial (Battle.tsx) | "Hear the word" beside the card, **disabled during the intro** | the intro lines (Baron's threat; `battle_start`; Baron's motive, once; a trial's "Your gem is ready…", once; the first timed trial's bar-and-hearts explanation, once) → the first word. A trial's monster charges on a timer (the trial's challenge; it waits while the phone is upright) | Baron's motive, the timer and hearts explanation |
| Sound Swap (Swap.tsx) | "Hear the target word" beside the card (does nothing while busy, so not during the intro) | `swap_start` + "This is… mat" → the first step; "Yes, the first sound changes!" (once per place) | what the game is (`swap_start`) |
| Sorting (Sort.tsx) | "Hear the word" top-right (the word only; nothing during the intro) | the ~17 s intro (Bridging line, "Sorting time!…", "This sound can be spelt in three ways", each chest hopping with its sound and "It's two letters…", `help_sort`) → the first word. The falling word is decoration (it stops above the chests) | the whole intro |
| Ninja Run (Run.tsx) | an ear button, blend mode only, **placed right next to Home** (x 110: an accidental Home tap ends the run; `frames/run-ear-beside-home.png`) | `run_start` + the cue → the first lantern; lanterns loop until caught (waits: fine) | "Ninja Run! Tap to jump, and catch the right word!" |
| Story (Story.tsx) | "Read it again" / "Read it to me" / "Hear the question" (right-hand column) | **the title → page 1 by itself**; Next page works mid-reading; idle star at the arrow at 6 s; no previous page | the title, a page skipped by an early tap, the special-word teaching ("This is 'the'. Just say 'the' here.") |
| Practice dojo from the World Flower (Early.tsx `BuildSequence`, practice) | as the early dojo | the level end → the World Flower's practised trip (rule 4) | as the early dojo |
| First check, one band down (App `useFirstCheck` → `onDrop`) | n/a | **after the third answer the level is swapped for a warm-up on the spot**, mid-item | the child is moved without warning |
| Unused: `ListenLevel` (Early.tsx) | | no level uses the `listen` kind | |

### 2.5 Overlays

- **Turn your phone** (ui.tsx `RotatePrompt`): covers everything, speaks, repeats. Exempt.
- **Crash screen** (ui/Crash.tsx): "Try again" and "Choose player". Exempt.
- **Baron's cut-in** (ui.tsx `VillainCutIn`, z 83): darkens the screen while he speaks, never takes taps. Home must stay above it.
- **Help** (bottom-right, every screen): the hint ladder. Unchanged, except on held steps (§3.2).

### 2.6 The worst findings

1. No Home before the map (setup, profiles, film, choose, opt-in, the welcome), on rewards, on the finale and on the placement quiz; on the World Flower's intro and trips Home is covered and a tap there skips a step.
2. The film, the opt-in (after 1.5 s, or after 20 s with no answer at all), Choose, the welcome's speaker (9 s), Reward 1's sticker (4 s), Reward 2 (to the map), the World Flower's intro and trips, the gem victory, the finale and the story's title all move on by themselves.
3. The warm-ups' speaker replays the previous question during Sensei's shows, and their 16 s paw takes the child's turn.
4. One-off explanations can't be heard again: the dojo's reveal, level intros (sorting, battles, the run), the gem explanation, what the readers read.

---

## 3. The pattern

### 3.1 The controls

| Control | Looks like | Size (stage px) | Where (stage coordinates, 1280×720) | `data-nav` / `aria-label` | When |
|---|---|---|---|---|---|
| **Home** | the house, gold | 100 | top-left: left 18, top 16 (the Home zone, x 0–130, y 0–130) | `home` / "Home" | every screen but the title; always on top |
| **Back** | ◀, gold | 100 | nav row, left: centre (404, 646), just right of the ninja zone | `back` / "Back" | held steps after the first (film shots, trips, story pages, the opt-in's class screen) |
| **Show me again** | the paw (the pointing hand the demos use), gold | 100 | nav row, left of Hear it again: centre (595, 646) | `show` / "Show me again" | turns a demo led into, until the game changes |
| **Hear it again** | the speaker, gold | 116 | nav row, centre: centre (725, 636) | `again` / "Hear it again" | whenever Sensei has said something the child needs (§3.5) |
| **Sound picture** | the sound's petal (§4) | 100 × 137 | nav row, right of Hear it again: centre (855, 630) | `sound` / "Hear the sound" | turns and steps about a sound |
| **Next** | ▶, green, pulsing | 132 | nav row, right: x 964–1096, y 562–694 (left of Sensei's Help zone) | `next` / "Next" | held steps; dim until the step has finished |

Every control is a round icon button (≥ 44 px on a phone: the smallest, `NAV_MIN` = 100 stage px, is 45 px at a stage scale of 0.45, a 360-dp-tall Android phone held landscape; 92 was only 43.3 px on an iPhone SE or mini and 41.4 px there), acts on finger-down (`tapProps`) and plays `sfx.tap`. Arrows point the way they go: ◀ back, ▶ on. ↻ ("Play again", a whole level) stays a different icon from the speaker ("say or show it again").

**Layout** (the nav row sits along the bottom of the play area, below Sensei's caption bubble, whose bottom edge is at y 562):

```
┌──────────────────────────────────────────────────────────────┐
│[⌂]  HOME ZONE x 0–130, y 0–130 (nothing else tappable)       │
│                                                              │
│              PLAY AREA  x 340–1110, y 80–556                 │
│                                                   caption ◢  │
│ ┌ NINJA ZONE ┐                                              │
│ │ x 0–330    │ [◀]   [paw] [spk] [petal]       [ ▶ ] ┌HELP┐│
│ │ y 380–720  │ 404    595  725   855           1030  │ ◉  ││
│ └────────────┘  ← nav row, y 562–700 →               └────┘│
└──────────────────────────────────────────────────────────────┘
```

**Anchors other than the nav row** (documented exceptions, each because the screen's own content owns the bottom strip):
- **Beside the word card** (`own`): the Early dojo's build, Dojo `Build`, Battle and Swap keep their speaker right of the word card, because the letter bank or the choices fill the bottom row. It is marked `data-nav="again"` and does what Hear it again does.
- **Top-right** (`top-right`: right 18, top 16): the World Flower, the Sticker Book, Sorting (its speaker is already there; the sound picture goes left of it) and the Ninja Run (the ear becomes a speaker in the top bar between the progress bar and the petal counter).
- **Right-hand column** (`column`, above Help, x 1148–1260): story pages (the text panel owns the bottom strip): ◀ at the top, the speaker below it, ▶ (or the ✓ "I read it!") at the bottom, as in today's `.st-side`.
- **The map** (`side`): Hear it again at the foot of the right-hand column (under the Sticker Book, the World Flower and Sensei's Challenge).

**Z-order:** the nav layer is z 84: above the effects (80, 81) and Baron's cut-in (83), below Help (85). Dialogs (the petal panel, Jump ahead) sit under it and register their own controls (`useNav` is a stack, §3.8), so the controls always belong to what is on top.

**The layout contract** (docs/HERO.md) gains the Home zone (nothing else tappable with its centre in x 0–130, y 0–130) and the nav row (on a held step the row's slots are reserved; on a turn only its speaker, paw and sound picture slots are). The sweep's `zone-conflict` check gets the Home zone.

### 3.2 Held steps and the idle nudge

When a step finishes (its speech has ended and its animation has settled), Next turns from dim to green and pops in, pulsing (1.3 s cycle). Then, with no tap anywhere:

| After | What happens |
|---|---|
| 0 s | Next pops in and pulses |
| 8 s | Next glows: a gold ring, a bigger bounce, and the pointing hand on it (its fingertip on the arrow, so it never sits on the sound picture to its left or the caption above) |
| 16 s | Sensei says **"Tap the arrow when you're ready!"** (new whole-sentence line `nav_ready`), and the ninja leaps and points a star at the arrow (`ninja.act("jump", nextEl)`, as the reward screen does now) |
| 40 s | `nav_ready` once more, then quiet. Nothing ever moves on |

Any tap resets the timer; a replay (Hear it again, Back) starts it again when the replay ends. The timers wait while the phone is held upright and while anyone is speaking. This replaces today's per-screen nudges: the reward's 3/6/14 s, Reward 1's 10 s hard bounce, the World Flower's 3 s/7 s, the story's 6 s.

Turns keep their own idle help, minus anything that moves on: warm-up and picture games glow and ask again at 8 s; at 16 s the paw **points at** the answer and waits (it used to answer); the Dojo, battles, sorting and the run keep their 8–10 s re-asks.

**Help on a held step:** the first press says the step again (as Hear it again); the second and later presses point at Next and say `nav_ready`.

### 3.3 Where Home lands

| Screen | Home goes to | So nothing is lost |
|---|---|---|
| Get ready (Setup) | the title | same as "No thanks, play here" |
| Who's playing?, New player | the title | |
| Intro film, Choose, the opt-in, the Dojo welcome | the title | Start → the player → `afterLaunch()` resumes: the film (not seen), the opt-in (a brand-new child), the welcome (`seenTraining` unset) |
| The first session's lessons and their Sticker Book rewards | the title | `firstSession` is kept, so Start resumes the lesson. Reward 1's Home first moves `firstSession.step` to 1 (Lesson 1 is done); Reward 2's Home does what its Next does (the first session is over) and lands on the map with its Sticker Book introduction |
| The map | the title | (as now) |
| A level | the map of its land | `streak.drop()` (as now) |
| A Gem Trial, a practice dojo | the World Flower | (as now) |
| A level's reward | the map of its land | the stars are saved already. A World Flower trip that was due stays due (`tripDue` in the save), and the map's World Flower button pulses until it is played |
| The World Flower (free view, a trip, the gem victory, the petal panel) | where the trip was going (`route.then`), else the map | an interrupted trip stays due: `markVisited` moves from the trip's start to its end |
| The Sticker Book, the placement quiz, the picture parade | the map | |
| Grown-ups | **the screen the gear was held on** (the map, or the opt-in, re-asked) | today it always goes to the map |
| The finale | the map (the Sky Temple) | |
| The title | (no Home: it is home) | |
| A dialog (Jump ahead, the petal panel) | Home stays on top and leaves the screen | the dialog's own ◀ or ✓ closes it |

### 3.4 Presentations: Back, Hear it again, Next

- **Next** goes to the next step, or leaves the show (the film → Choose; a trip → the World Flower, whose own Next then carries on; a reward → the next lesson or the map).
- **Back** goes to the previous step and plays it again from its start (its picture as it was then, and its speech). There is no Back on the first step.
- **Hear it again** on a step plays the step again: its speech and its animation (a film shot restarts its clip with its line in sync; a trip beat re-cracks its gem; a reward replays its lines with the gem focus).

### 3.5 What Hear it again replays

- **On a step:** the step (§3.4).
- **On a turn:** what Sensei has said since this turn (or its game) began that the child needs: the level's or game's introduction if this is its first turn, the naming of the pictures, the question, and any explanation said with it (for example "The last sound is at the end of the word", "Ninjas read this way!", a Sort's whole introduction on its first word). Not praise, streak lines or corrections. The scene registers the bundle explicitly (`useNav({ again })`); a warm-up beat builds it with a `told()` helper that both says a line and adds it to the bundle.
- **On a reward:** its whole speech, starting with the level's closing line (rule 7).
- **On a hub** (the map, the World Flower, the Sticker Book): the lines said on arrival.

It never replays an older question (today's warm-up bug).

### 3.6 Show me again

During a turn that a demo led into (the warm-ups' "Let me show you!", an I do item in the picture games, the I do word in the early dojo, Sensei's fast-and-slow or sunflower before the child's), Show me again plays the demo again: the scene puts the demo's pictures back if the turn uses others, runs the paw, the ninja and the speech, then puts the turn's pictures back and asks its question again. It never counts as the child's answer. A tap on an answer during the replay stops the replay and counts. The paw button goes away when the next game starts.

### 3.7 Timed games and the time governor

- A Gem Trial's charging monster pauses while Hear it again is playing (as it pauses while the phone is upright).
- The warm-ups' time governor (`skipOptional`, `overCap`) and the school paths' lesson clock (`useLessonClock`) don't count time spent at a held Next beyond 1.5 s, or time spent on replays. A child who replays never loses a beat for it.
- At a warm-up's hard cap the answers glow and the turn waits for the child's first tap (no 7 s limit); after that tap the paw may show what is left (a show), and the lesson closes.

### 3.8 The components: the API as built (26 Sep, `src/ui/nav.tsx`)

The shared pieces are in (§5.0 lists what is left). Try them at `/play/?scene=nav-demo` (src/scenes/NavDemo.tsx: a three-step show, a turn with the sound picture, a final hold; `&badges=1` shows all 44 sound pictures). `npx tsc -b` passes; the sweep's `nav-demo` case passes every nav invariant.

**Registering what the controls do** (`import { … } from "../ui/nav"`):

```ts
type Anchor = "row" | "column" | "top-right" | "side" | "own";
interface NavSpec {                       // undefined inherits from the entry below; null hides the control
  home?: (() => void) | null;             // where Home goes (default: NavLayer's `home`); null: no Home (the title)
  back?: (() => void) | null;
  again?: (() => unknown) | "told" | null; // Hear it again; "told": the screen's told() bundle, else the last instruction said
  againAt?: Anchor;                       // default "row"; "own": the scene draws its own speaker (data-nav="again") and SoundBadge
  againHint?: boolean;                    // the speaker pulses with the pointing hand (the Dojo welcome)
  show?: (() => unknown) | null;          // Show me again (the paw); must never count as an answer
  sound?: PhonemeId | null;               // the sound picture beside Hear it again (§4)
  next?: { go: () => void; ready: boolean } | null;  // dim until ready (a tap wiggles it), then green and pulsing
  pres?: { id: string; step: number; of: number } | null; // "this is a step of a show" (set by usePresentation/holdNext)
  modal?: boolean;                        // a dialog: nothing below shows through except Home
}
useNav(spec: NavSpec): void               // no deps: handlers are read when tapped. A stack: entries are ordered by first
                                          // render, so a dialog opened later is on top, and a component is under its children
useHome(go: (() => void) | null): void    // one line: where Home goes on this screen (= useNav({ home: go }))
```

**Hear it again's register** (§3.5). `say()` feeds it: every say() with an instruction in it (content/instructions.ts `isRegisterable`: not praise, streak lines, corrections, `nav_ready`, Help's `help_*` clues, the grown-ups gate or "Not yet!") becomes the screen's *last instruction* (engine/audio.ts `onSay`). A scene that wants a bundle (the level intro + the naming + the question) says it with `told()`:

```ts
told(items: Say | Say[], o?: { fresh?: boolean; keep?: boolean; reveal?: boolean; protect?: boolean }): Promise<boolean>
                                          // say it and add it to the bundle; fresh: start a new bundle (a new question)
clearTold(): void                         // a new turn: forget the bundle and the last instruction
replayTold(): Promise<boolean>            // say the bundle, else the last instruction (what again: "told" does)
hasTold(): boolean;  toldNow(): readonly Say[]
navAgain(): void                          // run the screen's current Hear it again (for an "own" speaker)
```

Both are cleared when the route changes (NavLayer's `scene`). Use `useNav({ again: "told" })` for turns; the button appears once something has been said.

**Shows** (§3.4):

```ts
interface Step {
  key: string;
  run(live: () => boolean): Promise<unknown> | void;  // play the step; resolve when finished; check live() after every await
  enter?(): void;                                     // put the picture back as the step starts (Back and replay use it)
  sound?: PhonemeId;                                  // the sound picture during this step
}
usePresentation(steps: Step[], o: {
  id: string;                             // "film", "flower-intro", …: for bots, the sweep and the log
  onDone: () => void;                     // Next on the last step
  againAt?: Anchor;
  help?: boolean;                         // default true: Help's 1st press replays the step, later presses point at Next
  noBack?: boolean;                       // a reward's steps
  start?: number;
  guardMs?: number;                       // a step that hasn't finished after this (game ms, default 30 000) gets Next anyway
  state?: false | ((i: number, ready: boolean) => Record<string, unknown>);
}): { i: number; ready: boolean; key: string; next(): void; back(): void; replay(): void; go(i: number): void }
```

It registers its own nav (Back from step 1, Hear it again = replay, Next, `pres`, the step's `sound`), never moves on by itself, hushes and cancels the running step (via `live()`) on Back, replay and Next, and publishes `window.__snState = { scene: "present", id, step, of, canNext, ...state?.(i, ready) }` (pass `state: false` if the screen publishes its own, or a function to add or override fields, e.g. `() => ({ scene: "film", shot: i })`).

```ts
holdNext(key: string, again?: (() => unknown) | null, o?: { sound?: PhonemeId }): Promise<boolean>
                                          // scripted players: a one-step show over the screen (modal); true on Next,
                                          // false if the screen was left meanwhile (stop there). Help: again, then point
dropHolds(): void                         // NavLayer calls it when the route changes
```

**The pieces** (NavLayer draws them from the stack; a scene may also use them directly, e.g. with `againAt: "own"`):

```tsx
<NavLayer home={homeFor(route)} scene={routeKey} />   // once, in App after <HelpButton/>; publishes window.__snNav
<HomeButton onHome />                     // house, gold, 100 (NAV_MIN), top-left (left 18, top 16), z 88; data-nav="home", "Home"
<BackButton onBack />                     // ◀ gold 100; data-nav="back", "Back"
<ReplayButton onReplay? hint? size=116 /> // speaker; data-nav="again", "Hear it again"; default onReplay = replayTold
<ShowAgainButton onShow size=96 />        // paw; data-nav="show", "Show me again"
<NextArrow ready onNext size=132 nudge=true />  // ▶; data-nav="next", "Next"; the idle nudge is built in
<TopBar>{progress, hearts…}</TopBar>      // .topbar that keeps clear of the Home zone (padding-left 110)
NAV_SLOTS, slotStyle(slot, w?, h?)        // the stage positions of §3.1 (row, column, top-right, side, home), for a
                                          // scene's own buttons in unused slots (a reward's Play again in NAV_SLOTS.row.back)
nudgeNext(): void                         // point at the ready Next now (glow, nav_ready, the ninja's star)
navLog(e): void                           // window.__snNavLog
```

- **The idle nudge** lives in `NextArrow` (so a Next outside the layer has it too): after 8 s of game time with no tap, the gold glow, a bigger bounce and the pointing hand (on the arrow, fingertip at its centre); at 16 s `nav_ready` and the ninja's star at the arrow (`ninja.act("jump", next, { react: false })`); at 40 s `nav_ready` once more; then quiet. Any pointerdown or key restarts it; it doesn't count while anyone speaks or the phone is upright.
- **Lesson clocks** (engine/lessonClock.ts): `pauseLessonClock()`, `resumeLessonClock()` (they nest), `lessonPausedMs()` (real ms, ×FAST for game time). `NextArrow` pauses them while it is held ready beyond 1.5 s; `ReplayButton` and `ShowAgainButton` pause them until their replay has been said. `useLessonClock` subtracts the paused time; the warm-ups' governor should subtract `lessonPausedMs() - atStart` too (group C).
- **For bots and the sweep:** `window.__snNav = { home, back, again, againAt, show, sound, next: null | "wait" | "ready", pres }` on every layer render; `window.__snNavLog.push({ t, kind: "tap" | "step" | "replay", nav?, id?, from?, to?, via? })` on every nav tap and step change (`to: null`: the show ended; a story's page changes are logged as `id: "story"` with `via`: "next", "back", "read" (I read it!), "pick" (a choice) or "answer" (its question)); `window.__snRoute` = `route.name` (+ `:id`), set by App.
- **Icons** (ui.tsx): `Icon.paw`, `Icon.again` (↻). `RoundButton` takes `nav` (sets `data-nav`). `pushHelp(fn)` is useHelp outside a component.
- **Styles:** `src/styles/nav.css` (imported by nav.tsx): the Home and nav-row controls, `.nav-next.dim` / `.ready` / `.glow` / `.wiggle`, `.topbar.nav-topbar`, and the sound badge.
- **Line:** `nav_ready` "Tap the arrow when you're ready!" (content/lines.ts, "Navigation" block), recorded as one whole sentence (judge 10/10) and linted (Jev: no findings).

---

## 4. Sound pictures

A sound is shown to children as its **petal**, never as letters: the teardrop in its chart colour with the chart picture (`public/a/i/petal_<id>.webp`; content/flower.ts `CHART_PETALS` has the colour, `icon` and `iconWord`). Spellings (gems, tiles, chests) still show letters: that is the point.

**`SoundBadge`** (`src/ui/SoundBadge.tsx`, built): `<SoundBadge p="s" size={96} onTap? pulse? still? speaker? label? className? style? />`; `size` is the width, the height is `badgeHeight(size)` (1.375×). `onTap` *replaces* the default tap (which says the pure sound); `still` draws a picture only (no button, no speaker, e.g. in a caption); `speaker` defaults to on from 64 px.
- The teardrop (round top, point down, as on the chart and the scroll) filled with the chart colour mixed 82% with white, a 9 px chart-colour stroke over a 15 px ink stroke (today's `.pd-petal` look), the picture in the round part (60% of the width), and a small speaker in the point.
- A tap says the pure sound (`say({ sound: p })`). It swells for 300 ms every time its sound clip plays (`onClip("sound:<p>")`), so the picture and the sound arrive together.
- `aria-label` "Hear the sound", `data-nav="sound"`, `data-p`. No letters anywhere on it (grown-ups get `/ae/` as a `title` tooltip only).
- `teardrop()` moves from Tree.tsx to `src/ui/petal.ts` (Tree re-exports it) so scenes don't import the World Flower. *Built:* `src/ui/petal.ts` has `teardrop`, `teardropAt`, `mix`, `petalImg(p)` and `petalColour(p)` (the chart colour; the ink-dark /or/ painted bronze, as on the flower). Tree.tsx still has its own copies: group B switches it to import them.

**Where it goes:**

| Where | What |
|---|---|
| First-sound prompts ("Which one starts with… /m/?", Early.tsx `FirstSoundLevel`) and their "Can you find… /m/?" tile phase | the sound picture beside Hear it again (nav row), from the question on |
| Sound-hunt prompts ("Which one has this sound in the middle… /i/?", `SoundHuntLevel`) | the same |
| Warm-up "Listen to the very first sound" (the `notice` beat) and "Tap all the pictures that start with… /s/" / "…with /a/ in them" (`tapall`) | the same, from the first time the sound is said; it stays through the turn |
| Dojo `Learn` (a new sound) | **the ear becomes the sound picture** (230 px, centre): tap it to hear the sound; when the spell lands, the spelling tile appears beside it, and both stay: the sound's petal next to how we spell it |
| Dojo `Find` ("Can you find… /b/?") and the placement quiz's sound, gap and find-all rounds | beside Hear it again |
| Sorting (every chest is a spelling of one sound) | in the top bar, left of the speaker |
| The petal panel's header (Tree.tsx `PetalDetail`) | today's inline petal becomes `<SoundBadge size={200}>` (it already leads with the picture and no letters) |
| The World Flower's first visit ("This is the petal for the sound… /a/", `FlowerIntro`) and a new land's recap head (`WorldVisit`) | `SoundBadge` in place of the outline with a picture in its corner, and of the bare picture |
| The petal chart scroll (`ScrollPetal`) | the picture sits in the petal's top-right corner, like the school chart, 64 px (was 52), on every met petal; unmet petals keep the mist |
| The World Flower (`WorldFlower`) | every met petal (light > 0) shows its picture near its round tip, upright (counter-rotated), at 55% of the petal's width; unmet petals stay pale ghosts, or in the mist |
| Captions (a grown-ups' setting) | a sound is drawn as a 34 px petal picture instead of "/ae/" or 🔊 (the caption becomes text parts plus sound parts; engine/audio.ts and `SenseiDock`) |

The gem victory, the trips and Reward 2's first petal already show the whole petal with its picture (`BigPetal`, `WorldFlower`).

**Pictures a 3-year-old may not read as the sound** (logged in docs/DECISIONS.md; the art is being reviewed separately): /s/ a red circle (said "ball" or "red"; the chart's word "circle" spells /s/ with < c >), /h/ a speech bubble with a question mark ("who"), /m/ a thumbs-up ("thumb" starts with /th/; a child says "good"), /i/ a building block ("build"; a child says "block"), /o/ a wasp (said "bee"), /u/ a red heart ("love"; said "heart"), /ue/ a newspaper ("news"; said "paper"), /k/ an anchor (an unknown word, and it starts with /a/), /v/ a dove (said "bird"), /zh/ a treasure chest (said "box"). The first petal a child ever sees (Reward 2) is /s/, the least clear of all. Found on the badge wall (`?scene=nav-demo&badges=1`): **/uu/ ("book") is drawn as a rubber duck**, a /u/ word, so it shows the wrong sound; and /s/ and /b/ ("ball") are both a plain red disc.

---

## 5. Change list by file

Shared work comes first (one agent); then groups A to D can run in parallel. Every group keeps the layout contract (Help bottom-right, the ninja bottom-left, the new Home zone), British English, and `npx tsc -b` passing. Nothing in `src/core` changes.

### 5.0 Shared (first)

**Done (26 Sep):** `src/ui/nav.tsx`, `src/ui/SoundBadge.tsx`, `src/ui/petal.ts`, `src/styles/nav.css`, `Icon.paw` / `Icon.again` / `RoundButton nav` / `pushHelp` in ui.tsx, the lesson clock's pause, `onSay` in engine/audio.ts, `content/instructions.ts`, the `nav_ready` line (recorded), App's `__snRoute`, `useFirstCheck` ignoring `[data-nav]` taps, and an **inert** `<NavLayer scene=… />` (no `home` yet, so it draws nothing until a screen registers), the `nav-demo` scene, bot.ts's Next rule, and the sweep's three invariants (§6.1–6.3, with the `nav-demo` case). **Done later (26 Sep):** narrate.tsx's held gem explanation (`explainGemEnergy` holds on `holdNext("gem-energy")` with the gem up and its sound picture; Hear it again pops the gem, fills it and says `audit_gem_first` again; the Ninja Run's world stops while it holds; Gem Trials never explain gems), and App's shell work. **Left** from this list: `PLAY`/`PLAY_CX` in ui.tsx, captions as parts in audio.ts. (Originally left: App's shell work below (`homeFor`, `afterLaunch`, `returnTo`, the first check's held drop, `closing`, and removing every scene's own top-left Home together with passing `home={homeFor(route)}`, which switches the layer's Home on everywhere at once), now done.


- **`src/ui/nav.tsx`** (new): `NavLayer`, `useNav`, `usePresentation`, `holdNext`, the idle nudge, `__snNav` and `__snNavLog` (§3.8).
- **`src/ui/SoundBadge.tsx`** (new) and **`src/ui/petal.ts`** (new: `teardrop`, `teardropAt` moved from Tree.tsx) (§4).
- **`src/styles/nav.css`** (new) (§3.1, §3.8).
- **`src/ui/ui.tsx`**: `Icon.paw`, `Icon.again`; `RoundButton` `nav` prop; export `PLAY_CX` and the play area (`PLAY`) from here (Early.tsx re-exports them).
- **`src/engine/lessonClock.ts`**: `pauseLessonClock()` / `resumeLessonClock()`; `useLessonClock` subtracts paused time.
- **`src/engine/audio.ts`**: captions as parts (`{ text } | { sound: p }`) so `SenseiDock` can draw a sound as its petal picture; unchanged otherwise.
- **`src/content/lines.ts`**: `nav_ready` "Tap the arrow when you're ready!"; record it (`bun scripts/gen-audio.ts`).
- **`src/scenes/narrate.tsx`**: `explainGemEnergy()` becomes a held step: the gem stays up, Hear it again says `audit_gem_first` again, and it resolves on Next (`holdNext("gem-energy")`), then the gem goes. `readThisWay()` returns the lines it said, so the scene can add them to the turn's bundle.
- **`src/App.tsx`, the shell**:
  - render `<NavLayer home={homeFor(route)} />` after `<HelpButton />`;
  - `homeFor(route)` per §3.3 (levels keep `streak.drop()`; a trial or practice goes to the tree; a first-session lesson or reward goes to the title, with Reward 1 moving `firstSession.step` to 1 first; grown-ups go to `returnTo`);
  - `afterLaunch()`: a brand-new child (`brandNew()`) goes to the opt-in, and a child with a first session but no `seenTraining` to the welcome, before `nextInSession()`;
  - Grown-ups remembers the route it was opened from (`returnTo`);
  - `useFirstCheck` ignores taps on `[data-nav]` targets (today it only skips labels starting "Help", "Hear it again", "Hear the word", "map", "Grown-ups");
  - the first check's band drop waits for the item boundary (the next time the scene publishes a new `next`), then shows a held step over the level ("Let's do some warm-up training first!", `fm_warm_up`) whose Next starts the warm-up;
  - `window.__snRoute = route.name + (id)` in `go()`, for the sweep;
  - the reward route takes `closing?: string` (the level's closing line, from `onDone(stars, { closing })`); `LevelProps.onDone` gets the optional second argument;
  - every scene's own top-left Home button goes (the nav layer draws Home); `.topbar` gets `padding-left: 110px` so progress bars and hearts keep clear of the Home zone.

### 5.A Training, OptIn, Placement, Profiles, Setup, Grownups, JumpAhead

- **Training.tsx**
  - Remove the 9 s auto-tap (`useEffect` with `setTimeout(() => void tapSpeaker(), 9000)`). The speaker step waits: 8 s says `fm_speaker` again with the speaker glowing; the hand already points at it.
  - The step's own "Hear it again" `RoundButton` goes: `useNav({ again: tapSpeaker, againHint: true })` on the speaker step (the nav row's speaker is where it is in every lesson, so the welcome teaches the real button).
  - `useNav({ again: say(the step's line), back })`: gong `tut_1`; Help `fm_help_short`; Back from the Help step to the gong and from the speaker step to the Help step (the step plays again).
  - Every step asks again when left alone, at 8 s and 20 s (`tut_1`, `fm_help_short`, `fm_speaker`), waiting for Sensei to be quiet; nothing taps for the child.
  - After the speaker tap the first lesson starts by itself (rule 4: the tap was the answer). Home → the title.
- **OptIn.tsx**
  - A tap **selects** a card: it says the card's label, the gold ring draws round it and stays (no `SETTLE_MS` timer; `SettleRing` becomes a static ring). Tapping another card moves the selection.
  - `useNav({ next: { ready: !!selected, go: () => selected === "school" ? toClasses() : confirm(selected) }, again: say the question and each label with its spotlight, back })`.
  - Remove the 20 s auto-pick from `startIdle()`; keep the 8 s "Teddy, or school? Tap one!" (and the bob), and ask once more at 20 s. `silent` in `OptInResult` goes (App's `applyOptIn` stops reading it, and the `fm_opt_default_*` lines leave the opt-in).
  - Screen B gets Back to A (`mode === "new"` only).
  - `confirm()`: after the badge has flown and the lines are said, `await holdNext("optin-confirm", sayConfirmLines)` before `onDone()`.
  - `__snState`: `selected` instead of `settling`; `next` stays the first card's label for bots.
  - Home → the title (nothing is saved until the confirm).
- **Placement.tsx**
  - Its speaker button goes: `useNav({ again: () => ask(), sound })`, with `sound` the round's sound for `sound`, `gap` and `findall` rounds.
  - `finish()`: after `place_done` and the celebration, `await holdNext("place-done", () => say(place_done))`, then `onDone()`.
  - Home → the map.
- **Profiles.tsx**: Home → the title (nav layer). `NewPlayer`'s ◀ moves from the top-left (the Home zone) to the nav row's Back (to the player list). After `help_name`, `useNav({ again: () => say help_name })`.
- **Setup.tsx**: Home → `finish()` (= "play here"). Nothing else (a grown-up page).
- **Grownups.tsx**: remove the top-bar ◀ (the nav layer's Home goes to `returnTo`); the "Grown-ups" heading stays in the top bar.
- **JumpAhead.tsx**: mark it a dialog (`role="dialog" data-modal`); `useNav({ again: () => say jump_pick })` with no Next, so the reward's Next is hidden while it is open; keep its own ◀ "No thanks".

### 5.B IntroFilm, Intros, Tree, Book, Stickers, App (title, choose, map, reward), Intro (the finale)

- **IntroFilm.tsx**: rebuild on `usePresentation`, one step per shot.
  - A step: set the shot's video, play it from 0, start its line on the video's clock at its delay (as now); ready when the video has **ended** (the last frame holds) and the line is done, or when the video can't play (then the line alone).
  - Remove `check()` → `next()` and the 16 s `guard` that advanced; keep a 16 s guard that only marks the step ready if a video stalls.
  - Back: the previous shot from its start. Hear it again: this shot from its start, clip and line in sync. Next (dim until ready) → the next shot; on shot 8 → `onDone()`.
  - Remove the top-right Next; keep "Skip film" for grown-ups (top-right, `data-grownups`), as **press and hold** for a second (a short tap shows "Grown-ups: press and hold"), so a stray tap from a 3-year-old can't lose the whole story.
  - Help: the first press says the shot's line again; then it points at Next.
  - `heard("baron-motive")` stays as it is (only lines heard in full count).
  - `__snState = { scene: "film", shot }`. Home → the title.
- **Intros.tsx**
  - `useSteps` and `useBeats` go; `FlowerIntro`, `GemFound` and `WorldVisit` use `usePresentation`. Remove the timers that advance (`setTimeout(… setStep(step + 1), 500)`, `setTimeout(… setI(i + 1), 250 | 450)`, `setTimeout(finish, 400)`), the overlay-wide `{...tapProps(next)}` and the local top-right Next buttons.
  - Each beat's picture must replay from its index (for Back and Hear it again): `GemFound` keeps a snapshot of `clear`, `shown`, `lit` and `words` as each beat first starts, and its `enter()` restores it before re-running the beat's `onStart`; `WorldVisit`'s `enter()` clears its timers, flash, focus and words (most of `onStart` already does).
  - Drop `data-modal` from `.intro-overlay` (a show, not a dialog: Home stays reachable on top).
  - `FlowerIntro` steps 1–4: `<SoundBadge p="a" size={260}>` instead of the outline with `petal_a` in its corner. `WorldVisit`'s recap head: `SoundBadge` instead of the bare picture.
- **Tree.tsx**
  - Remove the top-left Home (`.topbar`); App's `homeFor` uses `route.then ?? map` (today's `onBack`).
  - Free view: `useNav({ again: () => say flower_tap, againAt: "top-right" })`.
  - `markVisited(visit)` moves from the trip's start to `endTrip()`.
  - The practised trip: its `practisedScript` beats become held steps; `setStep("done")` after the last Next.
  - After a trip ("done"): the Carry on button, its 3 s hand and 7 s `help_next` go; the nav layer's Next (ready at once) goes where Carry on went (`onBack`). Bots and the sweep keep reading `done`.
  - `GemVictory`: step 0 is the music: the build, the flight and the bloom (ready at the 7.2 s mark, where the talk begins today); steps 1…n are the talk beats (`beats.slice(1)`), each held. The `petal-home` step runs `homecoming()` and then holds (no fixed `sleep(1500)`). Next on the last step plays the 650 ms exit, then `onDone`. Back to the previous talk beat (its words and lit gems restored); Hear it again on step 0 says "You won the gem!…" again without restarting the music.
  - `PetalDetail`: the header becomes `<SoundBadge size={200}>`; `useNav({ again: replay, againAt: "own" })` with Sensei's face button marked `data-nav="again"`.
  - `ScrollPetal`: the picture 64 px in the top-right corner of every met petal (§4). `WorldFlower`: the picture near the round tip of every met petal (§4).
- **Book.tsx**: remove the top-bar Home; `useNav({ again: () => say(seenBook ? "help_book" : "fm_rw_book"), againAt: "top-right" })`.
- **Stickers.tsx** (`StickerReward`)
  - Reward 1 (`intro`): step 1 = the cards flip, the book comes and opens, the stickers land on their words, "Every picture you play with becomes a sticker!" (one idea, ~12 s). It leads into the turn "Tap a sticker!", which **waits for the tap** (remove the `sleep(4000)` race; 8 s: the sticker wiggles harder and `fm_rw_tap` again; 16 s: the paw points). After the tap and its word the book tucks away and the last step holds: `fm_rw_next`, Next → Lesson 2.
  - Reward 2 (`open`): step 1 = the stickers, the shiny fish-dog, "They all start with… /s/"; step 2 = the book flies off and the first petal shines ("This petal is for the sound… /s/"). Both held; Back from step 2 to step 1. **Remove `if (p.then === "map") p.onNext()`**: Next on step 2 goes to the map.
  - Later rewards (`short`): the "+N" step, held.
  - Each step's `enter()` resets what it animates (`landed`, `flipped`, `bookState`, `flower`, `plus`), so Back and Hear it again replay it.
  - The `.st-next` block and its 10 s hard bounce go (the nav layer's Next); "Play again" (↻, a warm-up replayed from the map) appears with the last step's Next, in the Back slot of the nav row (a reward has no Back). The sweep ends a level case when it sees it, as now.
  - Hear it again includes the lesson's closing line first (rule 7).
- **App.tsx**
  - `Title`: publish `__snState = { scene: "title" }`.
  - `Choose`: a tap picks (the ninja powers up, "Great choice!…"); `choose()` no longer calls `onDone`: `useNav({ again: () => say intro_8 (and "chose" once picked), next: { ready: !!picked, go: onDone } })`. The cards shrink to 400 px high (top 132) to clear the nav row. Publish `{ scene: "choose", picked }`. Home → the title.
  - `WorldMap`: remove the top-left Home (the nav layer's, → the title, label "Home"); `useNav({ again: () => say(the lines said on arrival), againAt: "side" })`; the World Flower button pulses while `tripDue` is set.
  - `Reward`: `useNav({ again: replay the speech (the closing line first, then as now, with the gem focus), next: { ready: talked, go: () => onNext(isFinale) } })`. The `.reward-buttons` row goes: Play again takes the nav row's Back slot (404), Jump ahead (when offered) the Show me again slot (595) and "Go to the World Flower" (when a gem is ready) the sound picture slot (855), all three unused on a reward. Remove the 3/6/14 s nudges (the nav layer's). Home → the map of the land (`tripDue` kept).
  - `PicParade`: remove the top-bar ◀ (Home → the map).
- **Intro.tsx** (the finale): two steps on `usePresentation`: (1) the bloom, `finale`, the ninja's power-up and celebration; (2) Baron appears, `baron_final`, the confetti and the cheer. Next on step 2 → `onDone()` (the map). Remove `sleep(1200); onDone()` and the top-right Next that only hushed. Home → the map.

### 5.C Early.tsx and the warm-ups

- **Early.tsx**
  - `ListenLevel`, `FirstSoundLevel`, `SoundHuntLevel`, `EarlyDojo`: remove the top-bar Home.
  - `PickItem` gets `sound?: PhonemeId` (first-sound items and their find items: the target sound; sound-hunt items: the middle sound; listening items: none).
  - `usePickGame`
    - Register `useNav({ again: () => say(bundle), show, sound: item.sound })` for the current item. `bundle` = the level's introduction (first item only: `first_intro`, or `hunt_intro` and the middle-place line when said), the naming lines said for this item, and the question.
    - `show` (Show me again) is set after an I do item and lasts through that sound's we do and you do items: it puts the I do item's pictures back, plays its prompt, the paw's tap and its teaching (`onRight`, including "We hear the sound. Now look: this is how we spell it" when it was said), then restores the current item and asks its question again. Busy while it plays; an answer tap stops it.
    - Keep the you do glow at 8 s. Add the paw pointing (not answering) at 16 s.
    - The `PickBoard` speaker button goes (the nav layer draws it).
  - `BuildSequence` / `BuildOne`
    - The first word's I do (with "This is our dojo…", "This word has two sounds!" and "Ninjas read this way!" when said) is one show that leads into the we do turn; `show` replays it on the same word (the slots empty, the demo runs, then they empty again and the first slot is asked again).
    - The turn's `again` = the word, the slot question and the stretched word, plus "The last sound is at the end of the word" when it was said for this word. "Hear the word" beside the card stays, marked `data-nav="again"` (anchor `own`: the letter bank fills the bottom row).
    - The gem explanation after the first built word holds (narrate.tsx).
  - `ReadCheck` / `ReadOne`: once the readers have read, `useNav({ again })` plays `read_who` and both readers again, each lighting up as it reads (today it can't be heard again). Before that, `again` = `read_intro` and `read_tap_sounds`.
  - `useFinish(onDone)` takes an optional `closing` line and passes it on (today's early levels end on the ninja's celebration alone, so they pass none).
- **Warmup.tsx** (and content/warmups.ts)
  - Remove `view.speaker` and the `.wu-speaker` button; register `useNav({ again, show, sound })`.
  - **The bundle:** a `told(say)` helper says a line and adds it to `bundle.current`; beats use it for naming, questions and explanations ("Listen to the very first sound.", "Did you notice?…", "Words are made of sounds!") and plain `say()` for feedback. `bundle.current` resets when a beat begins and at each hold. This fixes the stale "Tap the sock!".
  - **Show me again:** each beat with a demo stores `lastShow.current`, a function that puts the demo's view back (`patch`), runs the demo (the paw, the ninja, the lines), then puts the turn's view back and asks again: `tap` (its `demo`), `slowpick` (its `demo`), `tapall` (its `demo`), `which` (its `demo`), `sounds` and `dots` (their `demo`), and Sensei's `fastslow`, `rail` and `compound` for the child's beat that follows. It clears when a beat starts that isn't the child's half of the same game.
  - **Holds:** in the director loop, before beat i, `if (endsWithShow(prev) && startsWithShow(b)) await holdNext(\`${script.key}:${i}\`, replayPrev)`. `hello` and `name` never end a step (they lead into the next beat). Shows that end a step: Sensei's `fastslow`, `notice`, Sensei's `rail`, `swap`, Sensei's `compound`. Beats that start with a show: `tap` or `slowpick` with a demo, `tapall` (it names its new pictures first), `which` with a demo, Sensei's `rail`, `fastslow` and `compound`, `notice`, `swap`, `sounds`, `dots`. Today's scripts get two holds: W1 notice → tap all, and W2 swap → which did I read (W2's swap is optional; when the governor skips it, there is no hold). W3–W6 get none.
  - **Idle** (`startIdle`): 8 s glow and ask again (as now); 16 s the paw points at the answer and waits (`pawAnswer` no longer resolves the turn); after that the question every 12 s, three times, then quiet.
  - **The cap** (`capTurn`, `pawClose`): no `MIN_TURN_MS`; the answer glows at once and the turn waits for the child's first tap; after that tap the paw may finish what is left ("Here's the last one!"), and the lesson closes.
  - **The governor:** `elapsedS()` subtracts the nav layer's paused time (holds beyond 1.5 s, replays).
  - `__snState` gains `capped` (the sweep's `auto-advance` check needs it, §6.3).
  - The `done` beat hands its line to the reward (`onDone(1, { closing: b.line })`); no hold.
  - The sound picture: from the `notice` beat's first /s/, and a `tapall`'s question on, through its turn.
  - content/warmups.ts: re-measure W1 and W2 `secs` with the bot once the holds are in (about +2 s each).

### 5.D Dojo, Battle, Swap, Sort, Run, Story

- **Dojo.tsx**
  - Remove the top-bar Home (the progress bar stays).
  - `Learn`: the ear button becomes `<SoundBadge p={p} size={230}>` (a tap says the sound; not while the spell is on its way). When the spell lands, the spelling tile appears beside it, and both stay. `useNav({ again: () => say(full) })`, where `full` is the whole teaching as said (the welcome if said, "Listen…" and the sound twice, "And this is how we spell it…", the same-sound or two-letters line, "Tap it, and say it with me!"). Help keeps the shorter recap.
  - `Find`: its speaker button goes; `useNav({ again: prompt (and "Tap the speaker to hear the sound again." if it was said), sound: p })`.
  - `Build`: "Hear the word" stays beside the card (`data-nav="again"`); its bundle adds "Ninjas read this way!…" and the neighbours explanation when they were said for this word.
  - `onDone(stars, { closing: "dojo_done" })`.
- **Battle.tsx**
  - Remove the top-bar Home (the hearts stay).
  - The intro lines (Baron's threat, `battle_start` or `challenge_start`, Baron's motive, a trial's explanation, the timer and hearts explanation with its bar, the neighbours reminder) join the first word's bundle: "Hear the word" beside the card works once the intro has finished and, for the first word, plays the intro again (the bar refills while the timer lines are said), then the word; later words, the word.
  - A Gem Trial's charge pauses while a replay plays.
  - `onDone(stars, { closing: boss ? undefined : "battle_win" })` (a boss's "You beat the boss!" is already the reward's first line, so it isn't passed twice).
- **Swap.tsx**
  - Remove the top-bar Home.
  - The first step's bundle: `swap_start`, "This is… mat", then the question (`swap_make`, the stretched pair, `what_changed`); "Hear the target word" beside the card plays it once the intro has finished (today it does nothing while busy). A place line ("Yes, the first sound changes!") joins its step's bundle.
- **Sort.tsx**
  - Remove the top-bar Home; "Hear the word" stays top-right (`data-nav="again"`).
  - The introduction is the first word's bundle: Hear it again on the first word replays it, with each chest hopping as its sound is said, then the word.
  - The sort's `SoundBadge` in the top bar, left of the speaker.
  - The gem explanation holds (narrate.tsx).
- **Run.tsx**
  - Remove the top-bar Home.
  - The ear ("Hear the sounds again") becomes the speaker and moves into the top bar between the progress bar and the petal counter (x ≈ 1000–1092), out of the Home zone; it is there in both modes. Bundle: `run_start` and the cue for the first lantern, then the cue and the lantern's sounds (blend mode) or the word's cue (read mode).
  - The gem explanation holds; `run_end` → the reward's closing.
- **Story.tsx**
  - Remove the top-bar Home.
  - The title is a held step (`story_start` and the title read); Next → page 1 (remove the `setPageId(first)` after the line).
  - A page history stack: Back (◀, new, top of the `.st-side` column) → the previous page, read again. It never undoes a miss.
  - Next ("Next page", now "Next") is dim until the page has been read; the page's `usePageIdle` goes (the nav layer's nudge, keeping the ninja's star at the arrow as its 16 s moment).
  - A read page's Hear it again ("Read it to me") includes the special-word teaching when it was said on this page.
  - Nav anchor: `column` (the text panel owns the bottom strip). Choice and question pages are turns: "Hear the question" is marked `data-nav="again"`.
  - `onDone(stars, { closing: "story_end" })`.

### 5.E Scripts

**Done (26 Sep):** bot.ts's first rule (below, plus: while "Play again" shows, it leaves Next alone, because the harness ends the case there; it also taps Next for `__snState = { scene: "present", canNext: true }`); the sweep's input and change log, the three invariants (§6.1–6.3) and their severities, and the `nav-demo` case. **Done later (26 Sep):** the tree / practise / trial case changes (Home and Next; bot.ts's dead "Carry on" rule is gone), the `intro`, `choose` and `finale` cases (played on Next until the child leaves: `leave`), the Home-landing cases (§6.1 table, as `home-*`: a real Home tap after 5 s; `home-grownups` is left out, it needs the gear's hold), `--nav` (§6.2), `idle-next` (§6.4), the bot's Choose rule and its patience in the picture games (it answers once `busy` is false, so the sweep sees those turns wait), transcript.ts (nav taps as "TAP Next", holds as "[holds on Next: step, 1.2 s]", and navlog-<persona>.json) and first-minutes.ts (Next on every held step after the persona's think time; a "Holds on Next" column). **Done (27 Sep):** transcript.ts also plays the shows (the film, Choose, the opt-in, a sticker reward and a level reward, the World Flower's first visit and three trips, the finale: `leave` or `done`), and the Ninja Run's bot taps are in its tap log (`__snRun()` returns `flew`). **Left:** the card-box check against `[data-nav]`.


- **scripts/treadmill/bot.ts** (`step()`): first,
  ```ts
  const nav = await page.evaluate(() => (window as any).__snNav ?? null);
  if (nav?.next === "ready") return down('[data-nav="next"]');   // a held step: the child has watched it; go on
  if (nav?.pres && nav.next === "wait") return;                   // a step is still playing: watch
  ```
  then the scene-specific rules. New or changed: `choose` (tap "kai" when `!picked`), the opt-in (tap the wanted card when `selected` differs; Next is then ready), the film (nothing: Next when ready), `place-done` (Next). The tree cases keep ending on `done` before the bot would tap it.
- **scripts/treadmill/sweep.ts**: the invariants in §6; the `INTENT` texts for `optin` ("A tap selects; Next confirms"), `tree-*` ("each step holds on Next"), `stickers`; the `tree-home` case taps "Home" (was "back") and the `practise`, `trial` and `tree-practise-tap` cases tap "Next" (was "Carry on"); the warm-ups' card-box check measures against `[data-nav="again"], [data-nav="show"], [data-nav="sound"]` instead of `.wu-speaker`; new Home cases (§6.1); a `--nav` mode (§6.2).
- **scripts/treadmill/transcript.ts**: record nav taps ("TAP Next", "TAP Hear it again") and write each hold as a line (`[holds: Next, 1.2 s]`), so the explanation audit sees where a child sat.
- **scripts/treadmill/first-minutes.ts**: the film taps Next on each shot when ready (after the persona's think time); Choose taps Kai, then Next; the opt-in selects, then Next, then Next after the confirm; each piece's table gets a "holds" column; the budgets stay game time with holds shown apart (the governor's clock doesn't count them).

### 5.F Docs

- **docs/HERO.md**: the layout contract gains the Home zone, the nav row and the documented anchors (§3.1).
- **docs/FIRST_MINUTES.md**: an amendment at the top: the film and every show hold on Next; the opt-in selects then confirms with Next (no settling ring timer, no auto-pick); the welcome's speaker waits; the 16 s paw points and waits; at the cap the child's turn waits for a tap; Rewards 1 and 2 hold per step. The timings table gets the holds.
- **docs/TREADMILL.md**: the new invariants and `--nav`.
- **docs/DECISIONS.md**: the rows for this spec (added with it).

---

## 6. Sweep invariants

All three run in every sweep, on every case, in `pageChecks` or the case loop. The sweep adds an init script that records child input: `window.__snInput.push({ t, nav: el.closest("[data-nav]")?.dataset.nav ?? null, label })` on every `pointerdown` (capture phase), next to `__audioLog`. Game time is real time × `FAST`.

### 6.1 `home-missing` (major; blocker in the first-session cases)

On every frame check, unless the screen is exempt (`.scene.title`, the turn-your-phone overlay, the crash screen, `?scene=ninja-demo`, or the first 600 ms after a route change while `.fullscreen-fade` runs):
- exactly one visible `[data-nav="home"]`, at least 44 × 44 px on screen, with its centre in the Home zone (stage x ≤ 130, y ≤ 130);
- `document.elementFromPoint()` at its centre is the button or inside it (today the World Flower's intro overlay fails this).

Findings: `home-missing` (none), `home-covered` (detail: what covers it), `home-misplaced`, `home-duplicate`. The sweep's `zone-conflict` check also flags any other tap target whose centre is in the Home zone.

**Where Home lands:** new cases each tap Home with a real tap (the existing `after` mechanism) and check the landing scene (`__snRoute` and `__snState.scene`), exactly one scene on the stage, and nothing left speaking:

| Case | Expect |
|---|---|
| `home-film` (`?scene=intro`), `home-choose`, `home-optin`, `home-training`, `home-w1` (a first-session save in Lesson 1) | `title` |
| `home-reward` (after `w1-6`), `home-book`, `home-placement`, `home-finale` | `map` |
| `home-trip` (`?scene=tree&visit=world:3`, tapped mid-trip) | `map`, and the trip is still due on the next visit |
| `home-trial` (`?trial=ai>ae`, mid-word) | `tree` |
| `home-grownups` from the opt-in | `optin` |

### 6.2 `no-replay-for-instruction` (major)

The sweep tracks, per **position** (the route, plus `__snNav.pres` id and step, plus `__snState.next`), which Sensei lines have played (`__audioLog` speech entries for `/a/l/<id>.mp3`) that are instructions: any Sensei line except praise (`pickPraise` ids), streak lines (`streak_*`), corrections (`thats`, `listen_again`, `its_this_one`, `fm_its_this`, `nearly` and the listen leads) and `nav_ready`. When at least one instruction has played in the current position, nothing is speaking (no `.help-btn.talking`, no caption) for 1 s of game time, and the screen is waiting (`__snNav.next === "ready"`, or `__snState.next` set and not `busy`), there must be a visible, uncovered `[data-nav="again"]`. Finding: `no-replay-for-instruction`, detail: the line's text and the position.

With `--nav` (every case, slower), the bot also taps Hear it again once in each new position before answering or tapping Next, and checks:
- `replay-silent` (major): no speech clip within 2 s of game time;
- `replay-stale` (major): the first clip it plays was not among this position's instruction clips (today's warm-up bug would fail here);
- `show-again-broken` (major): where `__snNav.show` is set, a tap on `[data-nav="show"]` must play a line and leave `__snState.next` unchanged (it never answers).

### 6.3 `auto-advance` (major; blocker in the first-session cases)

The sweep compares each tick's position with the last and requires an input for each change:
- **A step change** (`__snNav.pres` id or step changes, or a presentation ends): there must be a `next`, `back` or `home` input since the step started. Anything else (a timer, "when the line ends") is `auto-advance`, detail: from → to.
- **A turn that ends without the child** (`__snState.next` was set with `busy` false, then changes or the route changes, with no child input since): `auto-answer` (the paw answering, an auto-pick, a timeout).
- **A route change** must follow a child input on the old route, and when the old route was a show (the film, Choose, the opt-in confirm, a reward, a sticker reward, the World Flower after a trip, the finale, the placement's end, a story's title) that input must be `next` or `home`. Allowed without a nav input, because the child's last answer was the input (rule 4): a level → its reward, the World Flower or the next lesson in the first session; the map → a level (a stone tap); Who's playing? → the film or the map; the title → Who's playing?; Get ready → the title; the welcome → Lesson 1 after the speaker tap.
- Exempt: route changes the grown-ups made (Jump ahead's press-and-hold, the grown-ups page's reload), and the paw finishing a warm-up after the cap once the child has tapped (`__snState.capped` and a child input since the cap).

### 6.x As built (26 Sep, scripts/treadmill/sweep.ts)

- An init script records `window.__snInput` (every pointerdown, capture phase: `{ t, nav, label, grown, dialog }`) and `window.__snTrack` (every change of `__snRoute`, of `__snState`'s scene/next/busy/capped, and of `__snNav.pres`), all on `performance.now()`. The sweep reads both before each bot move.
- `home-*`: in `pageChecks` (every frame check); the Home zone joins `zone-conflict`.
- `no-replay-for-instruction`: a speech clip `/a/l/<id>.mp3` with `isInstruction(id)` (content/instructions.ts) started in this position (or up to 2.5 s of game time before it began); the screen waits; no `.bubble` or `.help-btn.talking` for 1 s of game time. On each screen's first three waits the bot holds back (at most 3 s real) until that quiet comes, so a quick bot can't slip past the check; one finding per screen and case.
- `auto-advance` for routes: exempt when either route is `grownups` or `setup`, or when the last tap before the change was inside `[data-grownups]`, a dialog (Jump ahead), or on the grown-ups gear. The shows are `intro`, `choose`, `optin`, `reward`, `finale`, `placement`, and `tree` → `map`; they may be left by `next`, `home` or `back`, or the buttons "Play again", "Go to the World Flower" and "Skip film".
- `auto-answer`: a turn opens when `next` is set with `busy` false and ends when `next` changes; it needs a tap other than Hear it again, Show me again or the sound picture in between (or, after `capped`, any tap since the cap).
- `--nav` (§6.2, opt-in, slower): in each new waiting position (Next ready, or a turn not busy, quiet for 1 s of game time) the sweep taps the first visible, uncovered, not-dim `[data-nav="again"]` with a real tap, then `[data-nav="show"]` if there is one. `replay-silent`: no speech clip of any kind (a line, a word, a story page) within 2 s of game time. `replay-stale`: none of the Sensei lines the replay said was among the instruction lines said since this question began (a new route or step, or a new question: a warm-up's `beat`, the `word` being built or spelt, a sort's word `i`, else the answer; a busy flip or the next letter of the same word doesn't count; or up to 2.5 s before), so a replay of an older question is caught while a bundle that also repeats the game's introduction passes. When a navigation check fails, the case folder gets `navtrack.json` (every input, every tracked change, every speech clip) as evidence. `show-again-broken`: nothing said, or the turn (`__snState` scene/next) changed.
- `idle-next` (§6.4) and the `leave` / `stopAfterMs` case fields are as specified; `after.expect` is the landing's `__snState.scene`, or its route when it publishes none (the title).
- Before any screen is migrated, a sweep reports `home-missing` and a Home-zone `zone-conflict` on every case, `no-replay-for-instruction` on the warm-ups, the Dojo, the map and the sticker reward, and `auto-advance` for the opt-in and the World Flower's exits (checked on w1-wu1, w2-1, optin, training, map, tree-found, tree-home). A negative test (Next advanced by `click()` with no pointerdown) is caught as `auto-advance` on the demo.

### 6.4 `idle-nudge` (minor)

New case `idle-next` (`?scene=intro`): the bot does not tap for 20 s of game time once the first shot is ready. By 18 s `nav_ready` must have played, Next must still be the only way on, and the shot must not have changed.

### 6.5 Severity and the inbox

Add to `SEV`: `home-missing`, `home-covered`, `home-misplaced`, `home-duplicate`, `no-replay-for-instruction`, `replay-silent`, `replay-stale`, `show-again-broken`, `auto-advance`, `auto-answer`: major (blocker for `home-*` and `auto-*` in the first-session cases, `optin*`, `training` and `home-film`); `idle-nudge`: minor.

---

## 7. What it costs, and what to watch

- **The first five minutes get longer by the child's taps on Next:** 8 film shots, Choose, the opt-in (its choice, then its confirmation), W1's one hold, Reward 1's first step, W2's one hold, Reward 2's two steps: about 16 new taps. At the bot's 1.2 s think time that is about +19 s, less the opt-in's 1.5 s settling and Choose's 1.2 s pause, which go: about +16 s from the title to the map (4:32 → about 4:48, under the 5:00 cap; Reception's first session was already over it). The film no longer runs past a child who isn't watching, which is the point.
- **Lesson clocks don't count holds** beyond 1.5 s, so the warm-ups' optional beats and the caps behave as measured; re-measure `secs` for W1 and W2 after the change.
- **Next is dim until a step ends**, so a grown-up re-watching the film holds "Skip film", and a child who knows the story still hears each page once.
- **The sound pictures** go into prompts before the art review; some (/s/, /m/, /i/, /o/, /u/) show something a 3-year-old names with a different sound (§4). If the review is slow, the first-sound games could show the badge only from Reception on.
