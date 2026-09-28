# The ninja on every level

The child's ninja (Kai or Suki) stands bottom-left in **every level type**, breathing and ready. When the child gets something right, the ninja does something impressive about it: a kick, a spell or a shuriken that flies to the thing they got right and lands with a burst. First-try answers in a row build a **streak**. The ninja starts glowing, flames appear over its head (one per answer, with no numbers), and at 6 and 10 in a row it powers up again. Children aged 3 to 5 can't read, so all of this is pictures, motion and sound.

- `src/ui/Ninja.tsx`: `<NinjaSpot/>` and the `ninja` controller (moves, travelling effects, impacts, auras, flames, tier-ups)
- `src/engine/streak.ts`: `streak` and `useStreak()`
- `src/ui/poses.ts`: sprite poses, fallbacks and size fitting
- `src/ui/ui.tsx`: `fx` particles (`ring`, `glow`, `twinkle`, `lines`, `implode`, `puff` besides `burst` and `rain`), `fxDom()`, `stageRect()`, the turn-your-phone prompt, `useUpright()`
- `src/engine/audio.ts`: the move sounds (`sfx.kick`, `thwack`, `magic`, `sparkle`, `shuriken`, `tink`, `spin`, `land`, `boom`, `powerup`, `twinkle`, `hmm`, `fizzle`, `flame`, `kiai`, `oops`). Sound effects duck by themselves under speech (to half) and right down under a target sound, blend or modelled word (to 15%), so no scene's whoosh or boom can mask what the child is learning. Scenes don't need their own sfx guards.
- Demo: `/play/?scene=ninja-demo` has every move, tier, miss and celebration on buttons, plus slow motion. `bun scripts/hero-shots.ts` films them to `playtest/hero/foundation/`.

## Layout contract (stage coordinates, 1280×720)

```
┌──────────────────────────────────────────────────────────────┐
│ [home]            ═══ progress ═══                           │
│                                                              │
│              PLAY AREA  x 340–1110                           │
│                                                              │
│ ┌ NINJA ZONE ┐                                  caption ◢    │
│ │ x 0–330    │   tiles along the bottom:        bubble       │
│ │ y 380–720  │   x 340–1100                  ┌ HELP ZONE ┐ │
│ │  (ninja)   │                               │ x 1116–1280│ │
│ └────────────┘                               │ y 556–720 ◉│ │
└──────────────────────────────────────────────────────────────┘
```

- **Ninja zone**, bottom-left: x 0–330, y 380–720. The ninja stands here with its feet near y 700. Never put anything tappable in it.
- **Help zone**, bottom-right: x 1116–1280, y 556–720. Sensei's round Help button (124 px) sits at right 14, bottom 14 on every screen. The caption bubble sits above it on the right, with its tail pointing down at him.
- The home/back button goes top-left and the progress bar top-centre. Rows of tiles along the bottom fit between x 340 and 1100.
- **Home zone**, top-left: x 0–130, y 0–130. Only Home (`data-nav="home"`, drawn by the nav layer, docs/NAVIGATION.md) may have its centre in it; a screen's top bar starts right of it (`<TopBar>` in src/ui/nav.tsx).
- `bun scripts/treadmill/sweep.ts` reports a major **zone-conflict** finding for any tap target whose centre is in any of these zones. The ninja zone is checked on levels, and on any screen that shows a `.ninja-spot`. It skips the Help button itself and anything marked `data-tap-proxy`.

## API

```tsx
import { NinjaSpot, ninja } from "../ui/Ninja";
import { streak } from "../engine/streak";

<NinjaSpot />                          // in the scene's JSX; one per screen
streak.reset();                        // level start (silent; restores a streak banked by the level just finished)
ninja.strike(el); streak.hit();        // first-try correct: attack the thing they got right, then count it
streak.miss();                         // wrong: the ninja reacts by itself (see Tiers)
await ninja.celebrate();               // end of level
```

**`<NinjaSpot size? x? bottom? pose? noFlames? pending? z? className? style? />`**: `size` is the idle sprite's width (default 250), `x` is its left edge (default 40), `bottom` is how far the feet sit above the stage floor (default 18), and `pose` is the resting pose (default `"idle"`; it becomes `"ready"` on a streak). `pending` draws that many pale, breathing outline flames after the lit ones (first-try answers earned but not counted yet, e.g. a battle word's held hits). `z` defaults to 12. It never takes taps (`pointer-events: none` all the way down). Only one should be mounted at a time; the latest one mounted is the one `ninja` drives. When it unmounts (the child taps Home mid-move), the move in progress is cancelled without launching anything, effects still in flight are removed, and queued lines are dropped, so nothing lands or sounds over the map.

