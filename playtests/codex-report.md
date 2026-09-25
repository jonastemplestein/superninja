# Super Ninja playtest — 25 September 2026

**Build:** [live preview](https://super-ninja.iterate-dev-preview.workers.dev/) in Google Chrome, with an 850 × 400 CSS pixel landscape viewport. **Perspective:** one pass as a curious five-year-old, then a design review. I could not hear the game audio, so I judged spoken material from the enabled speech captions and visible feedback. Chrome's native window control was unavailable to the computer-use connection; I used a new playtest tab and did not touch existing tabs. This matters when interpreting the audio-dependent findings.

I played the title, first intro card, ninja selection (Suki), Bamboo Village dojos 1 and 3, battle 2, several waves of Ninja Run 4, Sound Swap 5, and Story 7. Run did not finish during this pass; I used the grown-ups' **Unlock every level** setting to reach Swap and Story, then turned it back off. I also tried the Blossom Tree before and after rescuing eight spellings, and opened the grown-ups area with a two-second gear hold. The first intro card's yellow arrow skipped to ninja selection, so later intro cards were not assessed. No browser console errors appeared during the pass.

## Screenshot evidence

All captures are 850 × 400. [Title](screenshots/title.jpg) · [Bamboo Village map](screenshots/village-map.jpg) · [first dojo](screenshots/dojo.jpg) · [battle](screenshots/battle.jpg) · [Ninja Run](screenshots/ninja-run.jpg) · [Sound Swap](screenshots/sound-swap.jpg) · [story narration](screenshots/story-narration.jpg) · [story reading](screenshots/story-reading.jpg) · [story reward](screenshots/story-reward.jpg) · [Blossom Tree](screenshots/blossom-tree.jpg) · [grown-ups](screenshots/grown-ups.jpg).

## 1. Bugs and reproducible defects

### P1 — Speech captions omit the information needed to act and to learn from a mistake

**Steps:** Keep **Show speech captions** on (it was on by default). In the first dojo, tap each of `a i m s t` three times to reach the four-choice sound check. Alternatively enter battle 2 or Sound Swap 5. Let the prompt play, then deliberately tap a wrong tile (`t` when the dojo choices are `i t s m`, for example).

**Observed:** The caption bubble says fragments such as **“Can you find…”**, **“That's…”**, **“This is…”**, or **“Here's a clue. Listen to the sounds.”** It never displays the sound being requested or the specific sound correction. In battle, the second word can be only a speaker symbol above blank slots. Sound Swap can show only a speaker symbol above the existing word. I had to guess or eliminate letters despite captions being enabled. The grown-ups page describes mistake prompts like “That's /p/… we need /t/”; that specificity was not available in the visible captions I saw.

**Expected:** Caption mode should provide an equivalent way to understand the spoken instruction and correction. If displaying the target immediately would give away a phonics answer, use a separate accessible hint after a miss, a slow replay with the relevant graphemes, or an explicit parent-facing caption mode. The current half-sentence is neither a useful transcript nor a useful hint. See [battle](screenshots/battle.jpg) and [Sound Swap](screenshots/sound-swap.jpg).

### P2 — The intro's apparent “next” arrow skips the entire introduction

**Steps:** From [title](screenshots/title.jpg), press the large green play button. On the first scene about the Great Blossom Tree, tap the yellow right-arrow at top right.

**Observed:** The game jumps straight to **Choose your ninja!** The button's accessible name is **Skip**, but visually it is the same sort of right-arrow used later to advance story pages. There is no visible “Skip” label or confirmation.

**Expected:** A right-arrow advances one card; a control that skips the whole intro should say **Skip** or use an unambiguous skip symbol. This is especially easy for a non-reader to trigger while trying to see what happens next.

### P2 — Moving Ninja Run words are missing from the accessibility tree

**Steps:** Enter Bamboo Village level 4. While `sit`, `pit`, `sat` and other hanging word lanterns move across the screen, inspect the page's accessible controls.

**Observed:** The tree exposes **map**, **Hear the sounds again**, and the petal count, but no word lanterns. I could tap the moving artwork by position, but the actual answer choices had no accessible names or button roles in the observed tree.

**Expected:** Each moving choice is exposed as an interactive word target with its current label and can be activated without precise pointer timing. This is a concrete access issue for assistive input and also makes the game harder to test. See [Ninja Run](screenshots/ninja-run.jpg).

No other deterministic failure or crash was reproduced. The run's changing petal count, retries, and battle heart restoration may be intentional; I have treated them as design questions below rather than bugs.

## 2. Where a five-year-old may get stuck

- **Ninja selection:** Both character cards are inviting, but Sensei Maple's speech bubble covers the lower part of Kai's card at this height. The choices have no visible names or tiny sample animation. A child will choose by picture, which is fine, but one choice is partly obscured.
- **Village map:** The path uses small illustrated circles with no visible level type or short caption. Before completion, most are grey with tiny padlocks; it is unclear which circle is the next one, why it is locked, or that the Sensei circle at lower left is the first dojo. The map becomes clearer only after stars and character movement appear. See [map](screenshots/village-map.jpg).
- **First dojo:** The lone `a` card looks tappable, but the three required taps are not explained. Petals collect under it; they are small and their purpose is not stated. The five-card rehearsal is fifteen nearly identical taps before the first real choice. See [dojo](screenshots/dojo.jpg).
- **Audio-only turns:** In dojo word building and battle, a speaker icon can replace the picture completely. A child whose audio is off, missed, or masked by a noisy room sees blank answer slots and letters but no way to infer the word. The speaker replay affordance helps only when sound is available.
- **Battle:** Three hearts, four enemy squares, and a rapidly moving bar appear together while the child is still learning the task. I lost hearts while observing a two-letter audio-only word; the game kindly restored them, but the relationship between a wrong tile, a timeout, an enemy hit, and the score is not obvious. See [battle](screenshots/battle.jpg).
- **Ninja Run:** The instruction says to listen and blend, but does not visibly say **tap the matching lantern**. Choices move quickly, the target word is not visually represented, and a mistaken catch briefly says “Listen again” or “That says…”. On a phone, the child must listen, decode, track motion, and tap a moving target at once. See [run](screenshots/ninja-run.jpg).
- **Sound Swap:** The first step (which existing tile to change) and second step (which new tile to insert) become understandable once tried. Before that, the target is audio-only and the original word's picture stays on screen. A child may reasonably use the picture of **man** to select `m` even when the required swap is `n` → `t` to make **mat**. See [swap](screenshots/sound-swap.jpg).
- **Story:** Rich pages contain many words a beginner cannot read, relying on narration; those pages have no visible replay speaker. The decodable page does have a speaker, tappable words, and a green check, but the check is an icon-only **I read it!** action. The child can press it without reading. In the `pit`/`mat` choice, the **mat** label sits over the large pit while the mat drawing is at the far right; the spatial relationship is confusing. See [narration](screenshots/story-narration.jpg) and [reading](screenshots/story-reading.jpg).
- **Blossom Tree:** The pink button looks like a flower/heart rather than a tree. The buds initially look inert; tapping one opens a compact lower-right card with a spelling and two tiny blue/pink marks whose meanings are explained only in the grown-ups area. The 8/46 count is useful to adults, but not a motivating child-scale goal. See [tree](screenshots/blossom-tree.jpg).
- **Grown-ups:** A normal gear tap does give a speech bubble saying to hold, which is good. There is no visible hold-progress ring or filling state, so it is hard to know whether a two-second press is registering.

## 3. Visual and interaction design

The painted environments and character silhouettes create a distinctive, welcoming world. The title is immediately legible and the large answer tiles in dojo, battle, and story are easy to hit. The weakest part is the information hierarchy once play begins: the background is visually rich, while the one thing the child needs to do next is often an unlabelled speaker or a fleeting bubble.

At 850 × 400, the home and gear circles are roughly 38–42 CSS pixels across, and the story replay speaker is around 36 pixels; these are marginal phone targets. The map stars, locks, and progress marks are much smaller. Keep primary controls at least about 44 × 44 CSS pixels with forgiving hit areas; enlarge the story replay control and the map's status details. The moving run labels look about 65 × 40 pixels, but motion makes their effective target smaller. Consider larger lantern bodies, a slower early wave, and a short stationary decision window.

The grown-ups panel is especially cramped at this height. Its teaching explanation uses very small, dense text in two columns, and the spelling progress panel begins below the visible bottom edge with no strong scroll cue. A single column or a tabbed **Settings / How it works / Progress** layout would improve adult readability on a landscape phone. See [grown-ups](screenshots/grown-ups.jpg).

There is also an art-system mismatch: the environments are textured and painterly, while the hero, Sensei, enemies, and some objects are thick white-outlined cutouts. That contrast helps foreground separation, but the repeated static poses make the hero feel pasted onto the same scene, especially in the dojo and battle. Keep the readable outline but reduce the white halo and add a few expressive poses tied to success, confusion, and peril. Reusing the same dojo background for many rounds makes an otherwise lavish game feel more template-like than its title and story suggest.

## 4. Fun, feel, pacing, rewards

**Delights:** The cherry-petal particles are lovely; the rescued spellings visibly bloom on the Blossom Tree; the monster and the mischievous swap wizard have character; the story illustrations give a real reason to care about the pandas. Correct tiles flash and the ninja leaps in battle and run. The story's final prompt to read a real book with a grown-up is a thoughtful ending. The game is forgiving: wrong tiles can be retried, and running out of battle hearts did not strand me.

**Drag:** The dojo front-loads 15 repeated taps before the first test. The congratulatory screen is nearly identical after each activity, with the same cheering ninja, confetti, and replay/next buttons. One star after a long level can feel stingy, especially when the reason for the rating is not shown. Battles add time pressure but little visual change in the enemy beyond a meter; the monster's threat and the cast spell could have more physical reaction. Ninja Run is the liveliest mode, yet the screen scroll and lantern motion outpace the amount of phonics thinking a new reader needs. Sound Swap has a satisfying word transformation, but its target is abstract until the child successfully guesses.

## 5. Top 10 improvements, in priority order

1. **Make captions complete and pedagogically useful.** Preserve assessment integrity with an optional hint/reveal flow, but never leave a caption as “Can you find…” or “That's…”. Include the specific correction after an error.
2. **Give every audio-only word a fallback.** Use a visible picture where possible; otherwise offer a “show clue” action that reveals segmented sounds after a first try. Apply this to dojo, battle, run, and swap.
3. **Slow and scaffold the first Ninja Run.** Start with one stationary example, then two slower moving lanterns; teach “tap the word” visually before introducing three choices and continuous motion.
4. **Clarify the village route.** Put short labels or mode icons on nodes, enlarge the next playable node, and use a visible trail/number sequence. Make locks and stars readable at phone size.
5. **Show cause and effect in battle.** Pause or extend the first timer until the prompt finishes; explain hearts and enemy squares with one visual example. Make a timeout, wrong answer, and correct spell look distinctly different.
6. **Replace the ambiguous intro arrow.** Show a labelled Skip control and a separate Next control, or let the arrow advance one intro card.
7. **Shorten the dojo's repetition.** Two taps per new spelling, then a meaningful discrimination or word-building choice; let subsequent mastery adapt the repetition count.
8. **Improve story page controls.** Add replay to narrated pages; label the green check with text or a spoken cue; align `pit` and `mat` choice labels with their corresponding objects.
9. **Increase small touch targets and adult readability.** Enlarge home, gear, speaker, map stars/locks; give the grown-ups area a phone-friendly single-column layout and an obvious scroll affordance.
10. **Diversify rewards and character reactions.** Show what earned each star, vary the celebration by mode, and give Suki/Kai and enemies a few emotional poses so the painted world feels alive during practice.

**Scope limit:** I could not assess audio quality, phoneme purity, pronunciation, timing against speech, or later worlds. The intro beyond its first card and Ninja Run completion were not reached naturally in this session.
