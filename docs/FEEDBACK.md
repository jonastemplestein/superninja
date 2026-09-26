# Feedback backlog

Every piece of feedback from Jonas, in the order received, with its status. ✅ done · 🔨 in progress · ⏳ queued · 🅿️ parked

## Round 1 (after first iPhone play)
- ✅ The /a/ sound was high-pitched and breathy, not a normal teacher "a". All vowels and 23 words were re-recorded with a pitch check (170–290 Hz).
- ✅ The screen zoomed weirdly when a monster hit you (screen-shake overwrote the stage scale).
- 🔨 Play from the home screen with no browser chrome. The manifest and iOS meta tags are done, and a tip is shown in Safari. iPhone Safari cannot hide its bars without an install. See round 3.
- ✅ Time pressure came too early and was scary. Early battles now have no timer; this is being reworked into Gem Trials (round 2).
- 🅿️ Work out the child's real level (parked by Jonas, then asked for in round 2 as a "get to know you" mini-game).

## Round 2 (gems, landing page)
- ✅ The timer is something you *earn*. You practise a spelling until its gem is full of energy, then take a timed Gem Trial to win the gem.
- 🔨 A petal-chart model: each petal is one sound (the /ae/ petal), and its gems are that sound's spellings (ai, ay, ea, a‑e …). All gems place the petal into the flower, and a complete flower beats the game. (The PDF mentioned never arrived; this is modelled on the published Sounds~Write Extended Code progression.)
- ✅ A starting-level "get to know you" mini-game (Show Sensei).
- ✅ A very strong landing page: story, mechanics and narrative, artsy, gameplay videos on a phone, free with no accounts, UK phonics, linked to Sounds~Write (no logo without permission, since it is a registered trade mark).
- ✅ A repeatable release process (`scripts/release.sh`, (docs/RELEASING.md) to go from each game version to an updated landing page and videos.

## Round 3 (map, bubbles, phone ergonomics)
- ✅ The map never makes it clear what to tap. The next stone is now big, gold and bouncing with a pointing hand, tapping the ninja also opens it, and locked stones recede.
- ✅ Speech bubbles cover the things that need tapping. Captions are now off by default (players can't read yet), and the map Sensei is voice-only.
- 🔨 Browser chrome gets in the way.
- ✅ Kids drag instead of tapping. Buttons now act on finger-down, and page drag, pinch-zoom and long-press are blocked.
- ✅ Tap targets near the top and bottom screen edges trigger iPhone system gestures. The game now fits inside a safe box away from the edges on touch screens.

## Round 4
- ✅ When the game is minimised, iPhone shows a media player. All sound now pauses when hidden, and the silent-audio trick was removed.
- ✅ One big, consistent help button on every screen that says what to do. Pressing it repeatedly gives more and more hints.
- ✅ A tutorial that teaches how the UI works (tapping, the help button, tiles, replay) and checks the child can use it.
- 🔨 32 petals is wrong; there are 44 sounds. The flower now has all 44 petals and 183 gems. The petal-chart PDF is still needed to match the look exactly.

## Round 5
- ✅ The landing page should show screenshots as well as videos.
- ✅ Introduce different spellings of the same sound early. There are now "same sound, different spelling" sorting levels from world 3 (c/k, l/ll, s/ss) and world 5 (c/k/ck, ch/tch), and Sensei points out each new spelling of a sound the child already knows.
- ✅ A Word Book: a scrapbook that collects the words a child has learned, with pictures.

## Round 6 (petal chart PDFs, villain, website sound)
- ✅ Model the petals on the school's laminated Extended Code sheet (two A4 pages of teardrop petals, each with an outline colour, a little picture, and its spellings stacked inside), with a glow-up. Source: Yr1/Yr2 parents' presentation, p23.
- ✅ Make it clear which character is speaking (animated portrait, name).
- ✅ Baron Muddle must look obviously evil and his arrivals must feel menacing. He was mistaken for the dojo master.
- ✅ The website and its videos should have sound from the start, even before playing.

## Round 7
- ✅ Title-screen ninjas overlapped.
- ✅ A "Get ready" page before playing: install / full screen on Android, Share → Add to Home Screen on iPhone.
- ✅ "Tap…" ran into the target word ("tap sat"). Prompts are now said once, with a pause, and then just the word.
- ✅ Starting-level game rebuilt from the school's own questions: which spelling makes this sound, minimal pairs (cat/cot/cap), spell a word, "which spelling of /ae/ is in rain?", and "tap every word with this sound".
- ✅ Player profiles: "Who's playing?", type a name with the real keyboard, each player's progress stored locally.
- 🔨 "Purple screen and music when pressing Play" on Jonas's iPhone. Can't reproduce in Chrome or WebKit. Added a crash screen showing the error with Try again / Choose player.
- ❓ "Remove the sort of copy. It's just…" (message cut off). Ask what to remove.

## Round 8
- ✅ "This is how we write the sound" had a stray /s/ at the end (TTS artefact). Re-recorded, and every line was audited with a blind transcription.
- ✅ The intro was confusing: no petals scattering, and the villain wasn't interacting with anyone. It is now a 7-shot storyboarded film (docs/INTRO_STORYBOARD.md): Sensei vs Baron, petals landing across the lands, confused villagers.
- ✅ Fat white borders around characters were removed from all sprites.
- ✅ The landing page must look like high-end children's art. Redesigned as an illustrated picture book with new key art.

## Round 9
- ✅ Hosted at https://superninja.templestein.com (Worker custom domain on the Jonas personal account).
- ✅ Share tags: og:video and a Twitter player card, the /watch/ player page, and film links at the bottom of the landing page.
- 🔨 A competing marketing trailer, built as a config-driven pipeline, after researching the best video and sound models (sub-agent).
- ✅ Remove all "free" wording.
- ✅ Age guidance is now 3–8.
- ✅ Baron appeared twice (cut-in portrait over his own video). The cut-in is now suppressed whenever he's on screen.
- ✅ A bearded Sensei with a female voice made no sense. Sensei Maple is now a grandmotherly female red panda (silver bun, spectacles, green robe): sprites, help-button face and mouth shapes, intro shots, landing art.

## Round 10 (lipsync, beginner progression, jump ahead, exposition)
- ✅ Real-time lipsync: 7 mouth shapes per character, driven by a frequency analyser on the speech bus (src/engine/lipsync.ts). Used on the help button, the villain cut-in and the intro.
- ✅ The Sensei in the corner didn't show when she was talking, and her face was off-centre. Face crops are now automatic, with a gold glow and sound waves while she talks.
- ✅ The jump from s, a, t to spelling three-sound words was far too fast. Bamboo Village is rebuilt sound-first (docs/PEDAGOGY.md):
  - listening, then first sound, then how that sound is written, then two-sound words, then three-sound words
  - I do / we do / you do, with stretched modelling ("mmmaaat")
  - errorless correction
  - "Who read it right?" reading checks, and middle-sound hunts
- ✅ Words 3–4 year olds don't know were replaced ("dojo" is explained first; "gem battle" replaces "trial"), and there's more exposition about words being made of sounds.
- ✅ The Sound Flower and the Word Book are introduced step by step with animations the first time.
- ✅ Jump ahead: the grown-ups area and the reward screen offer "end of Reception / Year 1 / Year 2" start points. The progression is built from units, so any start point works.
- ✅ Intro pacing and AV sync: every shot is re-cut so its key action lands on its narration word (Whisper-timed), and the in-game film reads public/a/v/intro_timing.json. The pandas are redrawn in the game's art style.
- ✅ "Hear the word" card for words without a picture is now one big bouncing listen button.
- ✅ The hint glow was too faint to notice; it's now a steady gold ring that bobs.
- ✅ A rest nudge ("Ninjas need rest too") for little ones after about 12 minutes.

## Round 11 (feedback treadmill)
- ✅ "How can you get a super tight feedback loop… put bots on a treadmill that produces feedback so humans don't have to." Built `scripts/treadmill/` (docs/TREADMILL.md):
  - fast-forward mode (`?fast=N`)
  - Playwright bots with invariant checks and a random-tapping monkey on every level
  - a Gemini visual critic over filmstrips (built by Codex)
  - Jev (TypeSafe's decision model, via Cloudflare AI Gateway) for linting and triage
  - Codex persona playtesters (a 3¾-year-old, an impatient 6-year-old, a Sounds~Write teacher, a parent)
  - one de-duplicated inbox, `playtest/INBOX.md`
- ✅ Use Codex (gpt-6-sol, extra-high reasoning) for well-specified tasks.
- ✅ Explore what Jev can do (docs/JEV.md). It's an excellent, stable judge of Sounds~Write wording rules and word familiarity at pennies per run. It's weak at picture naming from text, and no good as an adaptive tutor. "Use Jev in the development process, not in the product": it only runs in the treadmill.
- ✅ Fixes from the first treadmill and persona runs:
  - A Gem Trial with no words (after m and s only) stranded children. Trials now wait until three words exist.
  - Jump-ahead was lost on reload (debounced save). The reward-screen jump now needs a grown-up press-and-hold.
  - Errorless correction in battles, bosses and Swap: the first miss hears the word stretched again, the second shows "That's /s/. We need /m/."
  - The first-sound demo shows the spelling for picture-only words too, and says "This is an apple", not "a apple".
  - Captions in the early games; Kai and Suki light up when they read.
  - Decodable text in story s1; "which/witch" is no longer dictated without a picture; words with two /k/ spellings are left out of sorts; the sort highlight is now a hint rather than a giveaway.
  - Child-proofing: a child who can't type can play as "Ninja 2"; the hero choice can be changed; too-early taps wiggle; taps during the question count as answers.
  - Parents: Play fits on the first screen of a landscape phone; readable grown-ups page; "press and hold" hint on the gear; "Skip film"; clearer delete warning; profile badges.
  - Layout: a listen card for words with no picture; captions above the help button; battle slots clear of monsters; 44 px tap targets; stickers in a row; beginner runs have two lanterns; the progress bar moves item by item.
  - Pictures: a blind picture audit feeds pic-names.ts, so picture games avoid pictures children name differently (fin → "shark", wig → "hair", hot → "soup").

## Round 12 (World Flower, Sounds~Write model, full programme)
- ✅ "Why is there this pink tree?" The story is rebuilt around the **World Flower**: a many-coloured flower of sound petals at the heart of the island, which all life depends on. Baron blows it apart; islanders cower; Sensei faces him. The intro is re-directed with Gemini Omni, with several flower design iterations (sub-agent).
- 🔨 "Make our data model for challenges, evaluation and exercise generators align super closely with Sounds~Write." A typed Sounds~Write spec (concepts, skills, Initial Code, Bridging, 49 Extended Code units, Polysyllabic, lessons and error corrections) is being written from the official scope and sequence (sub-agent). The game will then be re-keyed onto it.
- 🔨 "Go all the way up to however far Sounds~Write goes": a content build-out plan for all Extended Code units and polysyllabic words. (Integration, 26 Sep: the game now follows the official order as far as its content goes: sorting starts in the Bridging Unit, and the Sky Temple runs EC1, EC2, EC4, then EC11. EC3 and the units between need words and pictures.)
- ✅ "Make the petal chart a scroll that is scrollable. Kids understand touch scrolling." One long ninja scroll you swipe through, with big petals; taps open a petal only if the finger didn't move (World Flower agent).
- ✅ "Make it a bit mysterious": sounds and spellings not yet met are hidden in mist; met-but-unwon spellings are unpolished; won gems shine. An overall progress vine along the scroll, and petals fill as their gems are won (World Flower agent).
- ✅ "Swelling epic victory music when you master a new gem": `public/a/m/gem_victory.mp3`, a 10 s sting that builds, bursts into brass and flute, and rings out. Made with `scripts/gen-sting.ts` (ElevenLabs Music via Cloudflare, 5 takes). Each take was judged 3 times with no voices allowed, plus a loudness-shape check.
- ✅ Next, once the ninja rework and the World Flower scroll land (World Flower 2.0, wired in by the integration):
  - ✅ an epic "gem mastered" sequence: winning a Gem Trial opens the World Flower, where the gem spins up, dives into its petal on the burst of the victory music, and the petal blooms
  - ✅ tapping a sound shows the words met with it (tap to hear), plus a green "Practise" gate that opens a short dojo for that spelling, then back to the flower as the gem fills
  - ✅ bring children to the flower often: after a level that first teaches spellings, and at the start of each new land (once each), in Sounds~Write teacher language with example words
- ⏳ "When you think you are done, do another few rounds of production values, motion design, polish. Kids should feel in their bones how amazing this game is. It's like dancing with phonics in an imaginary land of wonder." This becomes the closing phase after the current work: several critique → polish → verify rounds covering every screen, transition and tap, until independent reviewers find nothing that feels like a prototype.
- ✅ Left-to-right warm-up, built as warm-ups W2, W4 and W6 (reading pictures left to right, three in a row, picture words, sound dots). Not done: using it as a readiness check in the placement game. (Jonas: "games that help kids understand left to right order. Mentava … makes users 'read' images in order: a fish followed by a dog becomes 'fish dog', the other way round 'dog fish'. Then kids don't need to learn letter shapes and direction at the same time."). Mentava uses 🐶🐟 vs 🐟🐶 in its readiness check ("understanding that order matters"). Our version is a pre-letter warm-up world:
  1. **Read the pictures:** two pictures on a reading line. The ninja sweeps left to right ("Ninjas read this way!"), then the child taps them in order: fish… dog, "fish dog!". A tap on the right-hand picture first makes the arrow pulse from the left (a gentle, errorless correction).
  2. **Which did I read?:** [fish][dog] or [dog][fish]. Sensei says "dog fish", and the child picks the matching order.
  3. **Picture words:** compound words, blended orally as the first taste of blending: sun+flower, foot+ball, rain+bow, cup+cake, star+fish, pan+cake, snow+man, lady+bird, jelly+fish, butter+fly.
  4. **Three in a row**, and swapping the order ("cat dog fish" / "fish dog cat").
  5. **Bridge to letters:** sound dots under the pictures, read left to right exactly like the sound buttons under letters in Unit 1.
  It's also a quick readiness check in the placement game.
- ✅ Quota watch and auto-wake (Jonas: "keep an eye on token quota and trigger yourself to wake yourself up in herdr after session resets"):
  - `scripts/ops/statusline.py` (project-only status line) shows the 5-hour and 7-day quota and saves it.
  - `scripts/ops/wake-watchdog.py` runs in herdr tab "wake-watchdog" (pane w9V:p3) and watches this session (w9V:p1). When the session stops on a usage limit, it waits for the exact reset time and submits an auto-wake prompt.
- ✅ Loose ends from the World Flower rework (all done except the optional petal tint):
  - replace `Icon.tree` in ui.tsx (still a pink blossom) with Tree.tsx's `FlowerIcon`
  - sweep.ts: rename the tree intent to the World Flower, and skip targets that sit sideways off-screen inside a `.scrollable` container
  - record-clips.ts: show the scroll
  - optionally tint the fx petals in the chart colours

## Round 13 (Jonas playing the preview with his 3-year-old, 26 Sep)
- ✅ Picture cards are sometimes hard to recognise ("too abstract" for a 3-year-old) and sometimes weirdly clipped; every picture sits on a plain white card. Now: coloured plates chosen per picture, never clipped (a sweep invariant checks every card), no see-through dimming, living things always drawn with a face, and a 3-year-old picture audit.
- ✅ Intro film: Baron Muddle must lip-sync. (Now he speaks on screen in his real voice, with Seedance 2.5 animating from our recording. The destruction is one continuous 7.7 s take: the gloat, the fan sweep on "MINE!", the petal vortex and the laugh. The "overlay" was the talking Sensei help button glowing over the film; it now stays quiet and faded during the film.) When he destroys the flower it should be one real video clip, not one thing overlaid on another.
- ✅ When Sensei names the pictures ("This is a mat… this is a hat"), highlight the card being named. (A warm spotlight on each card while its name plays.)
- ✅ "Tap the mat" is three separate recordings spliced together; it must sound smooth (record whole sentences). Every picture in the warm-ups and the first-sound games is named and asked for in one whole sentence; only pure sounds and slow words are joined, and a new treadmill stage (`joins.ts`) asks an audio judge "one take, or joined?". Dictation ("Build the word… mat") still pauses before the word.
- ✅ Explain that there are fast and slow ways to say a word and how that works; that words are made of sounds; "notice the sound". New games: "tap all the words with /a/ in them", "tap all the words that start with /s/". (Warm-ups W1 and W3: the tortoise and the rabbit, "Words are made of sounds!", "Listen to the very first sound", tap-all games.)
- ✅ The first game was far too long for a 3-year-old: the same thing over and over, boring. (Lesson 1 is now about 90 s, Lesson 2 about 65 s, with a time governor and a hard cap.)
- ✅ Let children opt into a level on their own within about 30 seconds (a spoken school-year question with picture buttons; settles in 10–22 s; a first check moves a child back a band if it was too hard): "Are you in school yet? Which class: not yet / Reception / Year 1 / Year 2?", then set the game up accordingly and say that grown-ups can change it later in the grown-ups settings.
- ✅ The second game repeating the first is fine only if it's fast and has a really good reward (Reward 1: the pictures turn into stickers in the new Sticker Book; Reward 2: a shiny fish-dog and the first petal): a celebration after the first game, where the word cards just seen (pictures, not spellings) go into the sticker book, celebrated and introduced; then another short lesson.
- 🔨 Architecture (Jonas): logic modules separate from graphics and gameplay, each tested on its own.
  - An event log of exposures and observations (e.g. "3 s staring, 2 hints, wrong answer on this word, sound or spelling") feeds a learner model.
  - A separate exercise planner, with spaced repetition.
  - A narrative director that makes sure every interaction makes sense and challenge is right.
  - The game playable as a text adventure (Jev or bots can play it), producing transcripts of everything said and done.
  - Transcripts are audited: what's never explained, what's said once but needs three times.
  - Status:
    - `scripts/treadmill/transcript.ts` already turns bot play of today's game into text-adventure transcripts (perfect and learner personas).
    - The core architecture design workflow is running (it writes docs/ARCHITECTURE.md and src/core/types.ts).
    - Codex then builds the core with unit tests, the UI moves over to it, and the transcript audit loop runs.
- ✅ "Never ask me questions using your dumb question tool again. Never block … add big questions or decisions to a log": docs/DECISIONS.md (decisions made on Jonas's behalf, plus open questions), and saved as a standing rule.
- ✅ "Have the same let me show you, now you try mechanism in the warm ups": every warm-up game type opens with "Let me show you!" (the paw taps, the ninja moves), then "Now you try!".
- ⏳ Jonas: "make sure the home button is on any screen including tutorial. and it needs to not be possible to 'miss' something. should probs be back buttons or repeat etc in". Next workflow, after the integration lands:
  - (1) an inventory of every screen and moment: Home present? a way back? can every instruction, explanation, demo and celebration be heard again or replayed?
  - (2) one consistent pattern everywhere: Home top-left, "hear it again" beside every instruction, back and replay wherever something happens once (tutorial steps, story pages, intros, explanations, show/try demos)
  - (3) sweep.ts invariants ("home-missing", "no-replay-for-instruction") on every screen, so it can't regress
- ⏳ Jonas: "and in general best not to autoplay to next step of a presentation etc" (part of the same navigation workflow). Presentations never advance by themselves:
  - Tutorial steps, intros (World Flower, Word Book, dojo), explanations, reward and celebration sequences, story pages and the opt-in wait for the child's tap on a big pulsing Next.
  - An idle nudge (Next glows, then Sensei says "Tap the arrow when you're ready"); back and replay are always available.
  - The sweep gets an invariant that flags any scene step changing with no child input except in activities, the film and animations.
  - Also remove the first-minutes opt-in's "auto-pick after 20 s".
- ⏳ Jonas: "even the intro sequence should have buttons to go to next clip". The film also waits: each shot plays its clip and line, holds the last frame, and a big pulsing Next arrow (with back and replay) moves on. The website film is unchanged.
- 🔨 Jonas: "The phonics sounds are often wrong. Saying 'kay' instead of k (just the sound) and 'bee' instead of just the sound b etc. I think it's endemic." Confirmed objectively: /k/ has 280 ms of voicing (it should be about 0) and /b/ 310 ms (it should be ≤ 80). The Gemini blind listening we relied on was unreliable. Codex job: an objective phoneme QA (voicing, formants, loudness steps, Whisper), a rebuild of every failing sound from real word recordings (burst cuts for stops, stretched initial segments for continuants, vowel nuclei), a listening page for Jonas, and a scan of all lines for letters the TTS would read as names.
- ⏳ Jonas: "each petal has an image in the corner to illustrate the sound, because spelling sounds with letters can be confusing. I want that in the game." A sound is shown to children as its petal (chart colour plus picture) wherever it's introduced or referred to, and the petal pictures sit in the corner on the scroll like the school chart. It's part of the navigation workflow (SoundBadge).

## Round 14 (Jonas, 26 Sep evening: performance, transcript, petals, and playtesting the preschool levels with his 3- and 4-year-old)

- 🔨 "there are huge performance issues … after I play for a while, my phone melts". Diagnosed in docs/PERF.md: it isn't a particle leak. Two rAF loops never stop, the ninja's endless animations run even when hidden, and decoded audio and music elements only grow. The fixes are in docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md (lane F1).
- 🔨 "if you just look at the transcript … It just says, A, two letters, one sound, A, two letters, one sound". Confirmed: said 34 times in 25 minutes. Fixes: docs/SCRIPT_STYLE.md and SCRIPT_FIXES.md (lane F2 and the scene lanes).
- 🔨 "when showing the student a sound as opposed to a spelling, you always have to show it in the petal shape in all games with the image at the top of the petal or next to it". Audit and spec: docs/SOUND_DISPLAY.md (lane F3 and the scene lanes).
- ⏳ Playtest of the preschool levels with the 3- and 4-year-old: "this extremely abbreviated way of talking, it doesn't help at all … teachers … do way better explanations … 'So first, I'm going to show you how to do it. Are you ready? And this is how this game goes. I will show you this, and you will do that. Do you want to give it a go now?' … Or this weird shouted 'Listen!' … super weird in the first dojo level where it just starts with this, and this ear appears. Teachers explain what they're doing." So Sensei talks like a real Reception teacher:
  - frame each game ("This game is called… here's how it goes: I'll…, then you'll…")
  - narrate the demonstration ("Watch me first…")
  - check readiness ("Are you ready? Do you want to have a go?"), with a tap answer
  - explain what's happening and why, and never bark bare commands like "Listen!"
  The full framing comes the first time a game is met, then a short "Remember this one?" on later plays. The teacher-voice design workflow writes docs/TEACHER_SCRIPT.md, and the fix plan implements it.