**`ninja`** (a singleton, like `fx` and `sfx`). `Target = Element | { x, y }` in stage coordinates.

| Call | What it does | Resolves |
|---|---|---|
| `strike(target?, { move?, react?, soft?, via? }?)` | A varied attack, chosen from the streak tier and never the same as the last two | when the effect lands |
| `act(move, target?, { react?, soft?, via? }?)` | One particular move | on impact with a target, otherwise when the move ends |
| `celebrate()` | End of level: a power crouch, a big backflip, a ground-pound landing, then a two-bounce cheer with confetti (~1.9 s) | when it's done |
| `carry(fromEl, toEl, { react?, burst?, arc? }?)` | Spell carry: the ninja casts, a beam grabs `fromEl`, and a glowing copy flies to `toEl` (`burst: false` skips the arrival ring and stars; `arc` is how high it flies, default 120) | when the copy arrives (you hide or move the real element) |
| `knock(el, { dir? })` | A spin kick, then a copy of `el` spins away off the screen | as it leaves (you hide the real one) |
| `pose(p \| null, { now? }?)` | Sets the resting pose (e.g. `"run"`); `null` restores the default. It shows at once (an idle fidget stops for it) unless a real move is playing, which then ends in it; `now: true` swaps the sprite even mid-move | |
| `streakLine({ line? }?)` | Plays a tier-up held back by `streak.hit({ defer: true })`: the power-up and the highest tier's line, said now | when both are done (at once if nothing is held) |
| `linesDone()` | | when the ninja's own tier-ups and lines have played out (at once if none) |
| `say()` | A kiai shout: a "!" burst by the head and a "hup" | |
| `busy`, `mounted`, `heldTier`, `currentPose` | Is a move playing? Is a `NinjaSpot` on screen? A deferred tier waiting for `streakLine()`? The pose showing now | |
| `setSlowmo(k)` | Dev only (the demo and filmstrips) | |

`react` (default true) squashes and flashes the target element on impact. Pass `react: false` if your scene animates it at that moment. `soft: true` is for a strike that teaching speech follows at once: it uses only the quick moves (kick, punch, throw; punch and throw from tier 2, when the kick becomes a flying kick) and plays no whooshes, kiai, booms, landing thuds or screen shake, just one gentle tink as it lands, so Sensei can model the word about 0.25 s after the tap. `via` is the control point of the main projectile's curve: put it high above a row of answers (or a word the ninja has just fixed) so the effect never crosses them.

**`streak`**: `hit(opts?)`, `miss(opts?)`, `reset()`, `bank()`, `drop()`, `on(fn) → unsubscribe`, `n`, `tier`, and `set(n)` for dev. `useStreak()` returns `{ n, tier }`. Every event is `{ type, n, tier, prevN, prevTier, tierUp, line, defer }`. `streakLine(e)` (exported from `streak.ts`) returns the line that goes with an event (`streak_3/6/10` on a tier-up, `streak_lost` on a miss that ended a streak of 3 or more), or `null`, and only ids that exist in `LINES`.

