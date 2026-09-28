# Confirm: asking before a costly tap

**Status:** sections 1 and 2 were written on 27 September 2026 by the confirm inventory. Section 1 lists every tap that a child could make by accident and that costs something. Section 2 is the prior art. Section 3 is the reusable confirm as built the same day (`src/ui/Confirm.tsx`), and as changed after the judge's round (YES is a picture of where the tap goes, NO the green ▶, "keep playing"): its API, a snippet for each call site, the lines, the evidence and the decisions. Wiring it into App.tsx and the scenes comes after the fix workflow (docs/fix-requests.md, "Map redesign and confirm (27 Sep)").

**Jonas (27 Sep), verbatim:** "Oh also on the overworld map the kids can still never find the right button to press and their avatar weirdly overlays half of the button etc and its all v weird. Also we could have some failsafe there where going back to a previous lesson accidentally, the sensei asks if thats what we want. In general a simple reusable mechanic that lets us 'confirm' an action would be v helpful in other situations too."

The players are 3 to 8 and most can't read. So a question for a child is spoken by Sensei, and its answers are pictures. Anything meant only for grown-ups may be text.

---

## 1. Where

**How this was found.** I read the map, the reward, `quitLevel` and `homeFor` in src/App.tsx, and Home in src/ui/nav.tsx. I also read JumpAhead.tsx, Grownups.tsx, Profiles.tsx, IntroFilm.tsx, Battle.tsx, Story.tsx, `useFinish` in Early.tsx, the warm-ups' end in Warmup.tsx, what engine/store.ts and engine/streak.ts save and when, engine/gems.ts (`frontier`, `placeAtUnit`, `shouldOfferJump`), and docs/NAVIGATION.md §3.3 (where Home lands).

**What Home in a level keeps and loses.** Some things are saved as the child plays: the reading and spelling record of every answer, gem energy, and stickers for the words met. The rest is lost when Home is tapped:
- the child's place in the level: next time it starts again at its first item, with its introduction;
- the flames (`streak.drop()`), which otherwise carry over into the next level;
- the level's star and the next stone's unlock (stars are saved only when the reward opens);
- the reward itself, with the stickers flying into the book.

**How bad.** **Severe** means it can't be undone, or it changes what the child is taught. **Medium** means it throws away minutes of play or a moment that doesn't come back. **Low** means a detour that one tap, or just playing on, undoes.

**What should happen.** **Ask** means Sensei's spoken question (the confirm). **Undo** means no question, but a clear way back. **Grown-ups** means text for grown-ups, with a gate that a child can't pass by accident. **Fix** means taking away the cost, which is better than asking. **Nothing** means leave it as it is.

### 1.1 The inventory

