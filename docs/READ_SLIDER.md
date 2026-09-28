# The read slider

27 September 2026. The mechanic behind picture reading v2 (docs/PICTURE_READING.md) and "say the sounds with me". Code: `src/ui/ReadSlider.tsx`, `src/styles/read-slider.css`; tests: `src/ui/read-slider.test.ts`; the compound bank: `src/content/compounds.ts`; the harness: `playtest/read-slider/`. The research behind it is docs/read-slider/research.md (§3 prior art, §5.4 the rules).

> Jonas, 27 Sep: "one thing that you could ask the user to do is drag their finger from left to right rather than from right to left. And as they go under a sound or a word, it says that word … If you go from right to left, it says, no, that's not the right way. You always go from left to right. And then we can have this sort of interface also with sounds where you slide across and the sensei says, say the sounds with me."

It replaces the reading rail's "punch each card" (the ninja ran to each picture and back, a back-and-forth). Reading is now **one continuous sweep, left to right**, under the child's own finger.

---

## 1. The short version

- A bamboo rail runs under the pictures (or under the sound dots of one picture). **The tortoise is the handle.** It sits on a glowing start dot at the rail's left end, with a gold arrow at the right end pointing on.
- The child puts a finger on the tortoise and slides it right. **As the tortoise reaches each part, the part lights and is said once**: a picture's name ("rain… bow"), or a pure sound (/m/ /o/ /p/). That is the **slow way**.
- **The voice sets the pace, not the finger.** A clip is never cut off and never overlaps the next: the next part waits for the last clip's end plus a gap (300 ms between words, 250 ms between sounds), and the tortoise waits just before it, with an elastic band stretching to the finger. A flick still reads every part, in order, with the gaps.
- At the end the **rabbit** wakes. The child taps it and hears the whole word: the **fast way** ("rainbow"). The cards bloom into the whole picture.
- **The wrong way never reads.** A sweep to the left gets one of three gentle lines ("That way is backwards. We always read from left to right."), the tortoise pops back onto the start dot (it never walks left), the dot pulses and a light runs along the rail from left to right.
- **Sensei's paw** can drive it slowly (demo mode), including her backwards gag ("bow… rain… Bow rain! It's raining bows!"), which only she ever does. It is her own red panda's paw, out of her portrait; the cream glove is only ever the ghost hand, "your turn".

---

## 2. The screen

