# Teacher voice: the mechanics (frame, show, ready, your turn)

**Status:** design for the fix plan (docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md, not started yet), written 26 September 2026 by the mechanics designer of the teacher-voice workflow. The script designer owns the wording: every line below in *italics* is an example of what the line has to do and how long it can be, not final text. Line numbers are from the source at about 23:00 on 26 Sep; search for the quoted code if they have drifted.

**Jonas, after playtesting the preschool levels with his 3- and 4-year-old:** "this extremely abbreviated way of talking, it doesn't help at all … teachers … say, so first, I'm going to show you how to do it. Are you ready? … I will show you this, and you will do that. Do you want to give it a go now? … Or this like weird shouted, listen … in the first dojo level where it just starts with this, and this ear appears. Teachers explain what they're doing." Earlier (Round 13): the first game was "too long and boring" for the 3-year-old.

**Evidence:** the code (src/scenes, src/ui/nav.tsx, src/content/warmups.ts, src/content/lines.ts), the transcripts in `playtest/transcripts/2026-09-26-script-editor/`, and a fresh run on a frozen build of the current tree (`playtest/runs/teacher-voice/transcripts-mechanics/journey-perfect.md`: w1-wu1, w1-4, w1-6, w1-8, w2-1). The deployed build in `dist/` (built 19:18 today) was checked for the ear.

---

## 0. In one page

1. **Every game gets the same four moments the first time a child meets it:**
   - **Frame:** what this game is and who does what ("In this game, I say a picture, and you tap it.");
   - **Show:** Sensei does one, narrating in the first person while the paw taps and the ninja moves ("I'll go first. The sun! There it is.");
   - **Ready?:** "Are you ready to have a go?", answered with a tap;
   - **Your turn:** the question, and the child plays.