| # | The action (where) | How it happens by accident | What it costs today | How bad | What should happen |
|---|---|---|---|---|---|
| 1 | **Going back to an earlier level on the map.** A tap on any open stone other than the glowing one (App `WorldMap`). This includes every stone in an earlier land (◀ by the banner), and stones ahead when a grown-up has turned on "Unlock every level". | The child aims at the glowing stone and hits a neighbour. Bamboo Village has 20 stones in three rows, about 145 px apart. Finished stones are 94 px wide, beside the 132 px glowing one. The ninja sprite (128 × 172) covers the top 70 % of the glowing stone, so the child reaches past it. The map redesign makes the target easier to hit; this question catches what's left. | The old level starts at once, and its introduction plays again. The child thinks the game has gone backwards. Stars aren't lost (`Math.max`). Leaving again needs Home, which drops the flames. There's also an edge case: replaying an old warm-up can move the glowing stone backwards (note a). | Low; Medium for note a | **Ask** (§1.2, `replay`). There are two picture answers. One is the tapped stone's own picture (play it again). The other is the green ▶, which is bigger, pulses and starts the next game. A tap on the backdrop, or Home, stays on the map. There's no question for the glowing stone, for the ninja (its shortcut) or for a locked stone (that still says `map_locked`). Story stones use the story wording (row 10). |
| 2 | **Home in the middle of a level** (Home in the nav layer calls `quitLevel`: the map of the land, or the title for a first-session lesson). | Home is always on top, top-left, 100 px, and acts on finger-down. The left hand holds the phone near it in landscape. Children mash while they wait (Sesame: they tap "too hard, long, or multiple times"). A child who wants "back" finds no Back during a turn, so taps Home. | The level's progress (see above). This grows as the level goes on: at item 1 almost nothing is lost, but near the end it's several minutes of play and the flames. In the first session, the lesson starts again from the title. | Low early; Medium late | **Ask** (§1.2, `leave`), but **only after the child has answered at least once in this level**. Before that there's nothing to lose, so Home leaves at once and stays an instant way out of a wrong stone. There's no question on a reward, on the finale, or right after Sensei's rest line (`tv_rest` offers Home). The level pauses under the question: its timers, a trial's charge and the lesson clock all stop. "Keep playing" puts the level back exactly as it was and asks the turn again. It would be better still to resume mid-level (Khan Academy Kids does; §2). Then Home could leave at once. |
| 3 | **Home during a level's finish.** This is the time after the last answer and before the reward: `useFinish` waits up to 2.5 s and then the ninja celebrates, and a battle's KO, blast-off, Baron's exit and `battle_win` take several seconds. | The child has won and taps Home ("it's done"), or mashes during the fireworks. | **The whole level.** `onDone` never runs, so the child gets no star, no unlock and no reward. The level counts as unplayed, and the flames go. | Medium: a finished level lost | **Fix**, with no question. Once the last answer is in, the level is won. Home then goes to the reward, or the star is saved before the celebration starts. |
| 4 | **Leaving a Gem Trial** (Battle with `trialGem`; Home goes to the World Flower). | As row 2. The charging monster and the bar add pressure, and a child who is losing may tap Home to get away. | The fight so far. The gem stays ready (quitting leaves its energy alone; only running out of hearts drops it to 60 %). An explanation cut off by Home plays again next time. | Low to Medium | **Ask**, as in row 2 (after the first answer), with the trial wording (§1.2, `leave-trial`). The picture answers are ▶ (keep battling) and the World Flower button's icon. The charge is frozen while Sensei asks. |
| 5 | **Leaving a boss** (Battle `boss`; Home goes to the map). | As row 2. | Up to 7 words (boss `hp` 7), Baron's scene again, and the flames. The boss is the land's big finish. | Medium | **Ask**, as in row 2 (§1.2, `leave`). |
| 6 | **The jump-ahead offer** (App `Reward`). After three perfect levels, a pulsing blue "Jump ahead" button sits in the nav row's **Show me again slot** (595, 646). It opens JumpAhead, where each option needs a 1.5 s press and hold. | The button is where the paw, "Show me again", always is, and it pulses. The backdrop closes the dialog, but a press and hold is a toddler's ordinary tap (TIDRC accepts taps up to 5 s long; Smyk: "a child's natural gesture is to tap and hold"). So a child who presses and holds an option jumps. | `placeAtUnit` moves the start forward. The child skips teaching, and gets petals and half-filled gems for sounds they haven't learned. **There's no undo**: nothing moves a child back, and "Start from here" only moves forward. The jump isn't logged either (`JumpAhead.jump` doesn't call `logAdjust`), so grown-ups can't see that it happened. | **Severe** | **Grown-ups**, not a child's question. Take the button off the child's screen. TEACHER_SCRIPT's `tv_jump_offer` already speaks to grown-ups ("Grown-ups, if this is too easy, you can jump ahead.") and makes the gear glow. Jumping then happens only on the grown-ups page, with a text confirm that names where the child will land, a line in the log, and an undo ("Move back to where they were", which restores `placedAt`). |
| 7 | **Switching profile** ("Who's playing?", Profiles.tsx). It opens on every launch (Start), after Home on the map (map, title, Start), and from the crash screen's "Choose player". | Siblings share a phone, and a 3-year-old taps the other child's card. Two Kai cards look alike, and the names are text. | The child plays on the sibling's save. The sibling's next stones get played, stars and learning records go to the wrong child, and both children's plans are thrown off. Going back (Home, title, Start, the right card) doesn't take back what was recorded. | Medium, and nobody notices | **Nothing** (no question). Sensei can't say a typed name, and "Is this you?" is a question a 3-year-old just says yes to. What helps instead is cards that look different (already the child's colour, initial and ninja). When only one player exists, Start could go straight in without "Who's playing?", which removes the accident in one-child homes. |
| 7b | **New player** (the ＋ card). Two taps on Go with an empty name make "Ninja N" (`tryGo`). | The child taps ＋ and then Go, Go. | A stray profile, and a new first session on it: the film, and the opt-in answered by a toddler. | Low to Medium | **Fix.** When other players already exist, an empty name keeps asking for a grown-up and never makes "Ninja N". Keep that fallback only for the first player on a device. |
| 8a | **Grown-ups: Delete player** (Grownups.tsx). The first tap arms it ("Tap again to delete … and all their progress", in red); a **second tap on the same button** deletes. | A double tap or a mash in one spot gets straight through. The armed state never times out. A child can reach this page (see 8e). | All of that child's progress. No undo. | **Severe** | **Grown-ups.** Text is fine, but the second step must be somewhere else: a separate "Delete" button that appears away from the first one, or typing the child's name. It should disarm after about 5 s or on any other tap. |
| 8b | **Grown-ups: Jump ahead.** One tap opens the dialog, and one tap on an option jumps (not gated here). | The same as 8a: two taps once a child is on the page. | As row 6: skipped teaching, and no undo. | **Severe** | **Grown-ups**, as in row 6: a text confirm, a log line and an undo. |
| 8c | **Grown-ups: Check the starting point.** This starts the placement quiz, which the child plays. The first miss ends it, and `placeAtUnit` **overwrites** `placedAt`, even with an earlier unit. | One wrong tap once the first stage is passed. (A miss in stage 1 leaves unit 0, which moves nothing.) | The start can move back, and stones that were open close again. It is logged. | Medium | **Grown-ups.** Say in text before it starts what the result does. Never move the start backwards without saying so; a quiz result should only move the start forward, unless a grown-up confirms. |
| 8d | **Grown-ups: Start from here** (2 s hold, forward only), **Unlock every level**, relaxed mode, captions, music. | | All can be switched back. With "Unlock every level" on, stones ahead are open too (row 1 covers them). | Low / none | **Nothing.** |
| 8e | **The grown-ups gear** (map top-right, and on the opt-in). Every press says `grownups`: "This part is for grown-ups. **Hold the button to open.**" | The line tells the child how to open the gate, and a 2 s hold is well within what a child does anyway. | It is the door to 8a–8c. | Medium | **Fix.** Say "This part is for grown-ups." and nothing more. The text hint "Grown-ups: press and hold" already tells the grown-up. |
| 9 | **Skipping the film** (`SkipFilm`: a text pill top-right; a 1 s press and hold, and a short tap shows "Grown-ups: press and hold"). | A 1 s press is an ordinary toddler tap (row 6). | The whole story: the World Flower, "every petal was a sound", and Baron's motive (the first battle then explains him). **The film can't be watched again** once the ninja is chosen, because Profiles only replays it while `seenIntro` is unset. | Medium | **Undo, and a longer gate.** Make it a 2 s hold, like the gear, with nothing said. Let the film be watched again (from the Sticker Book or the grown-ups page), so a skip can be undone by watching it. There's no Sensei question: this is a grown-up's control. |
| 10 | **Replaying a story.** A finished story stone on the map, the reward's ↻ "Play again", or ◀ Back inside a story. | The map tap happens as in row 1. On a reward, ↻ sits in the Back slot. | Time only. Reading a story again is good practice for fluency, and stars are kept. | Low | From the map: **Ask**, with the story wording (§1.2, `replay-story`). ↻ on the reward: **Nothing**; the undo is Home, which doesn't ask before the first answer. Back inside a story: **Nothing** (it never undoes a miss). |
| 11 | **↻ Play again on any reward** (a level reward, or the sticker reward of a warm-up replayed from the map). | A tap in the Back slot, which is where ◀ usually is. | The level again. Note a applies to warm-ups. | Low | **Nothing.** Home before the first answer undoes it at once. |
| 12 | **The cheat menu** (being built: FEEDBACK round 15, `src/cheat/`). The plan opens it with **five taps on the top-right corner**, backquote, or `?cheat=1`. | Five quick taps in a corner is exactly how a toddler mashes, and the map's gear is in that corner. | Save edits, jumps to any level, mastery presets and profiles. | **Severe** | **Fix.** No opening by taps a child can make. Keep `?cheat=1` and the key, or put its door inside the grown-ups page. |
| 13 | **Starting a Gem Trial or practice** from a petal (Tree `PetalDetail`), and **Sensei's Challenge** on the map. | A tap on a pulsing button. | A detour into a game. Home before the first answer leaves at once. | Low | **Nothing.** |
| 14 | **Next on a held step; Back.** | A tap on the green arrow once a step is ready. | A step moves on, and Back brings it back. A reward has no Back, but its Hear it again says everything again. | None | **Nothing.** Back is the undo. |
| 15 | **Home anywhere else**: before the map (the film, Choose, the opt-in, the welcome), on rewards, the World Flower and its trips, the Sticker Book, the finale, and the map (to the title). | As row 2. | Nothing is lost (NAVIGATION §3.3). The film starts again from shot 1, and a trip that was due stays due. Home on the map leads to "Who's playing?" (row 7). | None / Low | **Nothing.** |
| 16 | **Choose your ninja; the opt-in's class.** | A tap on a card. | Both are already a pick and then Next. The first check puts a wrong class right. A ninja can't be changed later. | Low | **Nothing.** (Low priority: grown-ups could be given a "change ninja".) |