Stage px (1280×720). On an 844×390 phone the stage is scaled by 0.49 (height-bound, less the Stage's touch insets: 354 / 720), so 100 stage px is 49 CSS px.

```
 ┌────────────────────────────────────────────────────────────────────┐
 │                                                                    │
 │                ┌─────────┐   ┌─────────┐                            │  words: two cards of 220 (three of 170,
 │                │  rain   │   │   bow   │                            │  more of 130), 40 apart, over the rail
 │                └─────────┘   └─────────┘                            │
 │   (ninja)    ●[tortoise]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━▶  (rabbit) │  the rail: x 400–985, y 460
 │              ░░░░░░░░░░ touch band x 336–1004, y 112–540 ░░         │  the rabbit: x 1060, y 416, 124 across
 │                                                            (?)     │
 └────────────────────────────────────────────────────────────────────┘
```

| Part | Size and place | Notes |
|---|---|---|
| **The tortoise** (handle) | 140 × 92 stage px (**69 CSS px** wide on the phone, measured in the harness; the brief asks for ≥ 64) | `ui_tortoise`, facing right. A breathing gold halo while it waits for the child. A test checks the size |
| **The start dot** | 68 px, centred on x 400 | breathes while the child's turn waits; pulses (three beats) on every hint and every wrong way |
| **The arrow** | a gold brush arrow at the rail's right end | pulses (slides right three times) with the start dot |
| **The trail** | a gold fill inside the rail, `scaleX` from the left | follows the tortoise |
| **The chevrons** | faint right-pointing marks along the rail | always there: the rail says which way |
| **The cards** (words) | on their plates (`PIC_PLATES`), 95 px above the rail | a reading light under each; lit = lifted 10 px, gold glow |
| **The sound dots** (sounds) | 78 px, spread over x 545–885, on the rail; the picture (230 px) above | a dot lights gold on its sound; at the fast word the dots draw together |
| **The rabbit** | 124 px at x 1060, y 416 | asleep (small, faded) until the slow way is done; clear of the Help button (x > 1116, y > 556) and a two-line caption |
| **The touch band** | x 336–1004, y 112–540 (328 × 210 CSS px) | the cards and the rail. **Only x matters**, so a wobbly finger that drifts up or down still counts. Above the nav row (y 562) and right of the ninja zone (x < 330) |

---

## 3. The rules

The rules are a pure class, `SlideCore` (no DOM, no audio): a finger's x and the game time in, events out. `read-slider.test.ts` tests them.

| Case | What happens |
|---|---|
| **Start** | A read starts with a touch in the **start zone**: the tortoise, the dot, and into the first card (up to 60% of it for words, 20% of the first dot for sounds). |
| **The high-water mark** | The tortoise is at the finger's **furthest** point so far (`hw`). It only grows during a read, so moving back never un-reads or re-reads anything. It moves only once the finger has moved right 14 px (`TAP_PX`): a tap, even on the tortoise's right half, moves nothing. |
| **A part fires** | when the voice is free and the tortoise reaches it: 35% into a card, 30% into a sound dot. Its light comes on **as its clip starts** (`nextClip`), not as the finger passes. |
| **The ratchet** | While a clip plays, and for the gap after it (`WORD_GAP_MS` 300, `SLOW_GAP_MS` 250), the next part waits. The tortoise is held **16 px before the next card** (26 px before a dot); an elastic band stretches from it to the finger. When the clip and gap end, the tortoise glides on to the finger (a 240 ms spring), and the next part fires if the finger is past it. |
| **A flick** | A slide from the first part to the end in under 450 ms (`FLICK_MS`). Every part still reads, in order, with its gaps. It is counted; after three flicks in a session, Sensei says `rs_slowly` once ("The tortoise likes to go slowly. Try it slowly, like me."), if the scene asks for it (`coachSpeed`). |
| **The slow way is done** | when every part has fired, the last clip and gap have ended, and the finger has either lifted or passed the last part. A finger resting on the last card keeps it open. |
| **A wobble** | Moving left less than 100 px (`BACK_PX`, 49 CSS px) from the tortoise is a wobble: nothing happens. |
| **Lifting part-way** | What was read is kept. A touch within 120 px (`CARRY_PX`) of the tortoise carries on. A touch back on the start dot (when the tortoise is well past it and the voice is free) starts a fresh read. See the idle ladder (§6) for a slide left unfinished. |
| **Only the first finger** | A second finger is ignored until the first lifts. One exception: a touch that holds nothing (a palm resting on the cards) gives way to a finger that takes the tortoise (`wouldGrab`, `cancelDown`), so a resting hand never silently blocks the read. |

### 3.1 The wrong way

Two ways to go the wrong way:
- **Backwards**: a right-to-left swipe of 100 px or more before anything has been read. That covers a touch that starts right of the tortoise, and also one that starts **on the tortoise or on the first card**: those take the tortoise, and a leftward sweep from them used to get no correction, only a silent `drop` on the lift (the judge, 27 Sep). It is checked from the finger's furthest point (`d.max`), as for a touch that holds nothing (`SlideCore.pointerMove`; the unit test "a swipe to the left that starts on the tortoise, or on the first card…", and a CDP touch run on the harness: `rs_back_1`, nothing read, the turn back to waiting). A leftward wobble of less than 100 px on the tortoise, then the right way, still reads everything.
- **Reversed**: the tortoise, part-way through a read, pulled back: the finger 100 px or more left of **where it last held the tortoise** (`down.anchor`: the tortoise's position whenever the finger was with it, within 24 px, or ahead of it). Measured from the tortoise, not from the finger's furthest point: a finger that ran ahead on the elastic band and comes back towards the waiting tortoise is not pulling it back, and nor is the tortoise catching up past a finger that came back (the judge, 27 Sep: 960 → 760 with the tortoise waiting at 726 was taken for a pull, and the read thrown away).

Then:
1. **Nothing more is read.** A clip already playing finishes (never cut off); the correction waits for it.
2. The lights go out. The tortoise **pops out where it is and pops in on the start dot** with a puff (190 ms out, 340 ms in). It never walks or glides left, so the only movement the child sees along the rail is left to right.
3. The start dot pulses, the arrow pulses, and a light sweeps the rail from left to right (900 ms).
4. The ninja does its think pose (not a strike, not a buzzer, never red, never "No": TEACHER_SCRIPT §2.4 rule 11).
5. Sensei says one of three lines, in turn across the session (the save's first one says "left to right"):
   - `rs_back_1` "That way is backwards. We always read from left to right."
   - `rs_back_2` "Let's try again from the tortoise. Ninjas always start on this side." (re-worded 27 Sep: the judge heard the old order, the rule first, as stern: 3.4/5, and 3 of 8 said a child would feel told off)
   - `rs_back_3` "The tortoise only walks this way. Start here, and slide it along."
6. The turn opens again (the ghost hand shows the slide once). `onWrongWay(n)` tells the scene how many this turn.

The brief's suggested wording, "Oops! That's the wrong way. We always go from left to right. Let's start here, on the left.", was split into these three so that a child who does it twice doesn't hear the same line twice, and so that none says "left" twice or uses "wrong" (a 3-year-old doesn't know left from right, and "this side" comes with the dot and the arrow pulsing). Decided and noted in §11.

### 3.2 Taps, starts in the middle, and the rabbit

| Case | What happens |
|---|---|
| **A tap on the tortoise** (less than 14 px of movement in under 450 ms), either half | It bounces, the dot and the arrow pulse, and the ghost hand shows the slide. Nothing is read and nothing moves. The turn goes back to waiting (`drop`: the phase returns to `idle`), so the halo breathes again and the idle ladder runs (the judge, 27 Sep: a tap left it in `sliding`, with no ghost hand at 8 s and no `rs_idle` at 16 s). A press held with no drag is the same. |
| **Taps on the cards, in order** | A tap on the next card in order counts as the tortoise reaching it (`tapPart`): a fallback for a child who can't drag yet. A card out of order: the dot pulses. (Words only; the first card is inside the start zone, so only a tap on the tortoise itself counts as a tap on the tortoise.) |
| **A start in the middle** (a touch right of the tortoise that moves right 60 px) | Nothing is read. The tortoise wiggles, the dot pulses and the ghost hand shows the slide. The second time in a turn Sensei says `rs_start_here` "Let's start on this side. Put your finger on the tortoise." (re-worded 27 Sep from "Ninjas start on this side…", which the judge heard as stern: 3.1/5) |
| **A slide while Sensei is still talking** | **Every** part the child reads cuts her off (as the rabbit's tap does), so a part is never said over her line: the first one, and one after a pause (the judge, 27 Sep: a child resuming during "Keep going, all the way to the rabbit." put /o/ and /p/ over it, because only the first part hushed her and sound slices play beside her). The tortoise tapped while the rabbit waits (the slow way again) cuts her off too. |
| **The rabbit before its time** | It wiggles. |
| **The rabbit when awake** | The rabbit hops, Sensei is cut off (the child's answer beats her), the ninja cheers, and the whole word plays; the cards bloom into the whole picture as its clip starts. Then `onDone({ how: "tap", … })`. |
| **The tortoise while the rabbit waits** | The slow way again: the parts are lit and said in turn, with their gaps; the rabbit keeps waiting. |

---

## 4. The fast way

`fast` prop:
- `"rabbit"` (the default): 0.7 s after the slow way is done (a beat for the child's own "rainbow"), the rabbit wakes and Sensei asks `rabbitAsk` (default `rs_now_fast` "That was the slow way. Now tap the rabbit, and say it fast.", the only new line with "fast", BATH-checked /ɑː/). Pass `rabbitAsk: null` for later items: the rabbit only pulses.
- `"auto"`: Sensei says it herself (`tv_fs_fast_rabbit` "Now the fast way, like the rabbit..." · the word).
- `"none"`: the scene handles the whole word itself.

---

## 5. Demo mode: Sensei's paw

Demos are Sensei's, slow and announced (Jonas, 27 Sep; docs/DEMO_CHOREOGRAPHY.md). The **scene** says the lead-in; the slider moves her paw.

```ts
// the scene
<ReadSlider items={[{ kind: "word", w: "rain" }, { kind: "word", w: "bow" }]} mode="words" whole="rainbow" demo onDone={…} />
say([{ line: "pr_frame" }]);                     // "Ninjas always read this way."; on "this": readSlider.cue() (+ the ninja's dash)
say([{ line: "pr_demo" }]);                      // "Two little words can make one long word. I'll read this one slowly first. Watch my paw..."
//   on "Watch" (pr_demo.words.json): slideDemo() — the paw comes out of her portrait and lands on the tortoise; once
//   she has finished it waits 300 ms, presses (450 ms) and slides: [rain] · [bow]; the rabbit wakes
// …the child taps the rabbit: [rainbow] (onDone)
say([{ line: "pr_demo_back" }]);                 // "Now watch what happens if I start on the other side..."
//   on "watch": slideDemo({ backwards: true, gag: "bowrain" }) — [bow] · [rain], walking left; the bow-rain picture
await say([{ line: "pr_back_rainbow" }]);       // "Bow rain! It's raining bows! We always start on this side."
//   on "We": readSlider.home({ whole: true }) — the picture flips back, the tortoise pops home, the rail's light runs
//   left to right and her paw rides it, then goes home
```

- **The paw is Sensei's own**: her red panda's paw, the drawing of `SenseiDemo.tsx` `PAW_SVG` (four round toes, her red fur, the green sleeve of her robe with its cream trim and a blossom), at 0.95 of her tapping paw's size, leaning 8° the other way so it pushes the tortoise from behind with its fingertip on the back of the shell, and the tortoise's head and shell stay in view. **Not the cream glove**, which is only ever the ghost hand ("your turn"). (27 Sep, the judge: the demo paw was the ghost hand's glove, the same SVG and fill, and sat on the tortoise from mount; with SenseiDemo her red paw would have landed and turned into a glove.)
- **It is hidden until `slideDemo()`**. Then it comes out of her portrait (the Help button: `.help-btn`) and flies an arc to the tortoise (1050 ms, SenseiDemo's rising scoop: along below the board, then up into the tortoise, so it never crosses the cards), waits until she has finished speaking and 300 ms more, **presses** (450 ms: down onto the shell and up), and slides the tortoise at `pace` (default 170 stage px a second: the rail in about 3.5 s, plus the voice's waits) in 40 ms steps (timers in game time, no requestAnimationFrame). It obeys the same rules as a finger, so the ratchet paces it to the voice: it waits under "rain" until the clip and gap end, then goes on to "bow". When the last part has been said it flies back into her portrait (700 ms) and hides. Every move is transform and opacity (Web Animations for the flights, straight to the DOM while it rides the tortoise). The timings are `PAW_MS`.
- **Start it on the lead-in's "Watch"** (the line's `.words.json`), not after the line: the flight then overlaps her last words and costs about 0.4 s, not 1.05 s. It never presses while she is still talking.
- **One paw**: this is DEMO_CHOREOGRAPHY's request for the slider ("its first move to be SenseiDemo's flight from her corner to the tortoise"), done inside the slider, so a scene does **not** also run `senseiDemo()` for this beat (two paws). The drawing is a copy until `SenseiDemo.tsx` exports `PAW_SVG` (docs/fix-requests.md).
- **The backwards gag** is only ever Sensei's. The cards come apart, her paw comes out onto the tortoise (at the right-hand end after her slow read) and walks it back (a puzzled backstep wobble, 1.3× the forward pace: it is a show, not a reading pace), saying each part as it reaches it from the right (65% into a card); the cards merge into the gag picture (`pic_bowrain`, a cloud raining bows) as soon as the last part has been said. Nothing else in the game reads right to left.
- **The show ends the right way round.** `readSlider.home()` after the gag: as the tortoise pops home, her paw hops to the start dot and rides the rail's light from left to right (900 ms), then goes home. So the last movement before the child's first turn is left to right (the judge, 27 Sep: it was the right-to-left walk, which a child might copy). If a scene never calls `home()`, the paw goes home by itself 6 s after the gag.
- **The frame's cue**: `readSlider.cue()` pulses the start dot and the arrow and runs the light along the rail left to right, for the frame line's "this way" (the harness calls it on "this"; the scene adds the ninja's dash).
- While `demo` is set, the child's touches only wiggle the tortoise. The rabbit is still the child's to tap after Sensei's slow way (§9.2 Move 1: the child makes the fast word).

---

## 6. The idle ladders, Help and navigation holds

Quiet time is game time with **nobody speaking**, **no navigation hold up** and **the phone sideways**; any pointerdown anywhere starts it again. One timeout sleeps until the next step (no polling).

| Waiting for | Ladder |
|---|---|
| the first touch (`idle`) | 0.9 s: the ghost hand shows the slide once. 8 s: the ghost hand again (no line). 16 s: `rs_idle` "Put your finger on the tortoise when you're ready." Nothing moves on by itself. |
| a slide left part-way (`paused`) | 5 s: the ghost hand from the tortoise. 10 s: `rs_keep_going` "Keep going, all the way to the rabbit." 22 s: the tortoise pops home (the lights fade) and `rs_again` "Let's slide it again, from the very start." |
| the rabbit (`rabbit`) | 8 s: it hops and glows. 12 s: Sensei says the fast way herself (`tv_fs_fast_rabbit` · the word), and `onDone({ how: "timeout" })`. |

- **Help** (the ? button): the first press says `rs_how` "Put your finger on the tortoise, and slide it this way." with the ghost hand and the pulsing dot; later presses show the ghost hand only. While the rabbit waits, Help makes it glow.
- **Navigation holds** (`useHeld()`): while a hold is up (the Ready's ▶, a confirm), the slider takes no input and its ladders stop.
- **The nav layer's own tortoise and rabbit badges hide** while a slider is up (`useNav({ speed: { own: true } })`, TEACHER_SCRIPT §9.6): the slider draws its own.

---

## 7. Sounds: "say the sounds with me"

`mode="sounds"`: one picture, and a dot on the rail for each sound. Items are `{ kind: "sound", p, word, i }`.

- Each sound is **a slice of the word's checked slow word** (`public/a/x/<word>.mp3`), from its onset (`SLOW_TIMES`, or `NEW_SLOW_TIMES` for the new words) to the next onset less the gap. So /g/ and /b/ keep their voiced closure and the short vowels stay 0.24 s, as TEACHER_SCRIPT §9.1 checked them; the raw `public/a/p` clip has neither. If a word has no slow word, it falls back to `say({ sound })`. Pure sounds only, never letter names.
- The gap is `SLOW_GAP_MS` (250 ms). The music ducks under each slice.
- At the fast way the dots draw together and the picture hops as the whole word plays.
- The hand-over is `rs_sounds_with_me` "Now you slide it, and say the sounds with me." Sensei's own demo on a sound slider uses `pr_sounds_demo` "Let's say I want to read this word. I'll say its sounds first. Watch my paw..." or, as W2's bridge, `pr_sounds_too` "Words are made of sounds, too. Let me show you...".

---

## 8. The API

```ts
import { ReadSlider, slideDemo, readSlider, sliderState, type SliderItem } from "../ui/ReadSlider";

<ReadSlider
  items={SliderItem[]}          // { kind: "word", w, pic? } | { kind: "sound", p, word?, i? }
  mode="words" | "sounds"
  whole="rainbow"               // the fast word (and, for words, the picture the cards bloom into)
  pic?="mop"                    // sounds: the picture over the dots (default `whole`)
  onDone?={(r: SlideResult) => …}   // { how: "tap" | "timeout" | "auto" | "none", wrongWays, middles, flick, ms }
  onWrongWay?={(n) => …}        // a wrong-way sweep, the nth this turn (the slider says its own line)
  onPart?={(i) => …}            // each part as it is read
  demo?                         // Sensei's paw drives it (slideDemo); the child's touches only wiggle it
  fast?="rabbit" | "auto" | "none"
  rabbitAsk?="rs_now_fast" | null
  lines?={Partial<SliderLines>} // override any line id (how, idle, back[], startHere, keepGoing, again, autoFast, slowly)
  hint?                         // the ghost hand once as the turn opens (default: not in a demo)
  coachSpeed?                   // rs_slowly after three flicks in a session
  publish?                      // window.__snState (default true)
  ninja?                        // the ninja listens during the slow way and cheers on the child's fast word (default true)
  id?  className?  style?
/>

slideDemo(o?: { backwards?: boolean; gag?: string; pace?: number }): Promise<boolean>   // start it on "Watch" (§5)
readSlider.cue()                       // "this way": the dot and the arrow pulse, the light runs the rail left to right
readSlider.home({ whole?: boolean })   // pop the tortoise home, sweep the rail (her paw rides it after the gag); `whole`: a gag picture flips back
readSlider.gag(pic | null)             // show a gag picture in the whole's place
readSlider.drag({ from?, to?, ms? })   // a programmatic drag, stage x, same rules as a finger (default: dot → end, 1.6 s)
readSlider.tapRabbit()
readSlider.state(): SliderState | null
```

- One slider is mounted at a time (`readSlider` drives the mounted one). Give each item its own React `key` so a new word mounts a fresh slider.
- The slider preloads every clip it will say (the parts and the whole) on mount.
- Its state classes are prefixed `rs-` where a global class exists: `styles.css` has a `.pop-in` whose `scale()` once replaced the tortoise's translate, so it flashed at the stage's left edge on every pop home (found in the harness video, 27 Sep; now `rs-pop-in`).
- The ninja: it listens (`pose("listen")`) during the slow way, cheers on the child's rabbit tap, and thinks on a wrong way. **It never strikes a card and never runs back along the rail.** The scene may add one straight dash along the rail on the fast word, left to right, ending in a smoke puff and reappearing at home (docs/PICTURE_READING.md §5).

---

## 9. The bot contract

While a slider is up, `window.__snState` is:

```ts
{ scene: "slider", id, mode, phase,            // phase: idle | sliding | paused | wrong | rabbit | fast | done | demo | back
  next: "drag" | "rabbit" | null,              // what a child would do now (null: Sensei's turn, or a hold is up)
  from: { x, y }, to: { x, y },                // where to put the finger (the tortoise) and where to slide it, stage px
  rabbit: { x, y }, fired, n, lit, wrongWays, demo,
  busy }                                       // Sensei is speaking, or a wrong way, demo or fast word is playing
```

It is rewritten whenever Sensei starts or stops, so `busy` is never stale. `window.__snSlider` is `readSlider`.

A bot's `step()`: when `next === "drag"` and not `busy`, either call `__snSlider.drag()` or send real touches from `from` to `to` (map stage px through the `.stage` element's rect: `x_page = rect.left + x * rect.width / 1280`); when `next === "rabbit"`, tap `rabbit` (or `__snSlider.tapRabbit()`). The request for `scripts/treadmill/bot.ts` is in docs/fix-requests.md.

---

## 10. The harness and the videos

`playtest/read-slider/`: the real `ReadSlider`, art and audio inside the game's shell (the Stage, the ninja, Help, the nav layer, captions on), as a frozen build outside the shared dev server.

```sh
bunx vite build --config playtest/read-slider/vite.config.ts          # → playtest/runs/read-slider/dist
bun playtest/read-slider/serve.ts --port 4971                         # serves the build, and /a/ from public/
bun playtest/read-slider/record.ts <compound|sounds|wrong> <slow|normal|fast>   # a video with real touches
sh playtest/read-slider/record-all.sh 4971                            # all seven videos in turn
bun playtest/read-slider/peek.ts <case> <seconds>                     # quick screenshots with __snState
```

The cases:
- **`compound`**: picture reading v2's first meeting (docs/PICTURE_READING.md §3): `pr_frame` (the rail's cue on "this"), Sensei's slow demo on rain + bow with her paw (out of her portrait on "Watch"), the child's rabbit, her backwards gag (the paw out on "watch"), the paw's ride along the rail on "We", the Ready, then the child's own slides on snow + man and cup + cake. `rs_praise_1` follows the first only if the child tapped the rabbit (not after Sensei's 12 s fast way).
- **`sounds`**: Sensei's paw under sun's three sounds (`pr_sounds_too`, the paw out on "show"), then the child slides under mop: `rs_sounds_with_me` · /m/ /o/ /p/ · the rabbit · "mop" (praise only after the child's own tap).
- **`wrong`**: the child's turn on snowman: a right-to-left swipe, then the tortoise pulled back across "snow", then a slide the right way.

The judge's touch scenarios (27 Sep: ahead-and-back to the waiting tortoise, a tap then 21 s idle, a palm resting first, a pause resumed during `rs_keep_going` in sounds mode, taps on either half of the tortoise and on the cards, flicks, wobbles, drifts, two fingers) are rerun on each fix round against the frozen build (their runner is outside the repo, in the judge's scratchpad); the unit tests cover the same rules (`read-slider.test.ts`, 20 tests).

`record.ts` drives Chromium at 844×390 with **real touch events** (CDP `Input.dispatchTouchEvent`: a touchMove about every 16 ms, each placed where the finger would be by the wall clock, with a 9 px up-and-down wobble; the log keeps each drag's real length, so a loaded machine can't quietly turn a flick into a slow slide), plays as a child would (waits for Sensei, slides, taps the rabbit, taps ▶), films a CDP screencast and rebuilds the soundtrack from the harness's own audio log. Drag speeds: slow 3.2 s, normal 1.3 s, fast 0.18 s (a flick). Each run writes `docs/read-slider/videos/<case>-<speed>.mp4`, a contact sheet (`.jpg`, a frame every 1.5 s) and a log (`.json`: the touches, the slider's events and every clip heard).

The videos and what they show are listed in docs/read-slider/videos/README.md.

---

## 11. Decisions (made without asking; for docs/DECISIONS.md at integration)

| # | Decision | Why |
|---|---|---|
| RSL1 | **The tortoise is the handle**, the rabbit the fast way. | The house's slow and fast pair (TEACHER_SCRIPT §9), and a big thing for a small finger. |
| RSL2 | **Each part plays once, paced by the voice** (the elastic ratchet), never tied to the finger's speed. | Every app that describes a drag does this (research §3.4); continuous audio would bring back the smeared sounds removed on 27 Sep. |
| RSL3 | **The wrong way never reads, and the tortoise never moves left**: it pops home. | The child's mistake must not earn a funny picture, and the only movement along the rail stays left to right. |
| RSL4 | **Three wrong-way lines in turn**, not the brief's one ("Oops! That's the wrong way…"). None says "wrong"; "left to right" is said once, in the first. | A 3-year-old doesn't know left from right; "this side" comes with the dot pulsing. No line repeats back to back. |
| RSL5 | **A 100 px (49 CSS px) threshold** for the wrong way, measured from where the finger last held the tortoise; less is a wobble. | A small child's finger drifts; the videos' 9 px wobble never trips it; the elastic band invites a finger that ran ahead to come back to the tortoise, and that is not a pull (27 Sep). |
| RSL6 | **Taps on the cards in order count as a read.** | A fallback for a child who can't drag yet (research RS10). |
| RSL7 | **Sounds are slices of the checked slow word**, not the raw pure sounds. | They keep the voiced closures and the short vowels (TEACHER_SCRIPT §9.1). |
| RSL8 | **The ninja watches and cheers; it never strikes.** A dash on the fast word is the scene's choice. | Jonas: the strike-and-return "is counterproductive". |
| RSL9 | **Sensei's own red panda's paw**, out of her portrait (the Help button) and back, stays on the tortoise for her whole slide, and presses before it moves; hidden until her demo. Never the cream glove, which is the ghost hand's "your turn". | Demos are slow and explicit, and done by Sensei (27 Sep); a glove on the tortoise from mount read as "your turn" (the judge). |
| RSL10 | **After her backwards show her paw rides the rail left to right** (`home()`), so the last movement before the child's turn is the right way. | The judge: the right-to-left walk was the last thing a child saw before their first slide. |
| RSL11 | **A tap moves nothing** (the tortoise waits for 14 px of drag to the right), and a grab let go with nothing read returns the turn to waiting. | A tap is the most likely first thing a 3-year-old does; it left the slider stuck, or read as a paused slide (the judge). |
| RSL12 | **A palm that holds nothing gives way** to the finger that takes the tortoise. | A resting hand silently blocked the read (the judge's palm-first run). |
| RSL13 | **Every part the child reads cuts Sensei off**, not just the first. | Sound slices play beside her voice; a resumed slide overlapped "Keep going…" (the judge). |

---

## 12. Open, not blocking

- **Older children** (Year 1+): a plain brush-glow handle instead of the tortoise, under written words (research §8).
- **The slider in every read-back** (Word Building, Kai and Suki, Story Time help), as Sounds~Write's "slide your finger along under the word".
- **Holding a continuant under a resting finger** ("mmmaaat"): not done; it fights the 250 ms gaps.