2. **Later plays are shorter.** A second full telling (a recap) comes the first time the game is played in a later session. After that there is one short reminder line at the game's first play in a session, and nothing on later plays in the same session. This is ARCHITECTURE §6.2's `mech:` dosage, with the "Then" column changed from "none" to "a short reminder".
3. **The readiness answer is the green Next arrow ("I'm ready"), with the paw beside it ("Show me again").** Both are already in the nav row, and the child has tapped Next about ten times before the first lesson (film, Choose, opt-in). A tap on the game's board also counts as "ready". The child's ninja drops into its ready stance and faces the arrow while Sensei asks, and bows when the child taps it. It is a new `holdReady()` in `src/ui/nav.tsx`, built on `holdNext()`. There is no auto-start and no big new button, and nothing tappable goes in the ninja zone.
4. **State:** one per-profile ledger entry per game type, `narr["game:<id>"]` (the existing `narrate.tsx` ledger, with SCRIPT_FIXES A1's session field and a last-played time). A telling counts only once the child has tapped Ready.
5. **The "Listen!" and the ear** is the Dojo's `Learn` (Dojo.tsx:445, `w2-1` on, and the first lesson on every school path). "Listen..." is a 0.76 s carrier clip, recorded to end on "..." so that a pure sound can be joined after it, and it became the first thing the level says. The ear was a 230 px pulsing "Hear the sound" button that nothing explained. The navigation work has since swapped it for the petal, but the bare "Listen..." is still there. §7 has the fix.
6. **What it costs:** about +5–7 s of talk and one extra tap per game on its first meeting, and nothing on later plays. W1 goes from about 80 s to about 100 s for the quick bot. The age limit (12 s of talk before the first action at age 3) is met because the Ready tap *is* an action. §5.4 has the budgets.

---

## 1. What the navigation layer already gives us (src/ui/nav.tsx, as built)

| Piece | What it does | Where (stage px) | Used today by |
|---|---|---|---|
| `NextArrow` | ▶, green, 132 px. It is dim (a tap wiggles it) until `ready`, then pulses. Its built-in idle nudge: 8 s glow and pointing hand; 16 s `nav_ready` "Tap the arrow when you're ready!" and the ninja's star at it; 40 s `nav_ready` again; then quiet. After 1.5 s held it pauses lesson clocks | row slot (1030, 628); column (1204, 474) | every held step and hold |
| `ShowAgainButton` | the paw, "Show me again": replays the demo that led into this turn; never answers; lesson clocks pause while it plays | row slot (595, 646), 100 px | turns after a demo (Warmup, Early picks, the early dojo's I do) |
| `ReplayButton` | the speaker, "Hear it again": the screen's `told()` bundle, or the last instruction | row slot (725, 636), 116 px; or `own`, `column`, `top-right`, `side` | every turn and step |
| `SoundBadge` in the nav row | the sound's petal beside the speaker | (855, 630) | sound turns |
| `usePresentation(steps, o)` | a show as held steps: Back, Hear it again (replay the step), Next; never moves on by itself | registers its own nav | film, Choose, World Flower intro and trips, gem victory, rewards, story title, finale, the first check's drop |
| `holdNext(key, again, { sound, at })` | a one-step hold over a scripted scene: modal nav entry, Next ready at once, Help says `again` then points at Next; resolves true on Next, false if the screen is left | as NextArrow; `at: "column"` for screens whose own targets fill the nav row (sorting) | warm-up holds between two shows, the gem-energy explanation, opt-in confirm, placement end |
| `TurnNav` (Early.tsx:729) | the turn's own speaker (dim until the turn starts), the paw and the petal in the nav-row slots; hidden while a hold is up | row slots, or beside the word card | Warmup, Early picks, build, reading check |
| `useHeld()` | true while a hold is up (scenes hide their own row controls) | – | Battle, Dojo, Early build |

What is **not** there: anything that asks the child a yes/no question about starting, and any memory of which *game types* a child has met (the ledger knows explanations such as `dojo:welcome` and `hear-again`, but not "has played the tap-all game").

---

## 2. Inventory: every game type today

"Show/try lines" are the `fm_show_me` "Let me show you!" / `fm_show_me_2` "Watch me first!" and `fm_you_try` "Now you try!" / `fm_you_try_2` "Your turn!" lines (Warmup.tsx `showMe()`/`youTry()`, alternating), and Early's `ido` "Watch me first!", `wedo` "Let's do it together!" and `youdo` "Now it's your turn!" (Early.tsx:975–977 in `present()`, and BuildOne's `announce`).

### 2.1 The warm-ups (Warmup.tsx; scripts in content/warmups.ts)

| # | Game (id) | Where | Steps today (what Sensei says, in order) | The child does | Demo today | Show/try lines | Nav in the turn |
|---|---|---|---|---|---|---|---|
| G1 | tap the named picture (`tap`) | W1 | `fm_l1_hello` "Ninja ears on! Let's listen to some words." · names sun, sock, cat · "Let me show you!" · "Tap the sun!" · "Now you try!" · "Tap the sock!" | taps one picture | the paw taps the sun while Sensei says "Tap the sun!"; the ninja kicks; the card goes green | `tap`: showMe 521, youTry 524 | speaker (dim until the turn); paw = the demo |
| G2 | fast and slow (`fastslow`) | W1 full, W3 recap | "Watch me first!" · paw on the rabbit: "I can say a word fast. Sun!" · paw on the tortoise: "Or I can say it slowly…" sssuuunnn · "Fast or slow, it's the same word. Sun!" · "Slowly, I hear its sounds. Words are made of sounds!" · then the child's beat: "Your turn! Tap the tortoise, and say it slowly with me." · ◇ "Now tap the rabbit, and say it fast!" | taps the pulsing tortoise (errorless), says the word | Sensei's whole show (the paw, the elastic card, the ribbon, the ninja's dash and kata) | showMe 583; no youTry (the child's line has "Your turn!" in it) | paw = Sensei's show |
| G3 | notice the first sound (`notice`) | W1 | "Listen to the very first sound." sssun, sssock · "Did you notice? Sun and sock start with the same sound…" /s/ · "Say that sound with me!" /s/ · 1 s pause | says /s/ aloud (no tap) | it is a show (the ninja cups its ear; the first dots go gold) | none | then a hold on Next (`W1:7`), whose Hear it again replays the show |
| G4 | slow word: which picture? (`slowpick`) | W3 (R: W1, no demo) | names · "Let me show you!" · "Listen to my slow word…" mmmuuug "Which picture is it?" · the paw taps the mug · "mmmuuug… mug!" · "Now you try!" · "Here's another slow word…" vvvaaannn "Which picture is it?" | taps a picture | the paw; bullet-time ninja | showMe 650, youTry 653 | paw = the demo |
| G5 | tap all that start with / have the sound in them (`tapall`) | W1, W2 ◇ (quick), W3 ×2, R-W2 | names the grid · "Let me show you!" · "Tap all the pictures that start with…" /s/ (the paw finds the sun on /s/, a pocket fills, "sssun") · "Your turn!" · the child's finds · "You found them both! They both start with…" /s/. W2's quick one and W3's /m/ have no demo | taps each picture that fits | the paw, a shuriken, the pocket | showMe 744, youTry 785 | paw, speaker, petal |
| G6 | the reading rail (`rail`) | W2, W4 | "Ninjas read this way!" (the ninja runs the rail) · names · "Let me show you!" (W2) · "Fish… dog. Fish dog!" (a light under each) · the merge "Fish dog!" · then the child's beat: first card glows, "Your turn! Tap them the ninja way." · wrong order: "Start here, on this side!" | taps the pictures left to right | a light and the ninja running (no paw) | showMe 900 | paw = Sensei's reading |
| G7 | the swap (`swap`, a show) | W2 ◇, W4 | "Whoops! Now they're the other way round. Dog… fish. Dog fish!" (the ninja leapfrogs) | nothing | – | – | hold on Next before "which" |
| G8 | which did I read? (`which`) | W2 (demo), W4 (none) | demo rails named · "Let me show you!" · "Fish… dog. Fish dog!", the paw taps the rail · "Now you try!" (said over the light sweep) · new rails named · "Listen. Cat… dog. Which one did I read?" | taps a whole rail | the paw; a gift of stars. **The governor drops this demo when the lesson is behind** (`skipDemo`) | showMe 1014, youTry 1015 | paw = the demo (on its own pictures) |
| G9 | two little words make a big word (`compound`) | W2 (Sensei + child), W4 (child ×2) | "Two little words can make one big word!" · names · paw on the tortoise "Say them slowly: sun… flower." · paw on the rabbit "Say them fast: sunflower!" · merge · then the child: names · "Star… fish. Tap the rabbit to say them fast!" · rabbit pulses | taps the rabbit | Sensei's sunflower. W4 has no demo and no Show me again | none | paw = the sunflower (W2 only) |
| G10 | sounds to words (`sounds`) | W5 | "Remember? Words are made of sounds!" (once) · names · "Let me show you!" · "I'll say the sounds. You listen for the word!" /s/ /u/ /n/ · the paw taps the sun · "sun" · "Now you try!" · ×6: names · /m/ /a/ /p/ "Which picture is it?" | taps a picture | the paw | showMe 1179, youTry 1190 | paw = the demo |
| G11 | sound dots (`dots`) | W6 | picture named · "Let me show you!" · "Every dot is a sound. Ninjas tap them this way!" (the paw taps each dot, /s/ /u/ /n/, then the sweep "sun") · per word: "Your turn! Tap the dots this way, and say the sounds with me." (the first) · "Say the sounds… and say the word!" (the first) | taps the dots in order | the paw | showMe 1266 | paw = the demo |

### 2.2 The early games (Early.tsx)

| # | Game (id) | Where | Steps today | The child does | Demo today | Show/try lines | Nav |
|---|---|---|---|---|---|---|---|
| G12 | first sound (`firstsound`) | w1-2, w1-3, w1-10 | `first_intro` "Every word starts with a sound. Let's listen for the very first sound!" · per sound: **I do** "Watch me first!", names two, "Which one starts with…" /m/, the paw taps after 1.1 s, "Mop starts with…" /m/, the spell writes < m >: "We hear the sound. Now look: this is how we spell it." /m/ · **we do** "Let's do it together!" (the answer glows) · **you do** "Now it's your turn!" ×2 · then 4 head-to-head | taps a picture | the paw (I do); an I do for every sound | `ido`/`wedo`/`youdo` | speaker, petal; paw from the we do on (the same sound's I do) |
| G13 | find the spelling (`find`) | the "find" phase of G12's levels; Dojo `Find` | "Find this sound…" /m/ (Early) · "Can you find…" /b/ (Dojo; "Tap the speaker to hear the sound again." twice a save) | taps a tile among 2–4 | none | none | speaker, petal |
| G14 | sound hunt, middle sound (`soundhunt`) | w1-7, w1-11 | `hunt_intro` "Now let's listen for a sound in the middle of a word!" (+ "The middle sound comes after the first sound, and before the last sound.", twice) · I do / we do ×2 / you do ×4: "Which one has this sound in it?" /i/ piiin paaan · "Pin has this sound in the middle…" /i/ + the spell | taps a picture | the paw (I do) | `ido`/`wedo`/`youdo` | as G12 |
| G15 | word building (`build`) | w1-4, w1-5, the build phases of w1-7, w1-10, w1-11, the practice dojo; **Dojo.tsx `Build` from w2-1** | Early: "This is our dojo. Here we listen to sounds, make words, and read them." (once) · "This word has two sounds!" · I do "Watch me first!" "I say the word…" am "I say it slowly…" aaammm "Ninjas read this way! We start here, and go this way." "Now I find each sound, one at a time." (the paw points at each letter, the ninja launches it) "Say the sounds… and read the word!" · we do "Let's do it together!" (the tile glows) · you do "Now it's your turn!". Dojo.tsx: "Now let's make words! First, listen to the word. Then tap its sounds, one at a time." "Build the word…" **(no I do: PEDAGOGY's finding 4 still stands for a school-path child)** | taps letters into slots | the paw and the ninja (Early only) | `ido`/`wedo`/`youdo` (Early) | speaker beside the card; paw left of the card (Early) |
| G16 | who read it right? (`readcheck`) | w1-4, w1-5, w1-7, w1-11 | "Who read it right? Listen to Kai and Suki!" · "Tap each sound, and say it." · the child taps the sound buttons · "Who read it right?" · "Kai says…" · "Suki says…" | taps sounds, then a reader | none | none | speaker (the readers again once they have read) |

### 2.3 The Dojo, battles and the other levels

| # | Game (id) | Where | Steps today | The child does | Demo today | Show/try lines | Nav |
|---|---|---|---|---|---|---|---|
| G17 | new sounds (`learn`) | every dojo with `teach` (w2-1 on); a school path's first lesson | `dojo_hello` "This is the dojo. A dojo is where ninjas practise! Let's practise some sounds." (twice a save, then `audit_dojo_back`, then nothing) · **"Listen…" /b/ /b/** (the petal in the middle, pulsing; in the build Jonas played, a 230 px pulsing ear) · the ninja's spell, the spelling appears · "And this is how we spell it." /b/ (+ the letters line) · "Tap it, and say it with me!" · repeated with the same shape for every sound | taps the spelling twice, saying the sound (errorless) | none (the first item is guided) | none | Hear it again = the whole teaching |
| G18 | battle (`battle`, `boss`, `trial`) | w1-6, w1-13, w2-2 …; bosses; Gem Trials | Baron's motive (once) · `battle_start` "Uh oh! One of Baron Muddle's monsters is in the way! Spell the words to zap it!" (boss: the threat and `battle_boss`; trial: `audit_trial_first`) · the bar and hearts (first timed) · "Spell…" sat | taps letters into slots; each right sound strikes the monster | none | none | "Hear the word" beside the card (the intro again on the first word) |
| G19 | Sound Swap (`swap`) | w1-8, w1-12, w2-5 … | `swap_start` "Baron Muddle has mixed up these words! Can you fix them? Change one sound at a time." · "This is…" mat · "Change it to make…" sat, mmmat, sssat, "What changed? Listen here." · the child taps the letter · "Yes, the first sound changes! Now pick the new sound." · the child picks | two taps per word: the sound to change, then the new spelling | none | none | "Hear the target word" beside the card |
| G20 | sorting (`sort`) | the Sky Temple's sorts | "Sorting time!…" · "This sound can be spelt in two ways." · each chest hops as its sound is said · "Tap the chest with the same spelling as the word." · the words fall | taps a chest | none | none | "Hear the word" top-right; holds in the column |
| G21 | Ninja Run (`run:blend`, `run:read`) | w1-9, w2-3 … (blend and read groups alternate) | "Ninja Run! Tap to jump, and catch the right word!" · "Listen to the sounds. What word do they make?" /k/ /a/ /t/ · the lanterns · (read groups: "Read the word, and catch the matching picture!") | taps to jump; taps a lantern | none | none | speaker in the top bar |
| G22 | story (`story`, `story:read`, `story:choice`, `story:question`) | w1-14 … | the title, held: "Story time! I'll read, and you read too." · Sensei's pages (held) · the child's pages: "Your turn to read! Tap a word if you need help." then the ✓ "I read it!" · choice: "Read the two words. Tap the one you choose." · "Let's think about the story…" | reads aloud and taps ✓; taps a word; taps a picture | none (Sensei's own pages model reading) | none | the right-hand column |

### 2.4 Rewards, hubs and the shell (not games: shows and single taps)

| # | What | Steps today | The child does | Nav |
|---|---|---|---|---|
| H1 | Reward 1, the Sticker Book (Stickers.tsx `intro`) | the cards flip, the book arrives, "Every picture you play with becomes a sticker!" · "Tap a sticker!" (the hand points at the sun sticker) · held "Ready for the next game? Tap the big arrow!" | taps a sticker, then Next | `usePresentation` |
| H2 | Reward 2, later rewards, the level reward (App `Reward`) | held steps: stickers, the shiny sticker, the first petal; "+N"; stars, gem focus, the jump offer | Next | `usePresentation` / Next |
| H3 | the World Flower: first visit, trips, gem victory (Intros.tsx, Tree.tsx) | held steps of `flower_i*`, `wf_*`, teach.ts scripts | Next, Back, Hear it again | `usePresentation` |
| H4 | the petal panel, the Practise gate, the Sticker Book, the map | taps with Help and Hear it again | taps | `useNav` |
| H5 | the dojo welcome (Training.tsx) | gong ("Ninja training! First, tap the big gong!") · Help ("Stuck? Tap me…") · the speaker | each step is a turn | `useNav` |
| H6 | Choose, the opt-in | select, then Next | taps, then Next | `useNav` |

### 2.5 What the inventory shows

1. **No game says what it is, or who does what.** The nearest things are the lesson openers (`fm_l1_hello` "Ninja ears on! Let's listen to some words.", `first_intro`, `hunt_intro`, `swap_start`, `battle_start`) and two warm-up lines that frame a game, `fm_sounds_intro` "I'll say the sounds. You listen for the word!" and `fm_dots_intro`. Neither says "I'll do one first, then it's your turn".
2. **The demos narrate as commands, not as a teacher doing it.** In W1 Sensei says "Tap the sun!" while the paw taps the sun. The child hears the same instruction they are about to get, addressed to nobody. On the frozen build: "Let me show you!" 8.1 s · "Tap the sun!" 9.2 s · "Now you try!" 10.8 s · "Tap the sock!" 11.7 s. The whole show-and-try is 3.6 s, and the demo's only words are the command.
3. **"Let me show you!" and "Now you try!" are bare labels 1–2 s apart.** FIRST_MINUTES §3 rule 3 banned mode announcements for W1/W2, and the Amendment brought them back as one-liners. Neither is the teacher sentence Jonas describes ("I will show you this, and you will do that").
4. **Nothing asks whether the child is ready.** A demo runs straight into the question. The child's first chance to act is the question itself.
5. **Eight game types have no demo at all:** find (G13), readcheck (G16), Learn (G17, guided), battle (G18), swap (G19, a two-step turn and the hardest mechanic in Bamboo Village), sort (G20), run (G21), story (G22). The Dojo's `Build` has no I do (G15), so a child who starts at Year One builds a word before anyone has built one in front of them.
6. **Show me again is uneven.** W4's picture words have no demo to replay, and the which-did-I-read demo is dropped whenever the lesson is behind, which is exactly the struggling child who needs it.
7. **The game-type memory is missing.** Framing is dosed per *explanation key* (`dojo:welcome` twice, `dojo:first` once), so the Dojo's own frame goes after two visits. From then on every Learn in every dojo opens with a bare "Listen…" (§7).

---

## 3. The pattern: frame, show, ready, your turn

### 3.1 The four moments

| Moment | On screen | Sensei | Budget (a 3-year-old) | Rules |
|---|---|---|---|---|
| **Frame** | the board arrives (cards drop in, the rail slides in, the monster lands) | what the game is, and who does what, in whole sentences: *"In this game, I say a picture, and you tap it."* For a game about a sound, the frame names the sound as its petal appears | ≤ 4 s: one or two short sentences. The lesson opener and the first game's frame can be one line | Present tense; "I" for Sensei, "you" for the child. No rules and no phonics terms. Say it before the naming (the naming then has a purpose). It joins the first turn's Hear it again bundle (NAVIGATION §3.5) |
| **Show** (the demo) | the paw taps, the ninja moves, the result shows (green card, pocket, merge) | the demo announced (*"I'll go first."*) and narrated in the first person **as she does it**: intention, action, result (*"The sun!… There it is. I tapped the sun."*). Never the child's command ("Tap the sun!") | ≤ 5 s (FIRST_MINUTES Amendment: about 5 s) | The paw sets off on the first word and lands on the result word (word timings). The demo is the same function that Show me again replays. On the first meeting it is never dropped by the time governor |
| **Ready?** | the board stays up, live and not dimmed; the demo's result is cleared; ▶ pops in, pulsing, and the paw sits beside it; the ninja turns to ▶ in its ready stance | *"Are you ready to have a go?"* The first time per save, with both answers named while each lights: *"…Tap the green arrow! Or tap the paw, and I'll show you again."* | ≤ 1.5 s; the first time per save ≤ 5 s | A tap answers (§4). Nothing starts the turn by itself |
| **Your turn** | the turn's view; answers live; the we-do glow as authored | *"Your turn!"* and the question (*"Tap the sock!"*) | as today | Idle, Help, errors, praise: unchanged (FIRST_MINUTES §3, NAVIGATION §3.2). Show me again (the paw) stays through the turn |

Jonas's own sequence has two "ready" moments: "Are you ready?" before the demo and "Do you want to give it a go now?" after it. The first is an attention-getter, not a question. It can be in the frame (*"Are you ready? Watch me!"*) with a 0.6 s beat while the ninja leans in, and **no tap**. Only the second is answered with a tap, so the number of taps stays down.

### 3.2 The four forms

| Form | When | What plays |
|---|---|---|
| **full** | the first time this game type is met by this profile | frame · show · Ready? (the long form the first time per save) · your turn |
| **recap** | the first play of this game in a *later* session, while fewer than 2 full tellings have been completed; after 21 days without playing it; or when the child struggled with it last time (§5.2) | a one-line frame (*"Remember this game? I say a picture, you tap it."*) · show · Ready? (short) · your turn |
| **short** | the first play of the game in a session, once it has had its two tellings | one reminder line that names the game (*"Tap-the-picture again!"*), or the question's own stem if that already says it · your turn. No show, no Ready?. Show me again is still offered where the game has a demo on its own pictures (§4.5) |
| **none** | a later play of the same game in the same session | the question only (the SCRIPT_STYLE §5 fade) |

> **Amended 27 Sep (TEACHER_SCRIPT T3, §2.2; logged by integration):** a **recap has no Ready hold** unless the child has been away 21 days or struggled with the game last time (`recapHold()` in `narrative.ts`). Its telling counts on the child's first answer (`framed()` then), not on a Ready tap. `frameForm()` returns `"recap"` in both cases; `recapHold()` says whether it gets the hold. Why: arrow fatigue (25–30 ▶ taps before w2-1), and the stone tap is already the child's "yes".

These forms apply to the frame, show and Ready? around a turn. An authored **teaching show** such as the fast/slow explanation, the notice beat or the Dojo's reveal of a new spelling follows its own dosage (the idea's or the spelling's, ARCHITECTURE §6.2), not the game's.

### 3.3 What doesn't get the pattern

- **Shows with no turn:** the notice (G3), the swap show (G7), rewards, the World Flower, the film. They already hold on Next, and a show is its own frame.
- **Single obvious taps inside a show:** Reward 1's "Tap a sticker!" (the hand points), the dojo welcome's steps, Choose and the opt-in.
- **Turns that continue a game already framed** in this beat: the second word of a battle, and every item after the first.

---

## 4. The readiness interaction

### 4.1 The options

| Option | For | Against | Verdict |
|---|---|---|---|
| **A big "I'm ready!" button in the middle of the play area** (a thumbs-up or a bowing ninja) | big and unmissable; a new picture could mean "I'm ready" | a new control to learn, and the child can't read "I'm ready"; it covers the board the child is about to play on; it sits where answers sit, so a stray tap there is ambiguous; a second "go on" control beside Next | no |
| **Tap your ninja** | the child's own avatar; lovely ("tap your ninja when you're ready!") | breaks the layout contract (HERO.md: nothing tappable in the ninja zone). The bottom-left corner is where a left thumb rests on a landscape phone, so it would get accidental taps. The ninja also lunges and moves, so it's a moving target | no; the ninja *shows* readiness instead (§4.2) |
| **The green Next arrow ▶ = "I'm ready", the paw = "Show me again"** | both are in the nav row already, with the idle nudge built in (`nav_ready` literally says "Tap the arrow when you're ready!"). The child has tapped ▶ about ten times before W1 (8 film shots, Choose, the opt-in). The paw is the very hand that just tapped in the demo, so "paw = show me" makes sense. Together they give a real two-way answer, like the opt-in's two cards | ▶ means "next step" elsewhere. To a child both mean "go on", so that is fine. The two buttons are 435 px apart | **yes** |
| **A tap on the board = ready** | a 3-year-old who wants to play taps the pictures, not the arrow | it can't be the only answer: a child who doesn't tap anything needs a visible cue | **yes, as well as ▶** (§4.2) |
| **Voice ("say yes!")** | natural | the game can't hear | no |

### 4.2 The recommended design

**One readiness hold, `holdReady()`, after the show on the full and recap forms.**

- **The question.** Sensei asks *"Are you ready to have a go?"*. The first time per save she adds *"Tap the green arrow! Or tap the paw, and I'll show you again."*, and ▶ then the paw get the warm-white spotlight ring on their words (word timings, as the opt-in labels do). Later: *"Ready to have a go?"* (≤ 1.5 s). ▶ and the paw work from the moment the question starts: a tap cuts Sensei off, as an answer during a question does (FIRST_MINUTES §3 rule 4).
- **The ninja.** As she asks, the child's ninja turns to face ▶ and drops into its `ready` stance with a small bounce. It is ready too, and waiting for the child. It is never tappable.
- **▶ (Next): "I'm ready".** The ninja bows (a new `bow` move and pose, a ninja's *rei* before training; it falls back to `ready` plus a hop and a "hup"). Sensei says *"Your turn!"* and the question, and the turn starts.
- **The paw: "Show me again".** The show plays again exactly, narrated. ▶ goes dim while it plays, and a tap on it wiggles. After the replay Sensei asks *"Ready now?"* (short), ▶ comes back and the idle ladder starts again. There is no limit on replays.
- **A tap on the board** (a card, a rail, a button of the game) also means "I'm ready": the hold ends, the tapped card spotlights and says its word (FIRST_MINUTES §3 rule 4's early-tap echo), then *"Your turn!"* and the question. It is **not** an answer, because the question hasn't been asked yet.
- > **Amended 27 Sep (TEACHER_SCRIPT T4, §2.3):** on a **hand-over Ready** (the Ready line names the task: "Can you find the sock? Or tap the paw…"), a tap on the **right answer** counts as ready *and* as the answer (`readyTap({ right: true })` resolves `"answer"`), so the child who found the sock isn't asked to find it again. Other board taps still mean "ready" only, as above.
- **During a replay of the show,** a tap on the board stops the replay (as Show me again does today). If the replay was on the turn's own pictures, the tap also counts as ready. If it was on the demo's own pictures (which, sounds, dots, compound), it only stops the replay.
- **Hear it again** replays the frame and the question. It doesn't replay the show: that is the paw.
- **Help:** the first press gives the readiness question in its long form (both answers spotlit); later presses call `nudgeNext()`, as on any hold.
- **Home** leaves, and nothing is recorded (§5.3), so the next visit frames the game in full again.
- **The sound picture** (petal) shows during the hold when the game is about a sound (tap all /s/): it is the one on the board already.

### 4.3 The screen

```
┌──────────────────────────────────────────────────────────────┐
│[⌂]              ● ● ○ ○ ★  (lesson beads)                    │
│                                                              │
│          [ sun ]      [ sock ]      [ cat ]                  │
│          the board stays live: a tap on it = "I'm ready"     │
│                                                caption ◢     │
│ ┌ NINJA ZONE ┐                                               │
│ │ ready      │→ faces ▶  [paw]  [spk]  [petal]      [ ▶ ]  ┌HELP┐
│ │ stance     │           595    725    855         1030   │ ◉  │
│ └────────────┘   show me again  frame   sound    I'm ready └────┘
└──────────────────────────────────────────────────────────────┘
```

Screens whose own targets fill the nav row (a battle's letter row, the sort's chests) use the right-hand column, as `holdNext(…, { at: "column" })` does for sorting today: ▶ at (1204, 474), the speaker at (1204, 322), and the paw at (1204, 196). That is the Back slot, which a readiness hold never uses. `NAV_SLOTS.column` gains `show: { x: 1204, y: 196, d: 100 }`.

### 4.4 No tap: the idle ladder

Game time. Nothing counts while anyone speaks or the phone is held upright, and any pointerdown starts it again.

| After | What happens | Who does it |
|---|---|---|
| 0 s | ▶ pops in and pulses; the paw is steady; the ninja is in its ready stance, facing ▶ | `NextArrow`, `holdReady` |
| 8 s | ▶ glows with a bigger bounce, and the pointing hand sits on it | `NextArrow` (built in) |
| 16 s | *"Tap the arrow when you're ready!"* (`nav_ready`); the ninja jumps and points its star at ▶ | `NextArrow` (built in) |
| 24 s | the paw pulses, and Sensei offers, once: *"Or I can show you again. Just tap the paw!"* (new line) | `holdReady` |
| 40 s | `nav_ready` once more | `NextArrow` (built in) |
| then | quiet. **Nothing starts the turn by itself** (NAVIGATION rule 5) | – |

After 1.5 s held, the lesson clocks stop (`NextArrow`), so a child who sits at Ready? never loses a beat to the time governor (NAVIGATION §3.7).

### 4.5 Show me again: before, during and after

- **In the Ready? hold:** the paw is the hold's own (modal) control, and it replays the show.
- **In the turn:** unchanged. The paw replays the show, never answers, and a tap on an answer stops it (and counts, on the turn's own pictures). It goes away when the next game starts (NAVIGATION §3.6).
- **On the short and none forms** (no show this time), the paw is still offered **when the game's demo uses its own pictures**: which, sounds, dots, compound, the reading rail, build (the I do on the demo's word), and swap (the demo pair). Each game type gets a canonical demo in the registry (§5.1), so W4's picture words can replay W2's sunflower. It is **not** offered where the demo would take one of the turn's own answers (tap all, first sound on the same board), because that would answer for the child.
- **When a first meeting goes badly** (the second miss on one of the first two items), Sensei offers once: *"Shall I show you again?"*, and the paw pulses. It never plays by itself.

### 4.6 The component: `holdReady()` (src/ui/nav.tsx)

```ts
export type ReadyAnswer = "next" | "board" | false;   // false: the screen was left
/**
 * The readiness question after a game's show (docs/teacher-voice/mechanics.md §4): a hold over the scene, like
 * holdNext(), answered by ▶ ("I'm ready") or a tap on the board (readyTap()); the paw replays the show. Nothing starts the
 * turn by itself. Resolves once the child is ready (or false if the screen was left).
 */
export function holdReady(key: string, o: {
  ask: Say[];                                      // the readiness question (long form the first time per save)
  again: () => unknown;                            // Hear it again: the frame and the question
  show?: (live: () => boolean) => Promise<unknown>; // Show me again: the show, narrated (▶ is dim while it plays)
  after?: Say[];                                   // said after a replay ("Ready now?")
  offer?: Say[];                                   // the 24 s paw offer, said once
  spot?: { next: number; show: number };           // first time per save: seconds into `ask` to spotlight ▶ and the paw
  sound?: PhonemeId;
  at?: Anchor;                                     // "row" (default) or "column"
}): Promise<ReadyAnswer>;
/** A tap on the game's board while a readiness hold is up: it answers "ready". True if a hold was up (the scene then
 *  echoes the tapped card instead of treating the tap as an answer). */
export function readyTap(): boolean;
```

- It is built on `holdNext`: one modal nav entry `{ next: { ready: !replaying, go }, show, again, sound, back: null, pres: { id: "ready:" + key, step: 0, of: 1 } }`, Help pushed (the first press says `ask`, later presses `nudgeNext()`), and dropped by `dropHolds()` when the route changes.
- The ninja: `ninja.pose("ready")` while it is up (facing the arrow: a `face` option on `pose`, or the pose's own art, which already looks right); `ninja.act("bow")` on the answer.
- `ShowAgainButton` gets a `pulse` prop (the 24 s offer). `NextArrow` doesn't change.
- For bots and the sweep: `__snNav.pres.id` starts with `ready:`. bot.ts's first rule already taps a ready Next. The scene publishes `__snState.busy = true, next = null` while it holds, so no bot answers early. `navLog({ kind: "ready", id, how: "next" | "board" | "show" })`.
- Scenes call `holdReady` from their scripted intros: the warm-up director, `usePickGame.present`, `BuildSequence`, and the async intro effects of Dojo, Battle, Swap, Sort and Run. One function covers them all, as `holdNext` does today.

### 4.7 Layout contract check (docs/HERO.md)

- **Ninja zone** (x 0–330, y 380–720): the ninja only poses and bows; there is nothing tappable in it.
- **Help zone** (x 1116–1280, y 556–720): untouched; Help works as described in §4.2.
- **Home zone** (x 0–130, y 0–130): Home stays on top and always leaves.
- **The nav row and the column:** every control is in an existing slot. The one new slot, `column.show`, is the column's unused Back slot.
- **The play area:** the board stays where it is and is not covered.
- The sweep's `zone-conflict`, `home-*` and `no-replay-for-instruction` checks all pass without change.

---

## 5. Full framing or a short reminder: where, and what state

### 5.1 The game registry (new `src/content/games.ts`, data only)

One entry per game type:
- `id`;
- the `mech:` notion it maps to in the core (ARCHITECTURE §6.1);
- the line ids for the frame (full, recap, short), the show's narration and the Ready? question;
- `demoOwnPictures` (whether Show me again can be offered on the short form);
- `readyAt` (`"row"` or `"column"`).

The script designer fills the lines.

| Game id | First met: the warm-up path | First met: a school path | Also in |
|---|---|---|---|
| `tap` | W1 | – (R: W1 R version) | – |
| `fastslow` | W1 | R: W1 | W3 |
| `slowpick` | W3 | R: W1 | – |
| `tapall:start` | W1 | R: W1 | W2 ◇, W3 |
| `tapall:in` | W3 | R: W2 | – |
| `rail` | W2 | R: W2 | W4 |
| `which` | W2 | R: W2 | W4 |
| `compound` | W2 | R: W2 | W4 |
| `sounds` | W5 | – | – |
| `dots` | W6 | – | – |
| `firstsound` | w1-2 | R: w1-2 | w1-3, w1-10 |
| `find` | w1-2 (find phase) | the first dojo | w1-3, w1-10, every Dojo `Find` |
| `soundhunt` | w1-7 | w1-7 | w1-11 |
| `build` | w1-4 | EC1 / IC cut (Dojo.tsx `Build`) | w1-5, build phases, practice dojo, every Dojo |
| `readcheck` | w1-4 | w1-4 | w1-5, w1-7, w1-11 |
| `learn` | w2-1 | EC1 / the 90 s cut of the start dojo | every dojo with `teach` |
| `battle` | w1-6 | the first battle | every battle |
| `boss` | w1-15 | the first boss | – |
| `trial` | the first Gem Trial | the first Gem Trial | – |
| `swap` | w1-8 | the first swap | – |
| `sort` | w6-br1 | w6-br1 (Y1) | every sort |
| `run:blend`, `run:read` | w1-9 (the first blend and read groups) | the first run | – |
| `story`, `story:read`, `story:choice`, `story:question` | w1-14 | the first story | – |

### 5.2 The rule (pure, `src/content/narrative.ts`)

```ts
export type FrameForm = "full" | "recap" | "short" | "none";
/** A game type's exposure: tellings (full or recap, completed by the Ready tap) with their sessions (SCRIPT_FIXES A1),
 *  plus when it was last played and whether the child struggled then. */
export interface GameExposure extends Exposure { lastAt?: number; lastSession?: number; struggled?: boolean }
export const GAME_TELLINGS = 2;           // ARCHITECTURE §6.2 `mech:`: 2 full explanations, the 2nd in a later session
export const GAME_REFRESH_MS = 21 * DAY;  // `mech:` refresh
export function frameForm(e: GameExposure | undefined, session: number, now: number): FrameForm {
  if (!e || e.n === 0) return "full";
  if (e.struggled) return "recap";
  if (e.lastAt !== undefined && now - e.lastAt > GAME_REFRESH_MS) return "recap";
  if (e.n < GAME_TELLINGS && (e.s?.at(-1) ?? session) < session) return "recap";
  return e.lastSession === session ? "none" : "short";
}
```

Tests (in `narrative.test.ts`):
- nothing → `full`;
- told in session 1, playing again in session 1 → `none`;
- told in 1, first play in 2 → `recap`;
- told in 1 and 2 → `short` in 3, then `none` later in 3;
- not played for 22 days → `recap`;
- `struggled` → `recap`.

Runtime (`src/scenes/narrate.tsx`, next to `isDue`/`heard`): `gameForm(id)`; `framed(id)` records a telling with the session (call it on the Ready answer, full or recap form); `played(id, { struggled })` sets `lastAt`, `lastSession` and `struggled` at the end of the game's beat or phase. `struggled` means the second-miss help or the idle 16 s point was reached on two of the game's first three turns.

### 5.3 The state

- **Where:** the child's save, in the existing `narr` ledger (`narrate.tsx`, per profile, wiped with the save). The key is `game:<id>`. No new top-level save field: the ledger is exactly ARCHITECTURE §4.2's "dosage state per key", and the core's `mech:<id>` notion takes it over later.
- **When a telling counts:** only when the child answers Ready (▶ or the board) after a full or recap form. A frame cut off by Home, a turned phone or a crash doesn't count (ARCHITECTURE §3: log what was heard), so the next visit frames it in full again.
- **Migration** (the `narr` read, once per save): for each game type, if the child has stars on any level that plays it, write `{ n: 2, at: [], s: [0, 0], lastSession: -1 }`. That retires it to `short`, so a returning child isn't suddenly walked through every game. The existing keys fold in: `dojo:welcome` and `dojo:back` become `game:learn`'s tellings, and `dojo:first` becomes `game:build`'s.
- **ARCHITECTURE §6.2** (a change for its owner): the `mech:` row's "Then" goes from "none (Help covers it)" to "a short reminder at the first use in a session; none on later uses that session". Everything else in the row stays: one demo before first use, two full tellings, the second in the next session, 21-day refresh.

### 5.4 Budgets: age limits and the time governor

- **Talk before the first action** (ARCHITECTURE §6.4: 12 s at age 3, 15 s at 4). The Ready tap is the first action, so it has to come within the limit. That shapes W1's first game: the hello and the frame are one line (≤ 4 s); only the two cards the demo doesn't use are named before the show (the show names its own card); the show is ≤ 3.5 s; the Ready question, in its first-per-save long form, starts by about 10 s. For later games the budget is easier (fewer new pictures, older children).
- **The time governor** (FIRST_MINUTES §3 rule 10):
  - A full-form frame, show or Ready? is never skipped.
  - `skipDemo` (which-did-I-read) applies only to a recap-form show.
  - An optional beat (◇) is still skipped when behind.
  - Holds don't count beyond 1.5 s.
- **New targets** (the fix plan re-measures `secs` with the bot, then sets them):
  - W1: target 85 → about 100 s, cap 100 → 115 s;
  - W2: 65 → about 75 s, cap 75 → 90 s;
  - W3–W6: about +7 s per game met for the first time.

  The rabbit ◇ in W1 and the swap ◇ in W2 will then usually be dropped for a real 3-year-old, which is right: they are the repeats.
- **The first five minutes** (FIRST_MINUTES §14): title to the map grows by about 25 s (about 4:48 → 5:15 at the bot's 1.2 s), over the 5:00 cap. The fix: Reward 2's two held steps become one step for a warm-up child on the first session, which saves about 6 s. The 5:00 cap moves to 5:15 because the extra time is the child's own taps and turns (logged as a decision below).

---

## 6. The per-game plan

**F** = frame, **S** = show (demo), **R** = Ready? hold, **T** = the turn. ✚ = a change from today, ✖ = something today's version loses.

### 6.1 The warm-ups (Warmup.tsx, content/warmups.ts)

| # | Full form (first meeting) | Recap / short | Ready at | Code |
|---|---|---|---|---|
| G1 `tap` | **F** ✚ merged with the hello: *"Ninja ears on! In this game, I say a picture, and you tap it."* · names sock, cat · **S** ✚ *"I'll go first. The sun!… There it is!"* (the paw sets off on "sun", the kick lands on "There") ✖ "Let me show you!" + "Tap the sun!" · **R** long form · **T** *"Your turn! Tap the sock!"* (the glow after 2 s stays) | only in W1 | row | `tap` beat: the show narrates; `holdReady` between `show(isAlive)` and `ask` in place of `youTry()` |
| G2 `fastslow` | **F** ✚ *"Here's a new game, with the rabbit and the tortoise."* · **S** Sensei's show as today (already in the first person); "Watch me first!" becomes part of the frame · **R** ✚ (the paw replays the whole show) · **T** "Tap the tortoise, and say it slowly with me." · ◇ rabbit | W3, same session (the usual case): **short**. The recap show is W3's own teaching beat (the idea's second explanation), so it stays; no **R**. W3 in a later session: **recap**, and **R** after the recap show | row | `fastslow` Sensei beat ends with `holdReady` when the form isn't short; the child beat's line drops its "Your turn!" when **R** said it |
| G3 `notice` | unchanged: a show (its own sentences say what it does). "Say that sound with me!" pause 1 s → 1.5 s (PEDAGOGY's 1.5 s) | – | – | keep the `W1:7` Next hold |
| G4 `slowpick` | **F** ✚ *"In this game, I say a word very slowly, and you find its picture."* · **S** ✚ *"I'll go first. Listen… mmmuuug. That's the mug!"* (paw) · **R** · **T** "Here's another slow word… Which picture is it?" | short: "Listen to my slow word…" (the question as today) | row | `slowpick` |
| G5 `tapall:start` | **F** ✚ *"In this game, you find every picture that starts with…"* /s/ (the petal pops) *"…and put it in a pocket."* · names the new cards · **S** ✚ *"I'll find the first one. Sssun! Sun starts with /s/. Into the pocket!"* · **R** · **T** *"Your turn! Find the other two."* | W2 ◇ quick (same session): **none** ("Quick! Tap all…", as today). W3's /m/: **short**. No Show me again (the demo would take an answer) | row | `tapall`: the frame before `nameCards`; `holdReady` in place of `youTry()` |
| G5 `tapall:in` | **F** ✚ *"This time the sound can be anywhere in the word."* · **S** the paw finds the cat, *"caaat: I can hear /a/ in it!"* · **R** · **T** | short | row | same beat; the id picks the frame |
| G6 `rail` | **F** "Ninjas read this way!" (the ninja runs the rail) ✚ *"I'll read these pictures the ninja way. Then you read them."* · **S** Sensei reads (the light, the merge "Fish dog!") · **R** · **T** first card glows, *"Your turn: tap them the ninja way."* | W4: short ("Ninjas read this way!" then the turn); Show me again on the rail's own pictures | row | `rail` Sensei beat ends with `holdReady`; the child beat's line loses "Your turn!" after **R** |
| G7 `swap` | unchanged (a show; ◇ in W2); its Next hold stays | – | – | – |
| G8 `which` | **F** ✚ *"I'll read one of these two. You tap the one I read."* · **S** ✚ *"I'll read one: fish… dog. Fish dog! That was this one."* (paw) · **R** · **T** "Listen. Cat… dog. Which one did I read?" | W4: short; Show me again on the demo's own rails. The governor may drop the demo only on the recap form | row | `which`: `play(isAlive)` no longer calls `youTry` during the sweep; `holdReady` after it; `skipDemo` checks the form |
| G9 `compound` | **F** "Two little words can make one big word!" ✚ *"Watch."* · **S** Sensei's sunflower · **R** ✚ *"Now you make one. Ready?"* · **T** "Star… fish. Tap the rabbit to say them fast!" | W4 in a later session: **recap** with the sunflower demo on its own pictures ✚ (the registry's canonical demo); same session: short. Show me again always offered (own pictures) | row | `compound`; the registry's demo replaces W4's missing one |
| G10 `sounds` | **F** ✚ `fm_sounds_intro` "I'll say the sounds. You listen for the word!" moves **before** the show and becomes the frame (*"…and find its picture"*) · **S** ✚ *"I'll go first. /s/ /u/ /n/… I can hear sun! There it is."* · **R** · **T** per item (SF C17.2: "Listen… /m/ /a/ /p/. Which picture is it?") | only in W5 | row | `sounds` |
| G11 `dots` | **F** `fm_dots_intro` "Every dot is a sound…" ✚ *"…you tap them this way and say the sounds."* · **S** the paw taps the dots, sweep "sun" · **R** · **T** "Your turn! Tap the dots this way…" | only in W6 | row | `dots` |

Holds in W1: today 1 (the notice → tap all). With the new pattern there are 4: tap, fast/slow and tap all get **R**, and the notice's hold stays. W2 gets 3 **R** (rail, which, compound) plus the swap hold when the swap plays.

### 6.2 The early games (Early.tsx)

| # | Full form | Recap / short | Ready at | Code |
|---|---|---|---|---|
| G12 `firstsound` | **F** `first_intro` ✚ becomes the frame: *"In this game, we listen for the very first sound in a word. I'll find one first."* · **S** the first sound's I do, narrated ✚ (*"I'm listening for…"* /m/ *"…mmmop! Mop starts with /m/."*, then the spell and "We hear the sound. Now look: this is how we spell it.") · **R** ✚ · **T** we do (glow) → you do. The second sound's I do stays (it teaches a new spelling), with no **R** | recap: *"Remember this game? Which picture starts with…"* + the first I do + **R**. Short: the I do per sound only where its spelling is new (SF C9), then turns. ✖ the bare `ido`/`wedo`/`youdo` lines: the frame, the show and **R** do their jobs; the we do keeps a whole sentence if the script wants one (*"Let's do the next one together."*) | row | `usePickGame.present()`: `holdReady` after the first I do of the level (on full/recap); `ido`/`wedo`/`youdo` pushes go |
| G13 `find` | **F** ✚ *"Now find how we write…"* /m/ *"Tap it!"* · no show · no **R** · **T** the first item is a we do (its answer glows) | short: the rotating stems (SF A5) | – | the find phase's first item becomes `mode: "wedo"` on full/recap; Dojo `Find` keeps its speaker tip before the question (SF C10) |
| G14 `soundhunt` | **F** `hunt_intro` + the middle line, as the frame · **S** the I do, narrated · **R** ✚ · **T** we do → you do | as G12 | row | as G12 |
| G15 `build` | **F** ✚ *"In the dojo, we build words. I say a word, then we find its sounds, one at a time."* (replaces `audit_dojo_first` + `two_sounds`: SF C13's "I can hear two sounds!" comes after the slow word, inside the show) · **S** the I do (today's, narrated in the first person: "I say the word… I say it slowly… I can hear two sounds… Now I find each sound…") · **R** ✚ *"Now let's build one together. Ready?"* · **T** we do → you do | recap: *"Remember how we build words? Watch me do one."* + the I do + **R**. Short: "Build the word…". **Dojo.tsx `Build` ✚ gets the same I do on full/recap** (a school-path child meets `build` there first). Show me again always offered (the I do's word) | row (Early's `own` speaker stays beside the card; the hold's controls are the layer's) | `BuildSequence` intro; `Dojo.tsx` Build borrows `BuildOne.runDemo`'s pattern |
| G16 `readcheck` | **F** ✚ *"Kai and Suki are going to read this word. One of them reads it right. First, you tap the sounds and say them."* · no show (the child's sound taps are guided, one at a time) · no **R** · **T** as today, `read_who` after both readers (SF C14) | short: "Tap each sound, and say it." | – | `ReadCheck` |

### 6.3 The Dojo (Dojo.tsx)

| # | Full form | Recap / short | Ready at | Code |
|---|---|---|---|---|
| G17 `learn` | **F** ✚ (replaces `dojo_hello`): *"Welcome to the dojo! Today you'll learn some new sounds. For each one, you'll hear the sound, I'll show you how we write it, and then you say it with me."* (≤ 6 s; the lesson's petals wait in the mist above) · **R** ✚ *"Ready for the first one?"* · **S+T** the first Learn is the show and the turn in one: *"Here's your first new sound. Listen carefully…"* /b/ … /b/ (the petal's introduction animation plays on the sound, SD §4.6; no pulse before it) · the spell · "And this is how we write it…" · "Tap it, and say it with me!" | recap (the first dojo in a new land, or after 21 days): *"Time for some new sounds. Three today!"* + **R**. Short: *"Here's the next new sound. Listen…"* (SF C2's series shape: "Your turn!" for 2+, "Last one!" for the last). ✖ a bare "Listen…" opening any Learn (§7) | row | `Learn` intro (Dojo.tsx:440–447); the frame and **R** before the first `Learn` mounts (`Dojo`, phase `learn` i = 0) |
| G13 `find` in the Dojo | as §6.2 | – | – | – |
| G15 `build` in the Dojo | as §6.2 (the I do is new here) | – | row | – |

### 6.4 Battles, Swap, Sort, Run, Story

| # | Full form | Recap / short | Ready at | Code |
|---|---|---|---|---|
| G18 `battle` | **F** ✚ *"Oh no, a monster! I'll say a word, and you spell it with the letters. Every sound you get right zaps the monster!"* (after Baron's motive, once, as today) · **S** ✚ Sensei spells the first word: *"Watch me zap it. Sat… /s/…"* (the paw taps < s >, the ninja strikes) *"…/a/… /t/. Sat!"* · **R** ✚ *"Your turn to zap it! Ready?"* · **T** "Spell…" and the next word | recap: frame + **R**, no show (the child has spelt in the dojo). Short: `battle_start`. `boss` (full): the threat + `battle_boss` + **R**. `trial` (full): `audit_trial_first` + the bar and hearts + **R**: **the timer never starts before the child is ready** | column (the letter row fills the nav row) | `Battle` intro effect (Battle.tsx:340–408): `holdReady` before `ask()` |
| G19 `swap` | **F** ✚ *"Baron has muddled these words. In this game, you change one sound to make a new word."* · **S** ✚ Sensei does the first swap: *"This is mat. I want sat. Mmmat… sssat. The first sound changes. So I take out /m/…"* (the paw taps < m >, the ninja kicks it out) *"…and put in /s/."* (the paw taps < s >) *"Sat!"* · **R** ✚ · **T** the next word in the chain | recap: frame + the show on the demo pair + **R**. Short: "Change it to make…" (SF C11). Show me again offered (the demo pair is its own) | row (the choices sit above the row) | `Swap` intro effect (Swap.tsx:261–270): the demo pair is a chain step played by the paw; the chain starts one later |
| G20 `sort` | **F** the intro as SF C1 (each chest hops on its sentence) ✚ *"I'll sort the first word."* · **S** ✚ the first word falls; *"Rain. This spelling is in rain…"* (the paw taps its chest, the ninja kicks the word in) · **R** · **T** the next word | short: "Sorting time! Same sound, different spellings." and the first word | column (the chests fill the row) | `Sort` intro; `holdReady(…, { at: "column" })` |
| G21 `run:blend` | **F** ✚ *"Ninja Run! Your ninja runs by itself. Tap anywhere to jump. When the lanterns come, listen to the sounds and tap the word they make."* · no show (a moving world; the first lantern's answer glows after 2 s instead, a we do) · **R** ✚ the ninja waits on the start line: *"Ready? Tap the arrow, and off we go!"*. **The world starts moving on the child's tap** | **every** run keeps its start tap (it is the run's starting gun, not a readiness check). Short: *"Ninja Run! Ready? Off we go!"* `run:read` (full): its first read group gets a frame (*"Now read the word on the flag, and catch its picture!"*), with no hold (mid-run) | row | `Run` start |
| G22 `story` | **F** the title step (already held on Next) ✚ says how it goes: *"Story time! I'll read the pages with lots of words. On the pages with big words, it's your turn to read."* Its Next **is** the Ready. `story:read` first: *"Say the sounds and read each word, then tap the green tick."* `story:choice` and `story:question` first: as today (`audit_story_choice`) | short: "Story time!" + the title | column | `Story` title step and first pages |

> **Amended 27 Sep (TEACHER_SCRIPT §3.18, T13; logged by integration):** G18's first battle **has a demo**, with the word-card tap and "Can you find the last one?" as the child's join-ins, and the letters stay dim until ▶ (in the column). The recap is `tv_battle_recap` + `tv_battle_go` (with its Ready only per T3). The **short form is `tv_battle_again`, with the letters waking as it ends** (no Ready hold; the first word's Hear it again says only the question, not the whole frame).

### 6.5 Rewards, hubs and the shell

No readiness holds. Their shows are their own frames, and they already hold on Next. Two small things:
- **The dojo welcome (Training.tsx)** keeps its three steps (SF C19 adds the speaker's word). The paw is taught where it is first used, at the first Ready? (the long form, §4.2), not in the welcome.
- **Reward 1's "Ready for the next game? Tap the big arrow!"** already uses the same words and the same ▶. That is good, because Ready? will sound familiar.

### 6.6 Worked example: W1 in the new shape

A child who is not at school yet, first session. The times are a quick child's; `R` includes the bot's 1.2 s.

| t (s) | Beat | What happens |
|---|---|---|
| 0.0 | hello + **F** | cards drop in · *"Ninja ears on! In this game, I say a picture, and you tap it."* (4.0) |
| 4.0 | names | "This is a sock." "This is a cat." (2.6) |
| 6.6 | **S** | *"I'll go first. The sun!… There it is!"* The paw taps, the ninja kicks, a star stamp (3.5) |
| 10.1 | **R** | *"Are you ready to have a go? Tap the green arrow! Or tap the paw, and I'll show you again."* (▶ then the paw spotlit) (4.8) · **tap ▶** at ~12 s at the earliest (the first action; talk so far about 11 s) · the ninja bows |
| 16.1 | **T** | *"Your turn! Tap the sock!"* · tap · kick |
| 20 | **F** | *"Here's a new game, with the rabbit and the tortoise."* |
| 23 | **S** | Sensei's fast/slow show (15.5) |
| 38 | **R** | *"Ready to have a go?"* · tap ▶ |
| 41 | **T** | "Tap the tortoise, and say it slowly with me." · ◇ rabbit |
| 50 | notice | "Listen to the very first sound…" · say /s/ · the Next hold |
| 67 | **F** + names + **S** + **R** | *"In this game, you find every picture that starts with /s/…"* · sausage, moon · the paw finds the sun · *"Ready?"* · tap ▶ |
| 83 | **T** | *"Your turn! Find the other two."* · two finds · "You found them both!…" |
| 97 | done | "You can hear the sounds in words. Brilliant listening!" |

The child makes 8 taps (3 × Ready, sock, tortoise, two finds, plus the notice hold) and says two things aloud, where today they make 5 taps. The rabbit ◇ is usually dropped by the governor.

---

## 7. The "Listen!" and the ear

### 7.1 Where

**Dojo.tsx `Learn`, lines 440–447:**

```ts
const welcome = !first ? null : isDue("dojo:welcome", "twice") ? "dojo:welcome" : isDue("dojo:back", "short") ? "dojo:back" : null;
…
intro.push({ line: "listen" }, { gap: 150 }, { sound: p }, { gap: 500 }, { sound: p }, { gap: 400 });
```

The first dojo with new sounds is `w2-1` (/b/ /k/ /g/ /h/) on the warm-up path, and every school path's first lesson is a cut of one. The frozen-build transcript of w2-1: `dojo_hello` at 0.7 s, then **"Listen…" at 6.4, 15.4, 24.4 and 33.6 s**, one for each of the four sounds, each followed by the bare sound twice. The welcome is dosed "twice", and w1-4's `audit_dojo_first` already counts as one telling (Early.tsx:1538), so the welcome is gone by a child's second or third dojo. From then on **a dojo opens with nothing but "Listen…"**.

**The ear:** in the build Jonas played (`dist/`, 19:18), the middle of the Learn screen was `<button class="btn-round dj-ear pulse" aria-label="Hear the sound">` at 230 × 230 px with `Icon.ear`, pulsing from the first moment. It turned into the letters when the spell landed. The Ninja Run's blend mode had a second ear ("Hear the sounds again", next to Home). The navigation work has since made Learn's ear the sound's petal (`<SoundBadge p size={200} pulse>`, Dojo.tsx:549) and the Run's ear a top-bar speaker. `Icon.ear` in ui.tsx:248 is now unused.

### 7.2 What it is meant to do

- **Sound before spelling.** Sounds~Write goes from speech to print: the child hears the new sound first (twice, pure), then sees how we spell it, then says it while tapping the spelling ("say it with me"). The code says so: "sound first: hear it (twice), then see how we spell it" (Dojo.tsx:442).
- **"Listen…" is the carrier for a joined sound.** A pure sound can't be generated inside a sentence, so it is joined after a lead-in recorded to end suspended on "…" (FIRST_MINUTES §12 rule 2). `listen` "Listen..." is the shortest such lead-in, and SCRIPT_STYLE §5.1 keeps "Listen…" as a routine to say "always" before a stretched word, because it points the ear.
- **The ear (now the petal) was the replay control.** Tap it to hear the sound again, the Learn's own Hear it again before the nav row existed. It pulsed to invite a tap, but nothing ever said what it was.

### 7.3 Why it lands as a weird shout

1. **It is the whole instruction, at the start.** A technical carrier line became the lesson's opening words, with no frame before it (what we are about to do, and why) and no sentence around it.
2. **It is one word at a sentence's loudness.** The clip is 0.76 s long and normalised like every whole sentence: −16.0 LUFS integrated, the same as "And this is how we spell it." (−16.2) and "Tap it, and say it with me!" (−16.0). Its true peak is −3.1 dBFS against −5.2 for the spelling line. A single stressed syllable carrying a sentence's loudness sounds like a bark.
3. **A big unexplained thing pulses at the child.** A 230 px ear (now a 200 px petal) beats in the middle of the screen while Sensei hasn't said what it is or whether to tap it. A child who taps it gets the sound again, which cuts across the explanation (the code protects only the spelling explanation from taps, not the intro).
4. **It repeats with the same shape for every sound** ("Listen… · And this is how we spell it · Tap it, and say it with me!" four times in 35 s): SCRIPT_STYLE §11.1's finding, seen from the child's side.

### 7.4 The fix (mechanics; the words are the script designer's)

1. **The Dojo gets a frame and a Ready? on its full and recap forms** (G17 in §6.3). The first sound then arrives as a teacher says it: *"Here's your first new sound. Listen carefully…"* /b/ … /b/. The carrier is still a lead-in ending on "…", but inside a whole sentence that says what is coming.
2. **No bare `listen` ever opens a game, a beat or a level.** It stays allowed inside a correction (Find's "That's /d/. Listen… /b/"), in idle re-asks after the question has been framed (Battle, Sort), and in Help. New lead-ins (the script lane records them): *"Here's a new sound. Listen…"*, *"Here's the next one. Listen…"*, *"Last one! Listen…"*, all ending suspended.
3. **The petal doesn't pulse before it has been explained.** It appears with its introduction animation *on* the sound (SD §4.6: the mist wipes, the colour fills, the picture pops). It pulses only after Sensei has said, once per save: *"That's the sound's petal. Tap it to hear the sound again."* (a spaced tip, like `tut_speaker`). Until the first spelling explanation has finished, a tap on it nods and waits (the rule the spelling already has).
4. **Loudness:** one-word lead-ins (`listen`, `listen_again`, `thats`) get matched to sit about 3 LU under the sentences around them (a `gen-audio.ts` rule for clips under 1.2 s). Better still, replace them with whole-sentence lead-ins as in 2.
5. **Delete `Icon.ear`** once nothing uses it (ui.tsx, F1's file; low priority).

---

## 8. Changes by file and lane (for FIX_PLAN_PERF_SCRIPT_SOUNDS.md)

This work fits the fix plan's lanes. None of it touches `src/core`.

| Lane (plan §2) | File | Change |
|---|---|---|
| F2 Voice | `src/content/games.ts` (new, F2's) | the registry (§5.1): ids, `mech:` ids, frame/show/ready line ids per form, `demoOwnPictures`, `readyAt`, canonical demos |
| F2 Voice | `src/content/narrative.ts` (+ test) | `GameExposure`, `frameForm`, `GAME_TELLINGS`, `GAME_REFRESH_MS` (§5.2) on top of SF A1's session spacing |
| F2 Voice | `src/scenes/narrate.tsx` | `gameForm(id)`, `framed(id)`, `played(id, { struggled })`, the migration of old saves and of `dojo:welcome`/`dojo:back`/`dojo:first` (§5.3) |
| F2 Voice | `src/content/lines.ts` (a new block "Teacher voice", the script designer's lines) | the frames, the narrated shows, `tv_ready_q_long`, `tv_ready_q`, `tv_ready_now`, `tv_offer_show`, `tv_offer_show_miss`, the Learn lead-ins; recorded as whole sentences |
| F3 Petals | `src/ui/nav.tsx`, `src/styles/nav.css` | `holdReady()`, `readyTap()`, `NAV_SLOTS.column.show`, `ShowAgainButton pulse`, the spotlight on ▶ and the paw for the long form (§4.6) |
| F1 Perf | `src/ui/Ninja.tsx`, `src/ui/poses.ts` | the `bow` move (and pose, falling back to `ready` plus a hop); `pose("ready")` facing the arrow |
| Art | `hero_<kai\|suki>_bow` | *"the same character bowing respectfully in the ninja way, fists together in front of the chest, facing the viewer"* (sprite style, like the other move poses) |
| C2 Warm-ups | `Warmup.tsx`, `warmups.ts` | §6.1: frames, narrated shows, `holdReady` in place of `youTry()` on full/recap; the governor never skips a full-form show; re-measured `secs`, targets and caps (§5.4); `readyTap()` from `earlyTap` |
| C1 Early | `Early.tsx` | §6.2: `usePickGame.present()` and `BuildSequence` frames and `holdReady`; the `ido`/`wedo`/`youdo` pushes go; `readyTap()` from `choose` when busy |
| D1 Dojo | `Dojo.tsx` | §6.3 and §7.4: the Learn frame and **R**, the lead-ins, no bare `listen` opener, the petal's pulse after its tip; `Build`'s I do on full/recap |
| D2–D6 | `Battle.tsx`, `Swap.tsx`, `Sort.tsx`, `Run.tsx`, `Story.tsx` | §6.4 |
| F4 Checks | `scripts/treadmill/*` | §9 |
| P3 Integration | `docs/DECISIONS.md`, `ARCHITECTURE.md` §6.2 note, `FIRST_MINUTES.md` and `NAVIGATION.md` amendments | §10 |

---

## 9. Checks (scripts/treadmill, F4)

- **`unframed-turn`** (major; a blocker in the first-session cases). In a fresh-profile continuous run, the first turn of each game id must be preceded in its beat by, in this order:
  - a frame line (tag `frame:<id>`);
  - the show (a paw event), when the game has one;
  - a `ready` hold (`__snNavLog` kind `ready`);

  and all of them before the question. On a second play in the same session there must be no frame line: `over-framed`, minor.
- **`bare-listen`** (major). A `listen` clip that is the first clip of a beat or level, or that follows at least 1.5 s of silence with no sentence before it in the same `say()`.
- **`talk-before-action`** (major, per age band). Game-time talk from a game's first line to the child's first tap (Ready counts) must be ≤ 12 s at age 3 (the `none`/`unsure` bands) and ≤ 15 s at age 4 (R).
- **`auto-advance`** (existing) covers the Ready hold: it may end only on `next`, `home`, a board tap, or `show` followed by `next`.
- **transcript.ts:** write each hold as `[ready: <id>: TAP Next after 1.4 s]` (or `TAP Show me again`, `TAP board: sock`), so the audit sees the new rhythm. first-minutes.ts: a "Ready" column beside "Holds on Next".
- **bot.ts:** a `watcher` persona that taps the paw once at every Ready hold (it tests the replay and "Ready now?").
- **script-audit.ts:** the frame coverage per game (full, recap, short, none) in the continuous runs, against §3.2.

---

## 10. Decisions taken here (for docs/DECISIONS.md, by integration) and risks

1. **The readiness answer is ▶ (Next) plus the paw, in their nav-row slots, and a board tap also counts.** There is no new central button and no tappable ninja (HERO.md's ninja zone stays untouchable). Why: two controls the child already knows, a real two-way answer, the idle nudge already built, and no board covered.
2. **Readiness only on full and recap forms, after the show.** Jonas's first "Are you ready?" (before the show) is rhetorical and gets no tap. Why: taps where they help, not on every play.
3. **FIRST_MINUTES §3 rule 3 ("no mode announcements") is superseded.** Announcing what comes next is fine as a teacher's whole sentence ("I'll go first. Then it's your turn."), and bare labels ("Watch me first!", "Now you try!") go. Why: Jonas, 26 Sep evening.
4. **NAVIGATION rule 3 is amended.** "A show may lead straight into a turn" becomes: on a game's full or recap form the show leads into a Ready? hold, and the turn follows the child's answer.
5. **ARCHITECTURE §6.2's `mech:` row:** "Then" is a short reminder at the first use in a session, and none after that in the session.
6. **The governor never skips a first-meeting frame, show or Ready?** `skipDemo` applies to recap shows only.
7. **W1 target about 100 s, cap 115 s; W2 about 75 s, cap 90 s** (re-measured by the bot before they are fixed). The title-to-map cap is 5:15, and Reward 2 is one step on the first session. *(Amended: TEACHER_SCRIPT T22 moves the cap to 5:30; C2's bot measured about 7:10 for a quick child on 27 Sep, an open question in docs/DECISIONS.md.)*
8. **Every Ninja Run keeps its start tap** (the starting gun), even on the short form.
9. **The Dojo's `Build` gets the I do on its full and recap forms**, so a school-path child sees a word built before building one.

**Risks:**
- *Too much talk again.* Mitigations:
  - the `talk-before-action` check;
  - frames of one or two short sentences;
  - no frames on repeat plays in a session;
  - the Ready tap breaks every long run of talk.
- *A 3-year-old ignores ▶ and taps the cards:* covered, a board tap is Ready.
- *A child always taps the paw:* no limit, and no harm; the 24 s offer only comes once.
- *More taps in the first five minutes* (§5.4): they are the child's own turns, which Round 13 asked for; the budget moves by about 25 s.
- *The fix plan has not started:* this adds work to F2, F3, C1, C2, D1–D6 and F4. Each change stays inside that lane's own files, except the new `games.ts`, which F2 owns.