**Note a: an accidental replay of a warm-up can move the child backwards.** After a warm-up played outside the first session, `StickerRoute` calls `warmupPace`. If the last two warm-ups up to this one both scored under 50 % and this one isn't marked `repeated`, it deletes this warm-up's star, and `frontier()` (the first level from `placedAt` with no star) goes back to it. The map then says "Let's practise that again!". A replay writes the new score over the old record (`s.warmups[id] = { first, total }`), which also drops `repeated`. So a child who started with the warm-ups (no `placedAt` past them) and is now beyond them, who mis-taps W2 and then taps at random (with a weak W1 score), finds the glowing stone back on W2. The question in row 1 makes this rare, but pacing should only run on a warm-up's first play: fix request in docs/fix-requests.md.

### 1.2 Sensei's questions (proposed wording)

These are proposals for the lines lane, to finalise against TEACHER_SCRIPT §0.1 and SCRIPT_STYLE §T: whole sentences, calm, and "?" only for a question the child can answer. In the teacher voice the green arrow already means "carry on, I'm ready", so ▶ is always the answer that keeps the child going. The other answer is a picture of where the tap would take them: the map's house, the old stone's picture, or the World Flower. Following Living Books (§2), each answer says what it does as it is chosen.

| Key | When | Sensei says | Answers (pictures), and what each says as it's chosen |
|---|---|---|---|
| `replay` | row 1 | "You've played this game before. Do you want to play it again? Tap its picture. Or tap the green arrow for your next game." | the tapped stone's picture: "Let's play it again." · ▶: "Off to your next game!" |
| `replay-story` | row 10 | "You've read this story before. Do you want to read it again? Tap the book. Or tap the green arrow for your next game." | the story's picture: "Let's read it again." · ▶: as above |
| `leave` | rows 2 and 5 | "Do you want to stop this game? Tap the house to go to the map. Or tap the green arrow to keep playing." | the house: "Okay. Your ninja will wait for you on the map." · ▶: "Let's keep going." |
| `leave-first` | row 2, a first-session lesson (Home goes to the title) | "Do you want to stop for now? Tap the house. Or tap the green arrow to keep playing." | the house: "Okay. Your ninja will wait for you." · ▶: as above |
| `leave-trial` | row 4 | "Do you want to stop the gem battle? Your gem will wait for you. Tap the flower to go back. Or tap the green arrow to keep battling." | the flower: "Okay. Back to the World Flower." · ▶: "Let's keep going." |

What every question must do (from the inventory and §2):
1. **Ask only when there is something to lose** (rows 1, 2, 4, 5, and the story in row 10). A question that costs nothing teaches children to tap through it.
2. **The answer that keeps playing is the default.** It is bigger, green, glowing and has the pointing hand on it. The costly answer is smaller. Doing nothing never picks either one: the idle ladder of NAVIGATION §3.2 glows at 8 s and asks again at 16 s and 40 s (rule 5: no timer moves on).
3. **Resist mashing.** Neither answer sits where the tap that opened the question landed. Taps in the first ~400 ms after the question appears are ignored. **Home does nothing while a Home question is open**, so a second tap on Home can't answer "yes" (Sesame's "double tap to prevent accidental navigation" fails when children tap repeatedly).
4. **Hear it again** replays the question, and Help points at ▶. The question is a modal nav entry (`useNav({ modal: true })`, like JumpAhead), so nothing underneath takes taps.
5. **Grown-up actions** (rows 6, 8, 9) use text, not Sensei. Their gates must be something a 3-year-old doesn't do by accident: not a press and hold alone, and never a second tap in the same place.

---

## 2. Prior art

### 2.1 Research and guidelines

- **Sesame Workshop, "Best Practices: Designing Touch Tablet Experiences for Preschoolers" (2012).**
  - "It is a good idea to require confirmation when a major program consequence will result, such as deleting a picture … an additional confirmation overlay (e.g., Are you sure? Yes or No) that is color-coded and utilizes recognizable icons (e.g., green check mark and red 'X')."
  - It suggests "only using double tap to prevent a child from accidental navigation (e.g., leaving an activity, accessing parent content)".
  - It warns that children rest their wrists on the screen's bottom edge and "bump" out of an activity.
  - Other points: register input on touch, not on lift; children tap "too hard, long, or multiple times"; help should be spoken and in context, not text; time-outs come after 6–8 s in games.
  - Purchases and parent links belong in a Parents section behind a "baby gate".