- `hit({ count: k })` counts k first-try answers as **one** event: however many tiers they cross, one power-up and one line (the top tier's).
- `hit({ line: false })` / `miss({ line: false })`: the ninja does everything except say the line, and the scene says `streakLine(e)` itself, e.g. as the praise straight after its teaching (Early's picture games), or "Keep going, ninja!" **before** a correction so the target is the last thing heard (Dojo, Battle, Early, Story).
- `hit({ defer: true })`: the answer counts at once (its flame lights) but a tier-up's power-up and line wait for `ninja.streakLine()`, e.g. at the end of a word being spelt, where the next letter's sound would otherwise cut the line off (Dojo).
- The streak **carries over** from a level the child finished into the next one (the level host calls `bank()` on a finished level and `drop()` on Home; `reset()` restores a bank less than 20 minutes old), so a 6-question level can still reach "master". Training, placement and dev deep links start at zero.

Rules:
- Call `hit()` **only for a first-try correct answer**. A wrong try calls `miss()`, and the eventual correct answer to that question is not a hit.
- Don't play `streak_*` lines yourself unless you passed `line: false`; don't `act("think")` after a miss from a streak (the ninja does it; after a miss from zero, a scene may).
- Don't `await` a strike before speaking the teaching audio unless the pause helps. It resolves on impact (about 0.3–0.7 s). When teaching follows at once, use `soft: true`.
- To wait for a tier-up's line before speaking again, `await ninja.linesDone()` (don't poll `isSpeaking()`).
- Scenes with timers (e.g. a monster's charge meter) should pause while `useUpright()` is true.

## Moves

Every move combines a pose swap with keyframed motion that has anticipation, squash and stretch, and follow-through. An effect travels from the ninja to the target and lands with an impact burst. Each has one sound as it launches and another as it lands. A lunge goes out at most about 130 px and is back within about 0.5 s. Tier 2 and up leave coloured afterimages.

| Move | Motion | Effect → impact | Tier upgrades |
|---|---|---|---|
| `kick` | crouch, hop-lunge, hit-stop, land | crescent air-slash → comic "POW" star, rings, speed lines | 2+: flying kick with a boom and screen shake |
| `punch` | pull back, jab | ki comet → pow | 1+: double jab |
| `throw` | wind-up, snap | spinning shuriken on an arc → tink and sparkle | 1: two shuriken; 2+: three in a fan |
| `cast` | charge an orb at the hands (energy gathers in), push | spell orb on a high arc with a glowing trail → magic burst | 2+: a big orb circled by two moons; 3: rainbow orb and boom |
| `spin` | pirouette (turns round), ribbons swirl | twin crescents → pow | |
| `jump` | squash, leap, point at the apex, land in dust | star shot → star burst | |
| `flip` | backflip with a ribbon arc, land in dust | 2–3 stars from mid-air → star burst | |
| `cheer` | cheer pose, two bounces | confetti and twinkles | |
| `think` | head tilt and sway | a thought cloud with "?" and a curious "hm?" | |
| `hurt` | hit flash, knockback, wobble | dizzy stars | battles only (monster attacks) |
| `power` | crouch (energy gathers in), burst up, vibrate | light flash, three rings, twinkles, aura bloom | used for tier-ups |

Strike pools: tier 0 is kick, punch, throw and cast. Tier 1 adds spin and jump. Tier 2 is kick, spin, cast, flip, throw and jump. Tier 3 is flip, spin, cast, kick and throw.

## Tiers (streak = first-try correct answers in a row)

| Tier | At | Looks like |
|---|---|---|
| 0 | n < 3 | Breathing, idle. Small flames appear from the first answer on. |
| 1 "glow" | n ≥ 3 | A warm golden aura and light rays, a gold rim around the silhouette, rising sparkles, a golden power circle on the ground, a fighting stance, gold flames |
| 2 "super" | n ≥ 6 | A multicolour aura, hovering, afterimage trails, bigger flames, upgraded moves (flying kick, big spells, triple shuriken) |
| 3 "master" | n ≥ 10 | Rainbow aura and rim, rainbow flames, a ring of energy orbiting the waist |

- **Crossing into a tier** (1.1 s): the `power` move, a light flash on the ninja, rings (never red: red means wrong), `sfx.powerup`, and the line `streak_3`, `streak_6` or `streak_10`. The line waits for a quiet moment (280 ms without speech) so it never talks over teaching; it is dropped if none comes within 6.5 s, if the ninja leaves the screen, or if a newer streak event comes first (the child has already answered the next question; a higher tier-up drops a lower one's line this way). The power-up waits for the strike that earned the tier to land (0.9 s at most), and the line starts with its flash, so the words and the transformation arrive together.
- **A miss** is gentle. The flames puff out and the aura fades. The ninja does `think` (a smiling, puzzled head tilt with a "?" cloud). If the streak was 3 or more, a soft fizzle plays and then `streak_lost` ("Keep going, ninja!"). There is never a hurt pose for a miss.
- While Baron Muddle speaks, the ninja takes a fighting stance.

## Sprites

The poses are `public/a/i/hero_<kai|suki>_<pose>.webp`. The originals are idle, run, jump, throw, cast, hurt and cheer. The move poses are kick, punch, spin, power, think, ready and flip (generated by `scripts/gen-hero-moves.ts`), and `bow` (a ninja's rei facing right, fists together: `hero_<kai|suki>_bow.webp`, 27 Sep; Suki's is an edit of Kai's, so its provenance is `docs/read-slider/art/bow/picks.json`, not the script). Until a move pose's file exists, it falls back to kick/punch → throw, spin/flip → jump, power → cheer, think/ready → idle, and bow → ready (then `ninja.act("bow")` plays a nod, a hop and a "hup"). `TWEAK` has `bow: 0.915`, because a bow covers less than a standing pose. A probe at startup switches each one over on its own, with no code change needed. New sprites are trimmed to their content, so `poseFit()` measures each one's painted area and centre of mass, and draws it so the ninja stays the same size and in the same spot. Hand-tune with `TWEAK` in `poses.ts` if a pose still looks too big or small.

## How each level type uses the ninja

Every level mounts `<NinjaSpot />`, calls `streak.reset()` on start, a strike and `streak.hit()` on each first-try correct answer, `streak.miss()` on each wrong one, and `await ninja.celebrate()` before handing over to the reward screen.

- **Listen and first-sound picture games** (`listen`, `firstsound`, `soundhunt`, Early.tsx): on the right picture, `ninja.strike(corner, { soft: true })` (people and animals get a friendly gift of stars instead), and Sensei models the word about 0.25 s after the tap while the move is still in the air. A first-try answer that would cross a tier is held and counted after the teaching with `hit({ line: false })`, and the scene says the tier line as that answer's praise.
- **Word building**: the Dojo delivers each correct tile with a tier-pooled move (the tile hops up out of the bank to meet it, or a `carry()` spell lifts it) and counts it with `hit({ defer: true })`; a tier-up earned mid-word plays with `ninja.streakLine()` just before the word is read back. Early's word building uses its own set of seven launches (cast, throw, punch, kick, leap, spin and flip, gated by tier), driving the whole body on the float layer and the pose with `ninja.pose(p, { now: true })`, the letter swooping into its slot from below. `carry(tileEl, slotEl)` remains the simple option for a new scene.
- **Battles and bosses**: each correct sound is a quick strike at the monster as its pure sound ends; a hit that would cross a tier is held (a pale flame, `<NinjaSpot pending={n} />`) and the word's held hits are counted as its finisher goes with `hit({ count: k })`, so one word gives at most one power-up and one line. Boss finisher: `act("power")` then `act("flip", bossEl)`. A miss says `streak_lost` (from `miss({ line: false })`) before the correction. When the monster attacks, call `ninja.act("hurt")`; this is the only place the hurt pose is used.
- **Sound Swap**: the tapped sound is knocked out by a tier-pooled `act()` (the first of a level is the spin kick); `ninja.carry(choiceEl, pointUnderGap)` brings the new spelling in under the word and it shoots up into the gap. The spell's `streak.hit()` is counted after the fixed word is blended, so a tier-up shout never comes before the child hears their word. A right choice tapped during a tier-up power-up is kept (it glows) and cast when the power-up ends; a wrong one turns pink at once and gets its miss when the shout is over. Baron's bonks fly high over the word (`via`).
- **Sorting**: `ninja.act("kick", chestEl)`. A kick sends the word flying into the right chest; `carry(wordEl, chestEl)` makes the word itself fly.
- **The run**: the runner draws its own ninja on its canvas (it is the player character: 200 px wide, home x ≈ 235, feet on the run's ground line at y ≈ 620 rather than 700), so there is no `<NinjaSpot/>`. It wears the streak itself (canvas aura, rim, flames, trails) and flies at the lantern the child taps with a varied strike; a lantern can't be caught until its sounds have been said. On a tier-up the streak line takes the place of the praise after the word's blend, and the power-up plays with it. On a miss, `streak_lost` opens Sensei's correction, so the target sounds are still the last thing the child hears. Obstacles never hurt: without a streak the ninja trips and hops over them; on a streak it kicks crates away and flips over spikes.
- **Stories**: calm magic (jump, cast, flip; a spin at the glow, and a kick whose shockwave bursts into stars on a big streak) aimed at the words, word or picture the child got right; the right answer steps up and the others sink away before launch. Every page gives a clue after a few idle seconds, led by the ninja (a star at the Next arrow, a spell over the words, a "hm?" while the choices hop).
- **Reading checks** (tap the reader who read it right): a gift of stars settles on the right reader while Sensei reads the word back sound by sound, lighting each tile.

## Turn your phone

On a phone held upright (`(orientation: portrait) and (max-width: 700px)`), `Stage` covers the game with an animated picture. An upright phone wiggles, a big curved arrow draws on as the phone turns sideways, a green tick pops, and the ninja goes from thinking to cheering. An "uh-oh" (`sfx.oops`) plays, then Sensei says `turn_phone`. That repeats at most every 6 s (four times at most), and again when the child taps. With iOS audio still locked, a hand pulses over the phone and the first tap speaks. There is one small line of text, for grown-ups. The game pauses while upright: `pauseSpeech(true)` holds every `say()` at its next clip, so scripted scenes stop rather than carry on unheard, and the line that was cut off is said again after the phone is turned back. Music and the game's sound effects go quiet (the prompt's own "uh-oh" and the happy twinkle when the phone is turned back play through `sfxOver`).