- **Charlotte Tang and colleagues, "Mommy! Which one should I choose? Exploring the Design of Dialog Boxes for Children" (UBC, a field study of Tux Paint's dialogs with children aged 3–12).**
  - Pre-readers didn't link a dialog to the tap that caused it ("causality"), and didn't see that the software was talking to them ("purpose").
  - Children "were found to prefer 'green' choices or the first option", and were then surprised by what happened ("consequence").
  - The proposals: a comic-style call-out from the mascot; the question from the mascot and the answers from the child's own icon; colour coding with the safe choice highlighted and shown first; a safe "I don't know" button; and an icon on every button.
  - They left out audio on purpose, for noisy public settings. Our game is built on speech, so Sensei asking fills exactly the gap they left.
- **Hiniker et al., "Touchscreen prompts for preschoolers" (IDC 2015; 34 children aged 2–5).**
  - Children under 3 couldn't follow in-app audio prompts. Between 3 and 3½ they became able to follow in-app audio and on-screen demonstrations.
  - Glowing and pulsing ("visual state changes") drew attention but didn't show where or how to touch. A hand demonstration did.
  - So the question needs the pointing hand on the answer, not only a glow, and our youngest (3.0) will sometimes need a grown-up.
- **Soni et al., "A Framework of Touchscreen Interaction Design Recommendations for Children" (TIDRC, IDC 2019).**
  - "Accept tap times up to 5 seconds long … for children ages 2 and above."
  - "Avoid adding the double tap gesture for children ages 5 and under."
  - "Provide audio prompts with visual support because children do not pay attention to audio prompts alone."
  - Put the key words at the end of the sentence.
  - With the Smyk article below, this is why a 1–1.5 s press and hold (Skip film, Jump ahead) is not a gate against children.
- **Smyk, "Design Considerations for Little Fingers" (Paul Olyslager, 2013).** "A child's natural gesture is to tap and hold, rather than tap and release." Also: "One of the major problems for children is … ending the engagement … by accidentally removing themselves from the experience."
- **When to ask at all.** Needless "Are you sure?" dialogs train people "to unthinkingly click the default option". Word asks only when there are unsaved changes ("Coyote Tracks", 2011). Games add exit confirms "because misclicks", not to keep people playing (r/gamedev).

### 2.2 Children's apps and games

| Title | How it asks, or avoids asking | What we take |
|---|---|---|
| **Living Books** (Broderbund, 1990s; *Just Grandma and Me*, *Arthur's Teacher Trouble* …) | The closest match. The book's character **asks aloud**: "Are you sure you want to quit?". The two answers are **two characters from the story**, and each says its outcome when chosen: "Let's go back to the story!" / "Okay, goodbye. Come see me again!". *D.W. the Picky Eater* names both paths: "If you want to say goodbye, click 'Quit'. Or if you want to keep playing, click 'Stay'." | A spoken question from the guide; picture answers that each say what they do; "keep playing" framed as the friendly choice. |
| **Khan Academy Kids** | It makes leaving cheap instead of asking: "If students get interrupted while playing on the Learning Path, they will automatically start at the next lesson upon returning to the app." Its confirms are for grown-ups. Deleting a user takes the "Grown-Ups Only" gate, then "Enable Delete", then the ✕ on the avatar: steps in different places. Its help centre tells parents to check that a new profile "hasn't been inadvertently created". I found no spoken "are you sure?" when a child leaves an activity (not verified in the app). | Resume mid-level so Home costs nothing (row 2's long-term fix). Destructive grown-up steps go in different places (row 8a). Stray profiles are a known accident (row 7b). |
| **Duolingo** (the grown-up app) and **Duolingo ABC** (ages 3–8) | Duolingo asks, in text, before a lesson is abandoned mid-way: going back "says that I'll quit and I'll lose my progress"; the Android app "asks you if you really mean to quit the lesson". Duolingo ABC keeps settings and data deletion on "a special settings screen meant to be accessible only by adults". I couldn't confirm what ABC does when a child leaves mid-lesson. | The lesson-exit confirm is a standard in learning apps. ABC shows the grown-ups/child split. |
| **Nintendo** | Kirby: "If you are in a stage you have already cleared, you must select either CONTINUE or EXIT STAGE": in the classic games, leaving a stage was offered only once it cost nothing. *Super Mario Bros. Wonder* autosaves when you leave an unfinished course, so leaving loses the attempt but never the save. Switch titles skip cutscenes on a **held** + button (*Metroid Dread*, *Pokémon Legends: Z-A*); game-design write-ups on hold-to-skip suggest about a second, a filling ring, and a hint after a short press. | Ask only when there's a cost; otherwise just leave (row 2's "after the first answer" rule). Hold-to-skip is a good pattern for adults with a controller, but too weak against toddlers on a touchscreen (row 9). |
| **Toca Boca** (Toca Kitchen, Hair Salon, Toca Life) | "There are no levels, no winners and no high scores". The apps "have almost no words", and there are "no wrong moves: you can cut, color, wash, style … then start all over again". With nothing to lose there's nothing to confirm. The one gate is for grown-ups: Toca Tea Party uses a text link and a modal with written instructions, and a large ✕ takes the child back to play. | Prefer making a tap free over asking about it. Grown-up gates can be text-based, with an obvious way back for the child. |
| **Hey Duggee: The Counting Badge** (BBC) | Asks "are you sure?" when the child exits (from a parent's review, which also found that "yes" did nothing: an untested confirm is worse than none). | Test the question with bots and the sweep. |
| **Parents' expectations** (a Baby Panda review) | "Many games ask 'are you sure?' or require an answer to a math question to exit. This game is easily restarted and it's becoming frustrating. Please … implement another step before exiting." | Parents notice accidental exits and expect protection. |

### 2.3 What we take

1. **The best confirm is no cost at all** (Toca Boca, Khan Academy Kids, Nintendo). Rows 3, 7b, 8e and 12 are fixes, not questions. Resuming mid-level would retire row 2's question later.
2. **Ask only when there's something to lose** (Kirby, Word): rows 1, 2, 4, 5 and 10, with row 2 only after the first answer.
3. **Sensei asks aloud, and the answers are pictures of outcomes that say what they do** (Living Books). A yes/no to "Do you want to stop?" is hard for a 4-year-old.
4. **The safe answer is green, first, highlighted and pointed at** (Tang and colleagues; Sesame's colour coding; Hiniker's hand). Pre-readers pick green, so green must be the answer that keeps them playing.
5. **Guard against mashing and holding, not just single taps** (Sesame, TIDRC, Smyk). Answers go away from the tap that opened the question, early taps are ignored, and Home is inert under a Home question. Grown-up gates need more than a press and hold, and never a second tap in the same place.

**Sources**
- Sesame Workshop, [Best Practices: Designing Touch Tablet Experiences for Preschoolers](https://regmedia.co.uk/2012/12/19/sesame_street_best_practices.pdf) (2012)
- Tang et al., [Mommy! Which one should I choose? Exploring the Design of Dialog Boxes for Children](https://www.cs.ubc.ca/labs/edapt/papers/tang2013.pdf)
- Hiniker et al., [Touchscreen prompts for preschoolers](http://faculty.washington.edu/alexisr/TouchscreenPrompts.pdf) (IDC 2015)
- Soni et al., [A Framework of Touchscreen Interaction Design Recommendations for Children (TIDRC)](https://init.cise.ufl.edu/wp-content/uploads/sites/378/2019/04/TIDRC-Framework-soni-et-al-IDC19-final.pdf) (IDC 2019)
- Smyk, [Design Considerations for Little Fingers](https://www.paulolyslager.com/design-considerations-little-fingers/) (2013)
- [Are You Sure You Want to Read This Blog Post? (y/n)](https://kagan.mactane.org/blog/2011/02/09/are-you-sure-you-want-to-read-this-blog-post-yn/) (2011); [Is an "Exit Confirmation" dialog worth it?](https://www.reddit.com/r/gamedev/comments/makwoy/is_an_exit_confirmation_dialog_worth_it/)
- [Quit Animations, Living Books Wiki](https://livingbooks.fandom.com/wiki/Quit_Animations)
- Khan Academy Kids help centre: [learning path and progress](https://khankids.zendesk.com/hc/en-us/articles/360041615571-How-does-the-learning-level-adjust-and-how-do-I-view-my-child-s-progress), [delete a user](https://khankids.zendesk.com/hc/en-us/articles/360006763332-How-do-I-delete-a-user), [using it in educational settings](https://khankids.zendesk.com/hc/en-us/articles/360014856151-Learning-Topics-Using-Khan-Academy-Kids-in-Educational-Settings)
- Duolingo: [r/duolingo, "Please help me"](https://www.reddit.com/r/duolingo/comments/1f7koba/please_help_me_guyd/), [r/duolingo, a 2013 suggestion thread](https://www.reddit.com/r/duolingo/comments/1p5hdh/suggestion_when_practising_i_sometimes_accidently/), [Duolingo ABC privacy](https://de.duolingo.com/abc-privacy)
- Nintendo: [Kirby Wiki, Pause Screen](https://kirby.fandom.com/wiki/Pause_Screen); [Game8, Super Mario Bros. Wonder saving](https://game8.co/games/Super-Mario-Bros-Wonder/archives/430502); [Twinfinite, Metroid Dread skipping](https://twinfinite.net/guides/metroid-dread-how-to-skip-cutscenes/); [r/LegendsZA, hold + to skip](https://www.reddit.com/r/LegendsZA/comments/1rjguqb/you_can_skip_the_hyperspace_cutscene/); [Hold to Skip, gamedesignreviews](http://gamedesignreviews.com/scrapbook/hold-to-skip/)
- Toca Boca: [The New Yorker, How to Make a Great Kids' App](https://www.newyorker.com/culture/culture-desk/how-to-make-a-great-kids-app) (2013); [Crossplay, Toca Boca and the digital dollhouse](https://www.crossplay.news/p/toca-boca-gender-norms-and-the-rise) (2023); Tea Party's gate via Smyk above
- [Hey Duggee: The Counting Badge reviews](https://allbestapps.net/android/hey-duggee-the-counting-badge); [Baby Panda's Train reviews](https://play.google.com/store/apps/details?id=com.sinyee.babybus.trainII&hl=en)

---

## 3. API and usage

**Status:** built on 27 September 2026 by the confirm builder: `src/ui/Confirm.tsx`, `src/styles/confirm.css`, the unit tests `src/ui/confirm.test.ts`, and the demo scene `src/scenes/ConfirmDemo.tsx`. The same day, after the judge's round, the answers were changed to the map's pattern (§3.7, decision 1): YES is a picture of where the tap goes, and NO is the green ▶, "keep playing". It isn't wired into the game yet. The call sites below are fix requests (docs/fix-requests.md, "Map redesign and confirm (27 Sep)"), because App.tsx and the scenes belong to the fix workflow.

### 3.1 What the child sees and hears

The screen dims. Sensei's face appears with a speech bubble, and the two answers sit above or below them:

- **NO: the green ▶**, the game's own Next, meaning "keep playing". It is the safe answer, so it is the one a pre-reader is drawn to (§2.1, Tang):
  - it is the bigger answer (252 stage px, 124 CSS px at 844×390);
  - it is green, on the right where Next always is;
  - it pops in first;
  - the child's own ninja stands beside it giving a thumbs up (`public/a/i/hero_<kai|suki>_thumbsup.webp`);
  - it is the one that glows and gets the pointing hand.
- **YES: a picture of where the tap goes**, in a quiet cream circle on the left (216 stage px, 107 CSS px): the house (the Home button's own glyph) when leaving a level, the World Flower when leaving a Gem Trial, the stone's own picture on the map.
- **Sensei's bubble** shows what the question is about: the level being left, or the boss. It never shows the same picture as an answer. On the map, YES is the stone's picture, so the bubble shows her "?". It is smaller than the answers (its picture is 150 stage px), so the biggest pictures on screen are the ones that answer.

Sensei asks, then names the answers by their pictures, the ▶ last: "Tap the house to go home. Or tap the green arrow to keep playing." Each answer gets a warm-white spotlight as it is named. A tapped answer swells and says what it does ("Okay. See you soon!", "Let's keep going!"). Then the question closes, and the promise resolves.

**What every other tap does:**
- **A tap off the answers** (the backdrop, Sensei's face, her bubble) shows the way. The hand and the glow come onto the ▶ at once. If Sensei is quiet, she names the answers again (at most every 6 s); a tap on her face gets the whole question.
- **Home**, under a question whose YES is where Home goes (the leave questions), never answers. After 2.5 s it points at the house: the hand and the glow go to YES, and Sensei says "To go home, tap this house." (or "To stop for now, tap this flower."; said when she's quiet, at most every 4 s). So a child who wants to leave is shown the way, and a child mashing Home never leaves. Under the map's question, Home is NO after 2.5 s: the map stays as it was.

| | |
|---|---|
| ![](../playtest/confirm/shots/20-leave-open.png) | ![](../playtest/confirm/shots/21-leave-home-nudge.png) |
| Home after an answer: `leave`. The level (First Sounds' mat) in the bubble, the house on YES, the ▶ with the ninja | Home again: it doesn't answer. The hand and the glow go to the house: "To go home, tap this house." |
| ![](../playtest/confirm/shots/08-replay-glow.png) | ![](../playtest/confirm/shots/28-leave-trial.png) |
| The map's question, 8 s of quiet: only the ▶ glows and hops, with the hand. The stone's picture is YES, so the bubble shows "?" | The Gem Trial: the guardian in the bubble, the World Flower on YES, "…or tap the green arrow to keep battling" |

### 3.2 The API

```ts
import { confirm, confirmWith, QUESTIONS, ConfirmLayer, useConfirmOpen, cancelConfirm } from "../ui/Confirm";

confirmWith(QUESTIONS.leave({ pic: img(levelIcon(lv)) }))   // → { yes, how }
confirm(o: ConfirmOpts): Promise<boolean>                  // true only for YES

QUESTIONS.replay(o?)      // "You've played that game before. Do you want to play it again?" YES: the stone's picture (pass it as `pic`)
QUESTIONS.leave(o?)       // "Do you want to stop this game and go home?" YES: the house. Home points at it
QUESTIONS.leaveFirst(o?)  // the same, id "leave-first" (a first-session lesson: its Home goes to the title)
QUESTIONS.leaveBoss(o?)   // "Do you want to leave the boss battle? You can come back any time."
QUESTIONS.leaveTrial(o?)  // "Do you want to stop the gem battle? Your gem will wait for you." YES: the World Flower
// each takes the call site's own values on top (pic, from, slots, …; its `yes` and `no` are merged into the preset's)

interface ConfirmOpts {
  id: string;                         // "replay", "leave", "leave-first", "leave-boss", "leave-trial"
  ask: Say | Say[];                   // Sensei's question: whole recorded lines (a { word } or { sound } may follow one)
  how?: Say[] | null;                 // names the answers by their pictures; default tv_confirm_how_pic
  again?: Say[];                      // the 16 s re-ask; default the question and `how` again
  pic?: string | ReactNode;           // the bubble's picture; default slots.word's picture, else "?" (never YES's picture)
  slots?: { game?: GameId; word?: string };  // the templated-speech hook (below)
  yes?: { pic?: string | ReactNode;   // where YES goes; default the question's `pic` (then the bubble shows "?")
          say?: Say[] | null;         // said as it is tapped; default tv_confirm_yes "Yes, please!"
          nudge?: Say[] };            // with home: "yes", said on a Home tap; default the `how` line
  no?:  { say?: Say[] | null };       // the ▶; default tv_confirm_keep "Let's keep going!"
  home?: "no" | "yes";                // "no" (default): Home is NO after homeGuardMs. "yes": Home points at YES, never answers
  from?: Element | { x: number; y: number } | null;   // where the opening tap landed: the answers go elsewhere
  timeoutMs?: number | null;          // game ms of quiet before it counts as NO; default 40 000; null: never
  guardMs?: number;                   // taps on the answers ignored for this long after opening; default 700
  homeGuardMs?: number;               // Home ignored for this long; default 2 500
}
// (yes.look "pic" and no.look "next" are still accepted, and are the only looks)

<ConfirmLayer />                      // once, in App, inside the Stage, after <NavLayer/>
useConfirmOpen(): boolean             // a scene's own timers wait while a question is up (a battle's charge)
isConfirmOpen(), onConfirmOpen(fn)    // the same, outside React
cancelConfirm()                       // closes it as "cancel" (App calls it when the route changes)
confirmNow()                          // { id, ready, point, tap("yes" | "no" | "home"), show(where) } | null: bots, tests
pictures(o)                           // { yes, bubble }: what will be drawn (bubble null = "?")
```

**How each answer resolves.** A tap on YES gives `{ yes: true, how: "yes" }`. A tap on the ▶ gives `how: "no"`. Home gives `"home"` (only where Home isn't YES), 40 s of quiet gives `"timeout"`, and a replacement or `cancelConfirm()` gives `"cancel"`. All of these except YES are `false`. A call site whose ▶ does something (the map's ▶ starts the next game) checks `how === "no"`, so Home and waiting only close the question.

**The rules it keeps** (§1.2's list and §2.3, as built):
1. **The safe answer is the one a pre-reader picks.** The ▶ is green, bigger, gets the ninja's thumbs up, the glow and the hand, and is named last (TIDRC: the key words at the end). YES is a quiet cream picture of where it goes. Every way out that isn't a tap on YES is NO, so nothing costly is ever picked by waiting.
2. **The idle ladder** (NAVIGATION §3.2, in game time, counted only while Sensei is quiet and the phone is sideways): at 8 s the ▶ glows and hops with the hand on it (YES stays still). At 16 s Sensei asks again. At 40 s the question closes as NO (or, with `timeoutMs: null`, she asks again). Any tap starts the ladder again.
3. **A wrong tap teaches the right one** (as on the map, MAP_DESIGN §2.7). A tap off the answers brings the hand and the glow onto the ▶ at once, and she names the answers again if she's quiet. It no longer only resets the ladder, which kept a child who tapped the bubble from ever seeing the hand.
4. **Mashing.** For the first 700 ms, taps on the answers are ignored. Home is ignored for the first 2.5 s, so the taps that opened the question can't close it, or point at the house. The answers are drawn above or below the question, whichever is farther from where the opening tap landed (`from`; the leave presets pass Home's centre), so the same spot tapped again hits the backdrop.
5. **Hear it again and Help.** The speaker beside the bubble (`data-nav="again"`) says the question again. Help (the dimmed Sensei in the corner, or `pressHelp()`) says it again on the first press. Later presses point at the ▶ and ask again.
6. **The screen underneath pauses.** Its speech waits at its next clip. This is audio.ts's `pauseSpeech`, as when the phone is turned upright, and a clip that was cut off is said again after NO. Lesson clocks stop, and the music ducks to 35 %. The nav layer shows only Home: the question is a modal entry with its own Hear it again. On YES, the line waiting underneath is dropped (`hush()`), because the screen is being left. Sensei's own lines play outside the game's speech queue, like the turn-your-phone line. So they never wait at that gate, never go into Hear it again's register, and a scene's `hush()` can't cut them off. A scene with its own timers waits on `useConfirmOpen()`.
7. **For bots and the sweep.** While the question is up, `window.__snState` is `{ scene: "confirm", id, ready, safe: "no", home, point, yes: "Yes", no: "No", layout, slots, chosen }` (`point`: what the hand is on). The screen's own state is kept underneath and comes back when the question closes, even if the screen re-rendered meanwhile. The answers are `[data-confirm="yes"]` and `[data-confirm="no"]` (aria-labels "Yes" and "No"; NO is the ▶), and the bubble is `[data-confirm-bubble]`. `__snNavLog` gets `{ kind: "step", id: "confirm:<id>", to: 0 }` when the question opens and `{ from: 0, to: null, via: how }` when it closes. `__audioLog` entries for Sensei's lines carry `confirm: true`.
8. **Performance.** Nothing asks for animation frames while the question waits: 0 `requestAnimationFrame` calls in 2 s, measured. Every animation is transform or opacity (measured: `scale`, `translate`, `opacity`, `transform`). The glow and the spotlight are static shadows whose opacity changes. The ladder is one timeout at a time, with no polling. Sensei's mouth is two stacked mouth images whose opacity steps while she talks.

**The templated-speech hook.** `ask` is a `Say[]`, so a question can already end on a word clip (`[{ line: … }, { word }]`). `slots` carries the values a template line will fill (`{game}`, `{word}`: docs/speech-templates/inventory.md) once the renderer lands. Until then they are published in `__snState`, and `slots.word` supplies the bubble's picture.

### 3.3 The call sites (§1, rows 1, 2, 4, 5 and 10)

Each of these is also a request in docs/fix-requests.md. `Icon` and `img` come from `src/ui/ui`. `onAttempt` comes from `src/engine/store` ("every recorded answer"). `replayTold` comes from `src/ui/nav`.

**Rows 1 and 10: a finished stone on the map** (App `WorldMap`, the stone's `tapProps`). The map's own call is `ask()` in docs/MAP_DESIGN.md §7, which the map lane keeps in step with this API (the stone's picture on YES only, the map's own lines, `tv_confirm_play_again` as the fallback question). The glowing stone, the ninja and a locked stone never ask. The ▶ there is "your next game": `r.how === "no"` starts it. The plain form, without the map's own lines:

```tsx
confirm(QUESTIONS.replay({ pic: img(icon), from: el })).then((yes) => yes && onLevel(l.id));
```

**Rows 2, 4 and 5: Home in a level, after the child's first answer** (App `homeFor`, `case "level"`, in place of `() => quitLevel(r.id)`). Before the first answer, Home still leaves at once:

```tsx
let levelAnswers = 0;                                  // module scope; go() sets it to 0 on every route change
onAttempt(() => void levelAnswers++);                  // once, at module scope (every recorded answer)

const leaveLevel = (id: string) => {
  if (!levelAnswers) return quitLevel(id);             // nothing to lose yet
  const lv = levelById(id);
  const ask = lv.trialGem ? QUESTIONS.leaveTrial                                        // row 4: YES is the World Flower
    : lv.kind === "boss" ? QUESTIONS.leaveBoss                                           // row 5
    : store.get().firstSession?.lessons.includes(id) ? QUESTIONS.leaveFirst : QUESTIONS.leave;  // row 2: YES is the house
  void confirmWith(ask({ pic: img(levelIcon(lv)) })).then((r) => {
    if (r.yes) quitLevel(id);
    else if (r.how === "no") void replayTold();        // "Let's keep going!": the turn's question again
  });
};
```

Home under these questions belongs to the question (it points at the house or the flower), so the call site needs nothing for it. `levelIcon(lv)` is a small helper to write: the map's own picture for the level (`KIND_ICON[lv.kind]`, or `mon_<monster>` for a battle). There's no question on a reward, on the finale, or right after Sensei's rest line (`tv_rest` offers Home).

**Also asked for** (not call sites, but needed):
- App renders `<ConfirmLayer />` after `<NavLayer/>`, and calls `cancelConfirm()` in `go()`.
- The demo is routed as `?scene=confirm-demo`.
- Battle's charge waits on `useConfirmOpen()`.
- bot.ts answers `scene: "confirm"` with the ▶ (`[data-confirm="no"]`).

### 3.4 Trying it: the demo and its standalone page

`src/scenes/ConfirmDemo.tsx` shows the confirm where it will be used:
- `?cf=map` (the default): some of Bamboo Village's stones, with the map's own pictures. The glowing stone starts at once. A finished stone, or the story, asks `QUESTIONS.replay`.
- `&look=map`: the map redesign's own lines instead. Each stone asks its own kind's question (`tv_map_replay_picread`, `_firstsound`, `_swap`, `_story`), then `tv_map_replay_how`. (It used to ask every stone about Sound Swap.)
- `?cf=level|boss|trial|first`: a turn with three pictures. Home leaves at once before the first answer. After it, Sensei asks, and Home points at the house.
- `&open=<id>`: opens that question after the first tap.
- `&auto=1`: leaves the ConfirmLayer out, to test the self-mount.

`window.__cfDemo.results` lists the answers. Until App routes it, it runs on its own page, a frozen build with its own entry, never the dev server:

```sh
./node_modules/.bin/vite build --config playtest/confirm/vite.config.ts   # → playtest/runs/confirm/dist
bun playtest/confirm/serve.ts --port 4967                                  # the build, plus /a/ from public/
bun playtest/confirm/shoot.ts --port 4967                                  # 31 screenshots and 23 checks at 844×390
bun test ./src/ui/confirm.test.ts
```

### 3.5 The lines

Two blocks at the end of `LINES`: `// --- Confirm (docs/CONFIRM.md, 27 Sep)` and `// --- Confirm, fix round`. They were recorded with `gen-audio.ts lines --only …`, and the judge gave every one 10 out of 10. Their tags are in `src/core/content/line-tags.ts` (purpose `meta`, or `instruction` for the lines that name the answers), and their lengths are in `public/a/durations.json` (`bun playtest/confirm/durations.ts`, for these ids only). The QA is `playtest/confirm/qa.py`, with the results in `playtest/confirm/logs/qa.json`: a blind Whisper `small.en` transcript matched word for word, the pace (at most 3.3 words a second), and the loudness (−16 LUFS, or −19 for a clip under 1.2 s, by the gen-audio rule). All 12 lines in use pass. The judge's phonetics are British on every clip: /əʊ/ in "go", "home", "okay" and "arrow"; /ɒ/ in "want", "stop" and "boss"; and non-rhotic "flower" /flaʊə/ and "before" /bɪfɔː/.

**What the confirm says:**

| id | text | s | words/s | stretched | Whisper |
|---|---|---|---|---|---|
| tv_confirm_leave | Do you want to stop this game and go home? | 3.06 | 3.26 | ×1.25 | ✓ |
| tv_confirm_leave_boss | Do you want to leave the boss battle? You can come back any time. | 4.30 | 3.25 | ×1.10 | ✓ |
| tv_confirm_leave_trial | Do you want to stop the gem battle? Your gem will wait for you. | 4.31 | 3.25 | no | ✓ |
| tv_confirm_play_again | You've played that game before. Do you want to play it again? | 3.69 | 3.25 | no (0.22 s at the full stop) | ✓ |
| tv_confirm_how_home | Tap the house to go home. Or tap the green arrow to keep playing. | 4.30 | 3.26 | no | ✓ |
| tv_confirm_how_flower | Tap the flower to stop for now. Or tap the green arrow to keep battling. | 4.70 | 3.19 | no | ✓ |
| tv_confirm_how_pic | Tap the picture for yes. Or tap the green arrow to keep playing. | 4.27 | 3.05 | no | ✓ |
| tv_confirm_yes | Yes, please! | 1.04 | 1.92 | no | ✓ |
| tv_confirm_keep | Let's keep going! | 1.16 | 2.59 | no | ✓ |
| tv_confirm_bye | Okay. See you soon! | 1.61 | 2.48 | no | ✓ |
| tv_confirm_home_nudge | To go home, tap this house. | 2.08 | 2.88 | no | ✓ |
| tv_confirm_flower_nudge | To stop for now, tap this flower. | 2.29 | 3.06 | no | ✓ |

**Superseded** (nothing calls them; the lines' owner can retire them, fix request): `tv_confirm_no` ("No, thank you."), `tv_confirm_how` ("Tap the tick for yes, or the arrow to go back."), `tv_confirm_again` ("Do you want to do that? Tap the tick…") and `tv_confirm_replay` ("Do you want to go back and play this game again?"). Between them, "go back" meant YES in one line and NO in the next.

**Stretched clips.** gen-audio slows a word-perfect take that is still faster than 3.3 words a second with Praat's PSOLA (up to ×1.5). The new lines were written so none needed it: the first take of "Do you want to play that game again?" needed ×1.5, so the line became two sentences with a natural pause. Two lines in use are stretched (`tv_confirm_leave` ×1.25, `tv_confirm_leave_boss` ×1.10), and so are 12 of the map's (×1.03–1.36). **The Gemini judge can't hear stretching**: in `playtest/confirm/listen.ts` it gave 10 to every stretched clip, to the unstretched controls, to an ffmpeg `atempo 0.55` copy (twice), and 10 then 7 to a PSOLA ×2.2 copy (`logs/listen.json`). Its 10/10 therefore says nothing about artefacts, and a person has to listen: `open playtest/confirm/listen.html` plays the ruined calibration clips first, then every stretched clip (about 2 minutes). The map lane found the same with an A/B test and a control (MAP_DESIGN §12.2): the judge "finds" slowing even between two untouched takes. Re-taking doesn't help (the voice says these short questions at about 4.4 words a second); if a clip sounds drawn out, the fix is a new line with two short sentences, as `tv_confirm_play_again` was done. The same run gave IPA and an accent verdict for the three clips whose report had a plain-text transcript: `tv_confirm_leave_boss` /duː juː wɒnt tə liːv ðə bɒs ˈbætl̩ …/, and the map's `tv_map_replay_ears` and `_sort`, all "Southern British" (10).

### 3.6 Evidence

- **Unit tests** (`bun test ./src/ui/confirm.test.ts`): 14 pass. They cover:
  - YES (the house: "Okay. See you soon!") and NO (the ▶: "Let's keep going!");
  - Home under the map's question (NO), and under a leave question: ignored in its guard with no hand, then the hand on the house and the nudge, held until Sensei stops, at most every 4 s, never an answer;
  - the trial's flower and its nudge;
  - taps off the answers: the hand on NO at once, `how` again, at most every 6 s, the whole question for her face;
  - the guard, the timeout (the hand on NO at 8 s, the question and `how` again at 16 s), a cancel, a repeated question;
  - what the screen underneath is told, and `__snState` kept and restored;
  - where the answers are drawn, that the ▶ is bigger than YES, and that YES is ≥ 96 CSS px at the smallest stage scale;
  - that the bubble never shows YES's picture;
  - the wording: no preset line says "go back", and every `how` names the ▶ as "keep playing" (or "keep battling").
- **Typecheck** (`tsc -p tsconfig.app.json`) and **oxlint** are clean on these files. `content.test.ts`: 15 of 15 (27 Sep, after the fix round), with all 16 `tv_confirm_*` lines tagged.
- **The evidence run** (`playtest/confirm/shoot.ts`, 844×390 with touch, a frozen build): 31 screenshots in `playtest/confirm/shots/`, and 23 checks, all passing (`logs/shoot.json`, `checks`):
  - the answers are 107 (YES) and 124 (▶) CSS px; the ninja stands by the ▶ and covers neither;
  - the map's question: the bubble shows "?", not the stone's picture again;
  - mashing the opening spot never answers;
  - 0 animation frames in 2 s of waiting, transform and opacity only;
  - 8 s of quiet: the hand and the glow on the ▶ only (the ▶'s `::after` runs `cf-glow`, YES's runs none);
  - a tap on the bubble: the hand on the ▶ and `tv_confirm_how_pic` said;
  - Home in its guard is ignored; after it, under the map's question, Home is NO;
  - `look=map`: the fish-dog, mat, scroll and story stones ask `tv_map_replay_picread`, `_firstsound`, `_swap` and `_story`; the ▶ says `tv_map_replay_next`;
  - a level: Home before the first answer leaves at once; after it, `tv_confirm_leave` then `tv_confirm_how_home` (no "go back"); the level in the bubble is smaller than YES's picture;
  - Home under `leave`: still asking, the hand on the house, `tv_confirm_home_nudge` said; Help's second press puts the hand on the ▶; the ▶ keeps playing; the house says `tv_confirm_bye` and leaves;
  - the trial: Home points at the flower and says `tv_confirm_flower_nudge`;
  - 40 s of quiet (at `?fast=8`): NO, as `timeout`.
- The previous round's screenshots and log are in `.trash/confirm-shots-before-fix-*` and `.trash/confirm-shoot-before-fix.json`.

### 3.7 Decisions (made without asking; to copy into docs/DECISIONS.md)

1. **The answers follow the map's pattern, not a tick and a back arrow** (changed after the judge's round, 27 Sep). YES is a picture of where the tap goes; NO is the green ▶, "keep playing". The first build kept the brief's green tick for YES and a blue back arrow for NO, which pulled pre-readers towards the costly answer (green, the child's own ninja, the glow), and made "go back" mean YES in one line and NO in the next. §1.2 and §2.3 rule 4 had already said the safe answer must be the green one. The tick survives only as the fallback picture for a YES with none, in gold.
2. **Waiting counts as NO at 40 s** (the brief), where §1.2 said "never picked by waiting". NO leaves everything as it was, so waiting still never does the costly thing. The timeout is logged as `via: "timeout"`, not as a step that moved on.
3. **Home under a leave question points at the house and never answers** (changed after the judge's round). Before, Home was NO after 2.5 s. A child who wanted to leave pressed Home again and closed the question, then opened it again with the next press, and the gold Home house meant the opposite of the house on YES. Letting a later Home tap count as YES was the other option. It was turned down because a child mashing Home for 2.5 s would then leave (Sesame: double taps fail against repeated tapping). Home still answers NO where it isn't YES's destination (the map's question: Home keeps the map).
4. **A tap off the answers shows the way** (changed after the judge's round; it used to do nothing). The hand and the glow go to the ▶, and she names the answers again if she's quiet, at most every 6 s. This is the map's rule (MAP_DESIGN §2.7). It never answers, so a stray tap can't close a question she is still asking. The dimmed Help corner is still Help.
5. **Only the safe answer glows on the ladder** (it was both, in turn). Hiniker: a glow draws the eye but doesn't show where to tap; the hand does, and it was always on NO. Glowing YES as well only gave it pull.
6. **The ▶ goes right and YES left**, although Tang found pre-readers pick the first option. Next is always on the right in this game (NAVIGATION §3.1), and "first" is answered in time instead: the ▶ pops in first and is named last, where TIDRC puts the key words.
7. **Sensei's voice goes outside the speech queue, and the screen's speech is gated.** It's the robust way to "pause the level" without touching every scene. A scripted scene stops at its next line, and a cut-off clip is replayed after NO. The cost is that Sensei's face in the confirm mouths with a stepped animation rather than lip-sync.
8. **New lines were appended, not rewritten.** The four superseded lines stay in `LINES` (append-only rule) with nothing calling them, and their retirement is a fix request. Their tags are in `line-tags.ts` (blocks `// Confirm` and `// Confirm, fix round`). The map lane's 19 lines are tagged too (block `// Map redesign`) and measured in `durations.json`. (Corrected 27 Sep: an earlier note said the map lines had no tags; the map lane fixed it first.)
9. **The stretched clips are for a person to judge**, because the audio judge can't hear stretching (§3.5). New lines are written with a natural pause instead of being stretched.
10. **New art.** `hero_kai_thumbsup.webp` and `hero_suki_thumbsup.webp` (420 px wide, cut out with rembg) are in `public/a/i/`. The raw takes are in `playtest/confirm/art/`.
